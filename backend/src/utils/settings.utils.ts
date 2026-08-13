import { prisma } from '../database';


/**
 * Fetches and parses business settings from the database.
 * Returns the merged settings (root columns + parsed JSON `settings` column).
 */
export async function getBusinessSettings(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) return null;

  let parsedSettings: any = {};
  if (business.settings) {
    try {
      parsedSettings = JSON.parse(business.settings);
    } catch {
      // Ignore invalid JSON
    }
  }

  return {
    ...business,
    // Inventory settings
    inventorySettings: {
      lowStockAlerts: true,
      lowStockThreshold: 10,
      allowNegativeStock: false,
      costingMethod: 'Weighted Average',
      requireSupplier: true,
      ...parsedSettings.inventory_settings,
    },
    // Tax settings
    taxSettings: {
      enableTax: true,
      taxName: 'VAT',
      taxRate: business.tax_rate != null ? Number(business.tax_rate) : 15,
      enableServiceCharge: false,
      serviceChargeRate: 10,
      ...parsedSettings.tax_settings,
    },
    // Order settings
    orderSettings: {
      format: 'ORD-{YYYY}-{####}',
      defaultStatus: 'Pending',
      allowCancellation: true,
      requireCancelReason: true,
      allowModification: true,
      ...parsedSettings.order_settings,
    },
    // Payment methods
    paymentMethods: parsedSettings.payment_methods || [
      { id: '1', name: 'Cash', enabled: true },
      { id: '2', name: 'Mobile Banking', enabled: true, provider: 'Telebirr' },
      { id: '3', name: 'Card', enabled: true },
      { id: '4', name: 'Bank Transfer', enabled: false },
    ],
    // Receipt settings
    receiptSettings: {
      showBusinessName: true,
      showLogo: true,
      showAddress: true,
      showPhone: true,
      showCashier: true,
      showTableNumber: true,
      showOrderNumber: true,
      footerMessage: 'Thank you for visiting us!',
      paperSize: '80mm',
      ...parsedSettings.receipt_settings,
    },
  };
}

/**
 * Checks if inventory stock can be decremented for a given item.
 * If allowNegativeStock is false, checks that stock won't go below 0.
 * Returns { allowed: boolean, currentStock: number, requestedQty: number }
 */
export async function checkStockAvailability(
  businessId: string,
  inventoryItemId: string,
  requestedQty: number
): Promise<{ allowed: boolean; currentStock: number; requestedQty: number; itemName: string }> {
  const settings = await getBusinessSettings(businessId);
  const allowNegative = settings?.inventorySettings.allowNegativeStock ?? false;

  const item = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
  });

  if (!item) {
    return { allowed: true, currentStock: 0, requestedQty, itemName: 'Unknown' };
  }

  const currentStock = Number(item.quantity);

  if (allowNegative) {
    return { allowed: true, currentStock, requestedQty, itemName: item.name };
  }

  return {
    allowed: currentStock >= requestedQty,
    currentStock,
    requestedQty,
    itemName: item.name,
  };
}
