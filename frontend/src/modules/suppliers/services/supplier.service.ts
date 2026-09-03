import { Supplier } from "../types/supplier";
import { useAppStore } from "@/store/useAppStore";
import { apiFetch } from '@/lib/api';

export const SupplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const businessId = useAppStore.getState().currentUser?.business_id;
    if (!businessId) throw new Error("No business selected");
    
    const response = await apiFetch(`/api/suppliers?business_id=${businessId}`);
    if (!response.ok) throw new Error("Failed to fetch suppliers");
    return response.json();
  },
  
  getSupplierById: async (id: string): Promise<Supplier | undefined> => {
    const response = await apiFetch(`/api/suppliers/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error("Failed to fetch supplier");
    }
    return response.json();
  },

  createSupplier: async (data: any): Promise<Supplier> => {
    const businessId = useAppStore.getState().currentUser?.business_id;
    const payload = { ...data, business_id: businessId };

    const response = await apiFetch(`/api/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Failed to create supplier");
    return response.json();
  },

  updateSupplier: async (id: string, data: any): Promise<Supplier> => {
    const response = await apiFetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error("Failed to update supplier");
    return response.json();
  },

  deleteSupplier: async (id: string): Promise<void> => {
    const response = await apiFetch(`/api/suppliers/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete supplier");
  }
};
