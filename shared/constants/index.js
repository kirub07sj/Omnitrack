"use strict";
// Shared constants for OmniTrack
// Used across desktop and cloud products
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATE_FORMAT = exports.PAGINATION = exports.API_DEFAULTS = exports.LICENSE_STATUS = exports.SUBSCRIPTION_STATUS = exports.SUBSCRIPTION_PLAN = exports.EXPENSE_CATEGORY = exports.EMPLOYMENT_TYPE = exports.PAYMENT_STATUS = exports.SYNC_STATUS = exports.MOVEMENT_TYPE = exports.PAYMENT_METHOD = exports.TRANSACTION_STATUS = exports.TRANSACTION_TYPE = exports.TABLE_STATUS = exports.ORDER_STATUS = exports.ENTITY_STATUS = exports.USER_STATUS = exports.ROLES = void 0;
// User roles
exports.ROLES = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    CASHIER: 'CASHIER',
    WAITER: 'WAITER',
    KITCHEN: 'KITCHEN',
};
// User/Employee statuses
exports.USER_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
};
// Product/Category statuses
exports.ENTITY_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
};
// Order statuses
exports.ORDER_STATUS = {
    PENDING: 'Pending',
    PREPARING: 'Preparing',
    READY: 'Ready',
    SERVED: 'Served',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};
// Table statuses
exports.TABLE_STATUS = {
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    RESERVED: 'Reserved',
    CLEANING: 'Cleaning',
};
// Transaction types
exports.TRANSACTION_TYPE = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
};
// Transaction statuses
exports.TRANSACTION_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
};
// Payment methods
exports.PAYMENT_METHOD = {
    CASH: 'Cash',
    CARD: 'Card',
    MOBILE: 'Mobile',
    BANK_TRANSFER: 'Bank Transfer',
    OTHER: 'Other',
};
// Inventory movement types
exports.MOVEMENT_TYPE = {
    IN: 'IN',
    OUT: 'OUT',
    ADJUSTMENT: 'ADJUSTMENT',
    RETURN: 'RETURN',
};
// Sync statuses
exports.SYNC_STATUS = {
    PENDING: 'PENDING',
    SYNCING: 'SYNCING',
    SYNCED: 'SYNCED',
    FAILED: 'FAILED',
};
// Purchase/Expense statuses
exports.PAYMENT_STATUS = {
    PAID: 'PAID',
    UNPAID: 'UNPAID',
    PARTIAL: 'PARTIAL',
};
// Employment types
exports.EMPLOYMENT_TYPE = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    TEMPORARY: 'Temporary',
};
// Expense categories
exports.EXPENSE_CATEGORY = {
    RENT: 'Rent',
    UTILITIES: 'Utilities',
    SALARIES: 'Salaries',
    SUPPLIES: 'Supplies',
    MAINTENANCE: 'Maintenance',
    MARKETING: 'Marketing',
    INSURANCE: 'Insurance',
    TAXES: 'Taxes',
    OTHER: 'Other',
};
// Cloud-specific: Subscription plans
exports.SUBSCRIPTION_PLAN = {
    FREE: 'free',
    PRO: 'pro',
    ENTERPRISE: 'enterprise',
};
// Cloud-specific: Subscription statuses
exports.SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
    TRIAL: 'trial',
};
// Desktop-specific: License statuses
exports.LICENSE_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    SUSPENDED: 'suspended',
};
// API base URLs (can be overridden by environment variables)
exports.API_DEFAULTS = {
    DESKTOP_API_URL: 'http://localhost:5055',
    CLOUD_API_URL: process.env.VITE_API_BASE_URL || 'https://api.omnitrack.com',
};
// Pagination defaults
exports.PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};
// Date/Time formats
exports.DATE_FORMAT = {
    DISPLAY: 'MMM dd, yyyy',
    FULL: 'MMMM dd, yyyy',
    WITH_TIME: 'MMM dd, yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
};
