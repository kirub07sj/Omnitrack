export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  price: number;
  cost?: number | null;
  unit?: string | null;
  trackInventory: boolean;
  minStock?: number | null;
  imageUrl?: string | null;
  status: 'Active' | 'Inactive' | string;
  createdAt?: string;
  updatedAt?: string;
  category?: any;
}
