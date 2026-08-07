export type InventoryStatus = "Active" | "Inactive";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  cost_per_unit: number;
  status: InventoryStatus;
  supplier_id?: string;
}
