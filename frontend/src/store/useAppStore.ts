import { create } from 'zustand';

interface AppState {
  isSetupComplete: boolean;
  hasBusiness: boolean;
  hasOwner: boolean;
  currentSetupStep: number;
  isLoadingStatus: boolean;
  hasConnectionError: boolean;
  connectionErrorMessage: string | null;
  currentUser: { id: string; username: string; firstName: string; lastName: string; role: string; business_id: string; employee_id: string } | null;
  businessSettings: any | null;
  isLicensed: boolean;
  licenseError: string | null;
  
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

export const useAppStore = create<AppState>((set) => ({
  isSetupComplete: false,
  hasBusiness: false,
  hasOwner: false,
  currentSetupStep: 1,
  isLoadingStatus: true,
  hasConnectionError: false,
  connectionErrorMessage: null,
  currentUser: null,
  businessSettings: null,
  isLicensed: true,
  licenseError: null,

  setSetupStep: (step) => set({ currentSetupStep: step }),

  markBusinessCreated: () => set({ hasBusiness: true, currentSetupStep: 3 }),
  
  markOwnerCreated: () => set({ hasOwner: true, isSetupComplete: true, currentSetupStep: 4 }),

  login: (user) => set({ currentUser: user }),
  
  logout: () => set({ currentUser: null }),
  
  updateBusinessSettings: (settings) => set({ businessSettings: settings }),

  checkSetupStatus: async (retryCount = 0): Promise<boolean> => {
    set({ isLoadingStatus: true });
    try {
      const res = await fetch('/api/business/status');
      if (!res.ok) throw new Error(`Backend responded with HTTP status ${res.status}`);
      const data = await res.json();
      
      const licenseRes = await fetch('/api/license/status').catch(() => null);
      let licenseData = { allowed: true, reason: null };
      if (licenseRes && licenseRes.ok) {
        try {
          licenseData = await licenseRes.json();
        } catch (e) {}
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
          isLicensed: licenseData.allowed,
          licenseError: licenseData.reason
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
      if (retryCount < 8) {
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
    // We can't access currentUser directly without get(), so we update the store creator to use (set, get)
    // We'll rewrite the create call in a separate edit if needed, or just use useAppStore.getState()
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser?.business_id) return;
    
    try {
      const res = await fetch(`/api/dashboard/unpaid-counts?business_id=${currentUser.business_id}`);
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
}));
