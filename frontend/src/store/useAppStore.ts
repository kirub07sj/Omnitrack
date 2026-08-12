import { create } from 'zustand';

interface AppState {
  isSetupComplete: boolean;
  hasBusiness: boolean;
  hasOwner: boolean;
  currentSetupStep: number;
  isLoadingStatus: boolean;
  currentUser: { id: string; username: string; firstName: string; lastName: string; role: string; business_id: string; employee_id: string } | null;
  businessSettings: any | null;
  
  setSetupStep: (step: number) => void;
  checkSetupStatus: () => Promise<void>;
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
  currentUser: null,
  businessSettings: null,

  setSetupStep: (step) => set({ currentSetupStep: step }),

  markBusinessCreated: () => set({ hasBusiness: true, currentSetupStep: 3 }),
  
  markOwnerCreated: () => set({ hasOwner: true, isSetupComplete: true, currentSetupStep: 4 }),

  login: (user) => set({ currentUser: user }),
  
  logout: () => set({ currentUser: null }),
  
  updateBusinessSettings: (settings) => set({ businessSettings: settings }),

  checkSetupStatus: async () => {
    set({ isLoadingStatus: true });
    try {
      const res = await fetch('/api/business/status');
      const data = await res.json();
      
      if (data.success) {
        let step = 1;
        if (data.hasBusiness && !data.hasOwner) step = 3;
        if (data.hasBusiness && data.hasOwner) step = 4;

        set({ 
          isSetupComplete: data.isSetup,
          hasBusiness: data.hasBusiness,
          hasOwner: data.hasOwner,
          currentSetupStep: step,
          isLoadingStatus: false,
          businessSettings: data.business || null
        });
      } else {
        set({ isLoadingStatus: false });
      }
    } catch (e) {
      console.error("Failed to fetch setup status", e);
      set({ isLoadingStatus: false });
    }
  },

  unpaidCounts: { sales: 0, expenses: 0, purchases: 0 },
  
  fetchUnpaidCounts: async () => {
    // We can't access currentUser directly without get(), so we update the store creator to use (set, get)
    // We'll rewrite the create call in a separate edit if needed, or just use useAppStore.getState()
    const currentUser = useAppStore.getState().currentUser;
    if (!currentUser?.business_id) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/unpaid-counts?business_id=${currentUser.business_id}`);
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
