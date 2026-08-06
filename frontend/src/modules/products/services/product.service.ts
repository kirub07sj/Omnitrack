import axios from 'axios';
import { Product } from '../types/product';

export const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    if (!businessId) throw new Error("No business selected");
    
    const response = await axios.get(`/api/products`, {
      params: { business_id: businessId }
    });
    
    return response.data.map((prod: any) => ({
      ...prod,
      businessId: prod.business_id,
      categoryId: prod.category_id,
      inventory_item_id: prod.inventory_item_id,
      trackInventory: prod.track_inventory,
      minStock: prod.min_stock,
      imageUrl: prod.image_url,
      createdAt: prod.created_at,
      updatedAt: prod.updated_at
    }));
  },
  
  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const prod = response.data;
      return {
        ...prod,
        businessId: prod.business_id,
        categoryId: prod.category_id,
        inventory_item_id: prod.inventory_item_id,
        trackInventory: prod.track_inventory,
        minStock: prod.min_stock,
        imageUrl: prod.image_url,
        createdAt: prod.created_at,
        updatedAt: prod.updated_at
      };
    } catch (error: any) {
      if (error.response?.status === 404) return undefined;
      throw new Error("Failed to fetch product");
    }
  },

  createProduct: async (data: any): Promise<Product> => {
    const businessId = "a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6";
    if (!businessId) throw new Error("No business selected");

    const payload = { 
      business_id: businessId,
      category_id: data.categoryId,
      inventory_item_id: data.inventory_item_id || null,
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      description: data.description,
      price: data.price,
      cost: data.cost,
      unit: data.unit,
      track_inventory: data.trackInventory,
      min_stock: data.minStock,
      image_url: data.imageUrl,
      status: data.status
    };

    const response = await axios.post(`/api/products`, payload);
    return response.data;
  },

  updateProduct: async (id: string, data: any): Promise<Product> => {
    const payload = {
      category_id: data.categoryId,
      inventory_item_id: data.inventory_item_id || null,
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      description: data.description,
      price: data.price,
      cost: data.cost,
      unit: data.unit,
      track_inventory: data.trackInventory,
      min_stock: data.minStock,
      image_url: data.imageUrl,
      status: data.status
    };
    
    // Remove undefined values
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    const response = await axios.put(`/api/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete(`/api/products/${id}`);
  }
};
