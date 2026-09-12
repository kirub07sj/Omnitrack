import axios from 'axios';
import { Category } from '../types/category';
import { useAppStore } from '@/store/useAppStore';

const mapCategory = (c: any): Category => ({
  id: c.id,
  name: c.name,
  businessId: c.business_id || c.businessId,
  description: c.description,
  status: c.status || 'Active'
});

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    const businessId = useAppStore.getState().currentUser?.business_id;
    const response = await axios.get('/api/categories', {
      params: businessId ? { business_id: businessId } : undefined
    });
    return (Array.isArray(response.data) ? response.data : []).map(mapCategory);
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    try {
      const response = await axios.get(`/api/categories/${id}`);
      return mapCategory(response.data);
    } catch {
      const categories = await CategoryService.getCategories();
      return categories.find(c => c.id === id);
    }
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await axios.post('/api/categories', {
      name: data.name,
      description: data.description,
      status: data.status || 'Active'
    });
    return mapCategory(response.data);
  },

  updateCategory: async (id: string, data: any): Promise<Category> => {
    const response = await axios.put(`/api/categories/${id}`, data);
    return mapCategory(response.data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`/api/categories/${id}`);
  }
};
