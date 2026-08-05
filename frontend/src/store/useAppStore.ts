import { create } from 'zustand';

interface AppState {
  isSetupComplete: boolean;
  hasBusiness: boolean;
  hasOwner: boolean;
  currentSetupStep: number;
  isLoadingStatus: boolean;
  currentUser: { id: string; username: string; firstName: string; lastName: string; role: string } | null;
  
  setSetupStep: (step: number) => void;
  checkSetupStatus: () => Promise<void>;
  markBusinessCreated: () => void;
  markOwnerCreated: () => void;
  markEmployeesDone: () => void;
  markProductsDone: () => void;
  login: (user: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSetupComplete: false,
  hasBusiness: false,
  hasOwner: false,
  currentSetupStep: 1,
  isLoadingStatus: true,
  currentUser: null,

  setSetupStep: (step) => set({ currentSetupStep: step }),

  markBusinessCreated: () => set({ hasBusiness: true, currentSetupStep: 3 }),
  
  markOwnerCreated: () => set({ hasOwner: true, currentSetupStep: 4 }),

  markEmployeesDone: () => set({ currentSetupStep: 5 }),

  markProductsDone: () => set({ isSetupComplete: true, currentSetupStep: 6 }),

  login: (user) => set({ currentUser: user }),
  
  logout: () => set({ currentUser: null }),

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
          isLoadingStatus: false
        });
      } else {
        set({ isLoadingStatus: false });
      }
    } catch (e) {
      console.error("Failed to fetch setup status", e);
      set({ isLoadingStatus: false });
    }
  }
}));
