import axios from 'axios';
import { Category } from '../types/category';

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    if (!businessId) throw new Error("No business selected");
    
    const response = await axios.get(`/api/categories`, {
      params: { business_id: businessId }
    });
    
    return response.data.map((cat: any) => ({
      ...cat,
      businessId: cat.business_id
    }));
  },
  
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    try {
      const response = await axios.get(`/api/categories/${id}`);
      const cat = response.data;
      return {
        ...cat,
        businessId: cat.business_id
      };
    } catch (error: any) {
      if (error.response?.status === 404) return undefined;
      throw new Error("Failed to fetch category");
    }
  },

  createCategory: async (data: any): Promise<Category> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    if (!businessId) throw new Error("No business selected");

    const payload = { 
      business_id: businessId,
      name: data.name,
      description: data.description,
      status: data.status
    };

    const response = await axios.post(`/api/categories`, payload);
    return response.data;
  },

  updateCategory: async (id: string, data: any): Promise<Category> => {
    const payload = {
      name: data.name,
      description: data.description,
      status: data.status
    };
    
    // Remove undefined values
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    const response = await axios.put(`/api/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`/api/categories/${id}`);
  }
};
