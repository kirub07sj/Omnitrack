import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface ProductState {
  products: any[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: (businessId: string, silent?: boolean) => Promise<void>;
  updateProductLocally: (id: string, updates: any) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (businessId: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await apiFetch(`/api/products?business_id=${businessId}&t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data && Array.isArray(data.products)) items = data.products;
      else if (data && Array.isArray(data.data)) items = data.data;

      set({ products: items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProductLocally: (id: string, updates: any) => {
    set((state) => ({
      products: state.products.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  }
}));
