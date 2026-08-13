import { PrismaClient } from '@prisma/client';

const basePrisma = new PrismaClient();

const TRACKED_MODELS = [
  'Order', 'OrderItem', 'Sale', 'Transaction', 'Expense', 
  'InventoryMovement', 'Product', 'Employee', 'Purchase', 
  'PurchaseItem', 'Business', 'RestaurantTable', 'Category', 
  'InventoryItem', 'Supplier'
];

interface SyncChangeData {
  business_id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  installation_id: string;
  device_id: string;
  status: string;
}

const syncQueue: SyncChangeData[] = [];

// Process queue every second to avoid SQLite deadlocks during transactions
setInterval(async () => {
  if (syncQueue.length === 0) return;
  const batch = syncQueue.splice(0, syncQueue.length);
  try {
    await basePrisma.syncChange.createMany({
      data: batch
    });
  } catch (err) {
    console.error(`[SYNC ENGINE] Failed to save sync batch:`, err);
    // Put them back
    syncQueue.push(...batch);
  }
}, 1000);

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (
          !TRACKED_MODELS.includes(model as string) || 
          !['create', 'update', 'delete'].includes(operation)
        ) {
          return query(args);
        }

        const result = await query(args);

        const resAny = result as any;
        const argsAny = args as any;
        const entityId = resAny?.id;
        const businessId = resAny?.business_id || argsAny?.data?.business_id || 'UNKNOWN';

        if (entityId && businessId !== 'UNKNOWN') {
          syncQueue.push({
            business_id: businessId,
            entity_type: model as string,
            entity_id: entityId,
            operation: operation.toUpperCase(),
            installation_id: process.env.INSTALLATION_ID || 'INSTALLATION-LOCAL',
            device_id: process.env.DEVICE_ID || 'SERVER-MAIN',
            status: 'PENDING'
          });
        }

        return result;
      }
    }
  }
});

export default prisma;
