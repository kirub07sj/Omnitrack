import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch, isCloudMode, clearAuthToken } from '@/lib/api';

interface AppState {
  isSetupComplete: boolean;
  hasBusiness: boolean;
  hasOwner: boolean;
  currentSetupStep: number;
  isLoadingStatus: boolean;
  hasConnectionError: boolean;
  connectionErrorMessage: string | null;
  currentUser: { id: string; username: string; firstName: string; lastName: string; role: string; business_id: string; employee_id: string; is_super_admin?: boolean; email?: string } | null;
  businessSettings: any | null;
  isLicensed: boolean;
  licenseError: string | null;
  isCloud: boolean;
  
  setSetupStep: (step: number) => void;
  checkSetupStatus: (retryCount?: number) => Promise<boolean>;
  markBusinessCreated: () => void;
  markOwnerCreated: () => void;
  login: (user: any) => void;
  logout: () => void;
  updateBusinessSettings: (settings: any) => void;
  
  unpaidCounts: { sales: number; expenses: number; purchases: number };
  fetchUnpaidCounts: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  isSetupComplete: false,
  hasBusiness: false,
  hasOwner: false,
  currentSetupStep: 1,
  isLoadingStatus: true,
  hasConnectionError: false,
  connectionErrorMessage: null,
  currentUser: null,
  businessSettings: null,
  isLicensed: !isCloudMode,
  licenseError: null,
  isCloud: isCloudMode,

  setSetupStep: (step) => set({ currentSetupStep: step }),

  markBusinessCreated: () => set({ hasBusiness: true, currentSetupStep: 3 }),
  
  markOwnerCreated: () => set({ hasOwner: true, isSetupComplete: true, currentSetupStep: 4 }),

  login: (user) => set({ currentUser: user }),

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed', e);
    }
    if (isCloudMode) {
      clearAuthToken();
    }
    set({ currentUser: null });
  },
  
  updateBusinessSettings: (settings) => set({ businessSettings: settings }),

  checkSetupStatus: async (retryCount = 0): Promise<boolean> => {
    set({ isLoadingStatus: true });
    try {
      const res = await apiFetch('/api/business/status');
      if (!res.ok) throw new Error(`Backend responded with HTTP status ${res.status}`);
      const data = await res.json();

      let licenseData = { allowed: true, reason: null };
      if (!isCloudMode) {
        const licenseRes = await apiFetch('/api/license/status').catch(() => null);
        if (licenseRes && licenseRes.ok) {
          try {
            licenseData = await licenseRes.json();
          } catch (e) {}
        }
      }

      if (data.success) {
        let step = 2;
        if (data.hasBusiness && !data.hasOwner) step = 3;
        if (data.hasBusiness && data.hasOwner) step = 4;

        set({ 
          isSetupComplete: data.isSetup,
          hasBusiness: data.hasBusiness,
          hasOwner: data.hasOwner,
          currentSetupStep: step,
          isLoadingStatus: false,
          hasConnectionError: false,
          connectionErrorMessage: null,
          businessSettings: data.business || null,
          isLicensed: isCloudMode ? true : licenseData.allowed,
          licenseError: isCloudMode ? null : licenseData.reason
        });
        return true;
      } else {
        set({ 
          isLoadingStatus: false,
          hasConnectionError: true,
          connectionErrorMessage: data.message || 'Unknown response from server'
        });
        return false;
      }
    } catch (e: any) {
      if (retryCount < 8 && !isCloudMode) {
        await new Promise((r) => setTimeout(r, 800));
        return useAppStore.getState().checkSetupStatus(retryCount + 1);
      } else {
        console.error("Failed to fetch setup status", e);
        set({ 
          isLoadingStatus: false,
          hasConnectionError: true,
          connectionErrorMessage: e?.message || 'Failed to connect to backend service'
        });
        return false;
      }
    }
  },

  unpaidCounts: { sales: 0, expenses: 0, purchases: 0 },
  
  fetchUnpaidCounts: async () => {
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser?.business_id) return;

    try {
      const res = await apiFetch(`/api/dashboard/unpaid-counts?business_id=${currentUser.business_id}`);
      const data = await res.json();
      if (data.success) {
        set({
          unpaidCounts: {
            sales: data.data.unpaidSales,
            expenses: data.data.unpaidExpenses,
            purchases: data.data.unpaidPurchases
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch unpaid counts", error);
    }
  }
    }),
    { name: 'omnitrack-auth-store' }
  )
);
