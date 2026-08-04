import { create } from 'zustand';

interface AppState {
  isSetupComplete: boolean;
  hasBusiness: boolean;
  hasOwner: boolean;
  currentSetupStep: number;
  isLoadingStatus: boolean;
  
  setSetupStep: (step: number) => void;
  checkSetupStatus: () => Promise<void>;
  markBusinessCreated: () => void;
  markOwnerCreated: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSetupComplete: false,
  hasBusiness: false,
  hasOwner: false,
  currentSetupStep: 1,
  isLoadingStatus: true,

  setSetupStep: (step) => set({ currentSetupStep: step }),

  markBusinessCreated: () => set({ hasBusiness: true, currentSetupStep: 3 }),
  
  markOwnerCreated: () => set({ hasOwner: true, isSetupComplete: true, currentSetupStep: 4 }),

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
      }
    } catch (e) {
      console.error("Failed to fetch setup status", e);
      set({ isLoadingStatus: false });
    }
  }
}));
