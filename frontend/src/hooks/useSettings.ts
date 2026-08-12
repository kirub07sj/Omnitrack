import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';

// ─── Default values ────────────────────────────────────────────
const DEFAULT_PAYMENT_METHODS = [
  { id: '1', name: 'Cash', enabled: true },
  { id: '2', name: 'Mobile Banking', enabled: true, provider: 'Telebirr' },
  { id: '3', name: 'Card', enabled: true },
  { id: '4', name: 'Bank Transfer', enabled: false },
];

const DEFAULT_ORDER_SETTINGS = {
  format: 'ORD-{YYYY}-{####}',
  defaultStatus: 'Pending',
  allowCancellation: true,
  requireCancelReason: true,
  allowModification: true,
};

const DEFAULT_INVENTORY_SETTINGS = {
  lowStockAlerts: true,
  lowStockThreshold: 10,
  allowNegativeStock: false,
  costingMethod: 'Weighted Average',
  requireSupplier: true,
};

const DEFAULT_TAX_SETTINGS = {
  enableTax: true,
  taxName: 'VAT',
  taxRate: 15,
  enableServiceCharge: false,
  serviceChargeRate: 10,
};

const DEFAULT_RECEIPT_SETTINGS = {
  showBusinessName: true,
  showLogo: true,
  showAddress: true,
  showPhone: true,
  showCashier: true,
  showTableNumber: true,
  showOrderNumber: true,
  footerMessage: 'Thank you for visiting us!',
  paperSize: '80mm' as '58mm' | '80mm' | 'A4',
};

const DEFAULT_SYSTEM_SETTINGS = {
  language: 'English',
  dateFormat: 'DD/MM/YYYY',
  timeZone: 'Africa/Addis_Ababa',
  autoBackup: true,
  backupFrequency: 'Daily',
};

// ─── Types ─────────────────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  provider?: string;
}

export interface OrderSettings {
  format: string;
  defaultStatus: string;
  allowCancellation: boolean;
  requireCancelReason: boolean;
  allowModification: boolean;
}

export interface InventorySettings {
  lowStockAlerts: boolean;
  lowStockThreshold: number;
  allowNegativeStock: boolean;
  costingMethod: string;
  requireSupplier: boolean;
}

export interface TaxSettings {
  enableTax: boolean;
  taxName: string;
  taxRate: number;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
}

export interface ReceiptSettings {
  showBusinessName: boolean;
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showCashier: boolean;
  showTableNumber: boolean;
  showOrderNumber: boolean;
  footerMessage: string;
  paperSize: '58mm' | '80mm' | 'A4';
}

export interface SystemSettings {
  language: string;
  dateFormat: string;
  timeZone: string;
  autoBackup: boolean;
  backupFrequency: string;
}

export interface AppSettings {
  // Business (root columns)
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  currency: string;
  isKitchenActive: boolean;

  // Parsed JSON settings
  paymentMethods: PaymentMethod[];
  enabledPaymentMethods: PaymentMethod[];
  orderSettings: OrderSettings;
  inventorySettings: InventorySettings;
  taxSettings: TaxSettings;
  receiptSettings: ReceiptSettings;
  systemSettings: SystemSettings;

  // Computed helpers
  formatCurrency: (amount: number | string) => string;
  calculateTax: (subtotal: number) => number;
  calculateServiceCharge: (subtotal: number) => number;
  calculateTotal: (subtotal: number, discount?: number) => { subtotal: number; tax: number; serviceCharge: number; discount: number; total: number };
}

// ─── Hook ──────────────────────────────────────────────────────
export function useSettings(): AppSettings {
  const { businessSettings } = useAppStore();

  return useMemo(() => {
    const bs = businessSettings || {};
    const parsed = bs.settings ? (() => { try { return JSON.parse(bs.settings); } catch { return {}; } })() : {};

    // Root-level DB columns
    const businessName = bs.name || '';
    const ownerName = bs.owner_name || '';
    const phone = bs.phone || '';
    const email = bs.email || '';
    const address = bs.address || '';
    const logo = bs.logo || '';
    const currency = bs.currency || 'ETB';
    const isKitchenActive = bs.is_kitchen_active ?? true;

    // JSON settings with defaults
    const paymentMethods: PaymentMethod[] = parsed.payment_methods || DEFAULT_PAYMENT_METHODS;
    const enabledPaymentMethods = paymentMethods.filter(m => m.enabled);

    const orderSettings: OrderSettings = { ...DEFAULT_ORDER_SETTINGS, ...parsed.order_settings };
    const inventorySettings: InventorySettings = { ...DEFAULT_INVENTORY_SETTINGS, ...parsed.inventory_settings };

    const taxSettings: TaxSettings = {
      ...DEFAULT_TAX_SETTINGS,
      ...parsed.tax_settings,
      // Also respect root-level tax_rate if tax_settings hasn't overridden it
      taxRate: parsed.tax_settings?.taxRate ?? (bs.tax_rate != null ? Number(bs.tax_rate) : DEFAULT_TAX_SETTINGS.taxRate),
    };

    const receiptSettings: ReceiptSettings = { ...DEFAULT_RECEIPT_SETTINGS, ...parsed.receipt_settings };
    const systemSettings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS, ...parsed.system_settings };

    // Helper: format currency
    const formatCurrency = (amount: number | string): string => {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return `0.00 ${currency}`;
      return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    };

    // Helper: calculate tax amount
    const calculateTax = (subtotal: number): number => {
      if (!taxSettings.enableTax) return 0;
      return subtotal * (taxSettings.taxRate / 100);
    };

    // Helper: calculate service charge
    const calculateServiceCharge = (subtotal: number): number => {
      if (!taxSettings.enableServiceCharge) return 0;
      return subtotal * (taxSettings.serviceChargeRate / 100);
    };

    // Helper: calculate totals breakdown
    const calculateTotal = (subtotal: number, discount: number = 0) => {
      const tax = calculateTax(subtotal);
      const serviceCharge = calculateServiceCharge(subtotal);
      const total = subtotal + tax + serviceCharge - discount;
      return { subtotal, tax, serviceCharge, discount, total };
    };

    return {
      businessName, ownerName, phone, email, address, logo, currency, isKitchenActive,
      paymentMethods, enabledPaymentMethods,
      orderSettings, inventorySettings, taxSettings, receiptSettings, systemSettings,
      formatCurrency, calculateTax, calculateServiceCharge, calculateTotal,
    };
  }, [businessSettings]);
}
