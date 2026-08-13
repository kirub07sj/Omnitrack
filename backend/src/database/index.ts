import { PrismaClient } from '@prisma/client';

const basePrisma = new PrismaClient();

const TRACKED_MODELS = [
  'Order', 'OrderItem', 'Sale', 'Transaction', 'Expense', 
  'InventoryMovement', 'Product', 'Employee', 'Purchase', 
  'PurchaseItem', 'Business', 'RestaurantTable', 'Category', 
  'InventoryItem', 'Supplier'
];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Only track specific models and mutations
        if (
          !TRACKED_MODELS.includes(model as string) || 
          !['create', 'update', 'delete'].includes(operation)
        ) {
          return query(args);
        }

        // We run the actual query first
        const result = await query(args);

        // If the query was successful, we create a sync change record
        // Handle getting the entity_id and business_id if possible
        const entityId = result?.id;
        const businessId = result?.business_id || args.data?.business_id || 'UNKNOWN';

        if (entityId && businessId !== 'UNKNOWN') {
          try {
            await basePrisma.syncChange.create({
              data: {
                business_id: businessId,
                entity_type: model as string,
                entity_id: entityId,
                operation: operation.toUpperCase(),
                installation_id: process.env.INSTALLATION_ID || 'INSTALLATION-LOCAL',
                device_id: process.env.DEVICE_ID || 'SERVER-MAIN',
                status: 'PENDING'
              }
            });
          } catch (error) {
            console.error(`[SYNC ENGINE] Failed to record sync change for ${model} ${entityId}:`, error);
          }
        }

        return result;
      }
    }
  }
});

export default prisma;
