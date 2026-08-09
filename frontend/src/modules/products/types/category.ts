export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  status: 'Active' | 'Inactive' | string;
}
