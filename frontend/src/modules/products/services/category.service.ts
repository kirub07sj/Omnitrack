import { Category } from '../types/category';

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    return [
      { id: "Food", name: "Food", businessId: "none", status: "Active" },
      { id: "Beverages", name: "Beverages", businessId: "none", status: "Active" },
      { id: "Desserts", name: "Desserts", businessId: "none", status: "Active" },
      { id: "Snacks", name: "Snacks", businessId: "none", status: "Active" },
      { id: "Combos", name: "Combos", businessId: "none", status: "Active" }
    ];
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const categories = await CategoryService.getCategories();
    return categories.find(c => c.id === id);
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    return data as Category;
  },

  updateCategory: async (_id: string, data: any): Promise<Category> => {
    return data as Category;
  },

  deleteCategory: async (_id: string): Promise<void> => {
    return;
  }
};
