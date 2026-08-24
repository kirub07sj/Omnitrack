// Shared constants for OmniTrack
// Used across desktop and cloud products

// User roles
export const ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

// User/Employee statuses
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
} as const;

// Product/Category statuses
export const ENTITY_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

// Table statuses
export const TABLE_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  CLEANING: 'Cleaning',
} as const;

// Transaction types
export const TRANSACTION_TYPE = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

// Transaction statuses
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

// Payment methods
export const PAYMENT_METHOD = {
  CASH: 'Cash',
  CARD: 'Card',
  MOBILE: 'Mobile',
  BANK_TRANSFER: 'Bank Transfer',
  OTHER: 'Other',
} as const;

// Inventory movement types
export const MOVEMENT_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN',
} as const;

// Sync statuses
export const SYNC_STATUS = {
  PENDING: 'PENDING',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
} as const;

// Purchase/Expense statuses
export const PAYMENT_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
} as const;

// Employment types
export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  TEMPORARY: 'Temporary',
} as const;

// Expense categories
export const EXPENSE_CATEGORY = {
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  SALARIES: 'Salaries',
  SUPPLIES: 'Supplies',
  MAINTENANCE: 'Maintenance',
  MARKETING: 'Marketing',
  INSURANCE: 'Insurance',
  TAXES: 'Taxes',
  OTHER: 'Other',
} as const;

// Cloud-specific: Subscription plans
export const SUBSCRIPTION_PLAN = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Cloud-specific: Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
} as const;

// Desktop-specific: License statuses
export const LICENSE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUSPENDED: 'suspended',
} as const;

// API base URLs (can be overridden by environment variables)
export const API_DEFAULTS = {
  DESKTOP_API_URL: 'http://localhost:5055',
  CLOUD_API_URL: process.env.VITE_API_BASE_URL || 'https://api.omnitrack.com',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Date/Time formats
export const DATE_FORMAT = {
  DISPLAY: 'MMM dd, yyyy',
  FULL: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
} as const;
