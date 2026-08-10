import { InventoryItem } from "../types/inventory";

export const InventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    if (!businessId) throw new Error("No business selected");
    
    const response = await fetch(`/api/inventory?business_id=${businessId}`);
    if (!response.ok) throw new Error("Failed to fetch inventory");
    return response.json();
  },
  
  getInventoryById: async (id: string): Promise<InventoryItem | undefined> => {
    const response = await fetch(`/api/inventory/${id}`);
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error("Failed to fetch inventory item");
    }
    return response.json();
  },

  createInventory: async (data: any): Promise<InventoryItem> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    const payload = { ...data, business_id: businessId };

    const response = await fetch(`/api/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Failed to create inventory item");
    return response.json();
  },

  updateInventory: async (id: string, data: any): Promise<InventoryItem> => {
    const response = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error("Failed to update inventory item");
    return response.json();
  },

  deleteInventory: async (id: string): Promise<void> => {
    const response = await fetch(`/api/inventory/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete inventory item");
  },

  getPurchases: async (): Promise<any[]> => {
    const appStorage = JSON.parse(localStorage.getItem('app-storage') || '{}');
    const businessId = appStorage.state?.currentUser?.business_id || "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    const response = await fetch(`/api/purchases?business_id=${businessId}`);
    if (!response.ok) throw new Error("Failed to fetch purchases");
    return response.json();
  },

  createPurchase: async (data: any): Promise<any> => {
    const appStorage = JSON.parse(localStorage.getItem('app-storage') || '{}');
    const businessId = appStorage.state?.currentUser?.business_id || "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    const payload = { ...data, business_id: businessId };

    const response = await fetch(`/api/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Failed to create purchase");
    return response.json();
  },

  updatePurchaseStatus: async (id: string, status: string): Promise<any> => {
    const response = await fetch(`/api/purchases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error("Failed to update purchase status");
    return response.json();
  },

  getMovements: async (): Promise<any[]> => {
    const appStorage = JSON.parse(localStorage.getItem('app-storage') || '{}');
    const businessId = appStorage.state?.currentUser?.business_id || "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    const response = await fetch(`/api/inventory/movements?business_id=${businessId}`);
    if (!response.ok) throw new Error("Failed to fetch movements");
    return response.json();
  }
};
