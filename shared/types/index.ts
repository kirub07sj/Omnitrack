// Shared TypeScript interfaces for OmniTrack
// These types mirror the Prisma schema and are used across desktop and cloud products

export interface Business {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo?: string | null;
  currency?: string | null;
  is_kitchen_active: boolean;
  tax_rate?: number | null;
  owner_name?: string | null;
  settings?: string | null; // JSON string
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  age?: number | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  national_id?: string | null;
  emergency_contact?: string | null;
  employee_number?: string | null;
  position?: string | null;
  department?: string | null;
  salary?: number | null;
  employment_type?: string | null;
  hire_date?: Date | string | null;
  status?: string | null;
}

export interface User {
  id: string;
  business_id: string;
  employee_id: string;
  role_id: string;
  username: string;
  password_hash: string;
  status?: string | null;
  last_login?: Date | string | null;
  // Relations (optional, populated on demand)
  role?: Role;
  employee?: Employee;
  business?: Business;
}

export interface RestaurantTable {
  id: string;
  business_id: string;
  table_number: string;
  capacity?: number | null;
  status?: string | null;
  waiter_id?: string | null;
  waiter?: Employee | null;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  status: string; // Active, Inactive
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  inventory_item_id?: string | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  price: number;
  cost?: number | null;
  unit?: string | null;
  track_inventory: boolean;
  min_stock?: number | null;
  image_url?: string | null;
  status: string; // Active, Inactive
  created_at: Date | string;
  updated_at: Date | string;
  // Relations
  inventory_item?: InventoryItem | null;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  sku?: string | null;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  cost_per_unit?: number | null;
  supplier_id?: string | null;
  status: string;
  supplier?: Supplier | null;
}

export interface InventoryMovement {
  id: string;
  business_id: string;
  inventory_item_id: string;
  type: string;
  quantity: number;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at: Date | string;
  inventory_item?: InventoryItem;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Purchase {
  id: string;
  business_id: string;
  supplier_id: string;
  total: number;
  status?: string | null;
  created_at: Date | string;
  supplier?: Supplier;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  inventory_item_id: string;
  quantity: number;
  cost: number;
  inventory_item?: InventoryItem;
}

export interface Order {
  id: string;
  business_id: string;
  table_id?: string | null;
  waiter_id?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at: Date | string;
  table?: RestaurantTable | null;
  waiter?: Employee | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Transaction {
  id: string;
  business_id: string;
  order_id?: string | null;
  purchase_id?: string | null;
  expense_id?: string | null;
  type: string; // "INCOME" or "EXPENSE"
  amount: number;
  method?: string | null;
  status?: string | null;
  proof_image?: string | null;
  date: Date | string;
}

export interface Sale {
  id: string;
  business_id: string;
  order_id: string;
  cashier_id: string;
  subtotal: number;
  tax: number;
  discount?: number | null;
  total: number;
  created_at: Date | string;
  order?: Order;
  cashier?: Employee;
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  amount: number;
  description?: string | null;
  paid_to?: string | null;
  status: string;
  receipt_image?: string | null;
  date: Date | string;
  created_at: Date | string;
}

export interface SyncChange {
  id: string;
  business_id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  device_id?: string | null;
  installation_id?: string | null;
  created_at: Date | string;
  processed_at?: Date | string | null;
  status: string; // PENDING, SYNCING, SYNCED, FAILED
  retry_count: number;
  last_error?: string | null;
}

// Cloud-only types (for account/subscription management)
export interface Account {
  id: string;
  email: string;
  password_hash: string;
  firstName?: string | null;
  lastName?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Subscription {
  id: string;
  account_id: string;
  business_id: string;
  plan: string; // 'free', 'pro', 'enterprise'
  status: string; // 'active', 'canceled', 'expired'
  starts_at: Date | string;
  expires_at?: Date | string | null;
  created_at: Date | string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface JWTPayload {
  account_id: string;
  business_id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// License types (desktop only)
export interface LicenseState {
  status: string;
  expiresAt?: string;
  validUntil: string;
  plan?: string;
  licenseKey?: string;
  [key: string]: any;
}
