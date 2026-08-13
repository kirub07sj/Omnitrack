import { prisma as localPrisma } from './src/database/index';
import axios from 'axios';

async function fullSync() {
  console.log("Extracting ALL local data...");
  const business = await localPrisma.business.findFirst();
  if (!business) return console.log("No business found");

  const roles = await localPrisma.role.findMany();
  const employees = await localPrisma.employee.findMany();
  const users = await localPrisma.user.findMany();
  const categories = await localPrisma.category.findMany();
  const suppliers = await localPrisma.supplier.findMany();
  const inventoryItems = await localPrisma.inventoryItem.findMany();
  const products = await localPrisma.product.findMany();
  const tables = await localPrisma.restaurantTable.findMany();
  const purchases = await localPrisma.purchase.findMany();
  const purchaseItems = await localPrisma.purchaseItem.findMany();
  const orders = await localPrisma.order.findMany();
  const orderItems = await localPrisma.orderItem.findMany();
  const sales = await localPrisma.sale.findMany();
  const transactions = await localPrisma.transaction.findMany();
  const expenses = await localPrisma.expense.findMany();
  const inventoryMovements = await localPrisma.inventoryMovement.findMany();

  const changes: any[] = [];
  let changeId = 3000;

  const addChange = (type: string, data: any) => {
    changes.push({
      changeId: `fullsync-${type}-${changeId++}`,
      businessId: business.id,
      entityType: type,
      entityId: data.id,
      operation: 'CREATE',
      deviceId: 'FULL-SYNC',
      installationId: 'FULL-SYNC',
      timestamp: new Date().toISOString(),
      data: data
    });
  };

  // MUST be in correct foreign key order!
  addChange('Business', business);
  roles.forEach(r => addChange('Role', r));
  employees.forEach(r => addChange('Employee', r));
  users.forEach(r => addChange('User', r));
  suppliers.forEach(r => addChange('Supplier', r));
  categories.forEach(r => addChange('Category', r));
  inventoryItems.forEach(r => addChange('InventoryItem', r));
  products.forEach(r => addChange('Product', r));
  tables.forEach(r => addChange('RestaurantTable', r));
  purchases.forEach(r => addChange('Purchase', r));
  purchaseItems.forEach(r => addChange('PurchaseItem', r));
  orders.forEach(r => addChange('Order', r));
  orderItems.forEach(r => addChange('OrderItem', r));
  sales.forEach(r => addChange('Sale', r));
  transactions.forEach(r => addChange('Transaction', r));
  expenses.forEach(r => addChange('Expense', r));
  inventoryMovements.forEach(r => addChange('InventoryMovement', r));

  console.log(`Pushing ${changes.length} records to Neon via cloud API in chunks...`);
  
  try {
    const chunkSize = 50;
    let totalProcessed = 0;
    let totalErrors = 0;

    for (let i = 0; i < changes.length; i += chunkSize) {
      const chunk = changes.slice(i, i + chunkSize);
      console.log(`Pushing chunk ${i / chunkSize + 1} (${chunk.length} items)...`);
      
      const res = await axios.post('http://localhost:8000/api/sync/push', {
        installationId: 'FULL-SYNC',
        changes: chunk
      });
      
      totalProcessed += res.data.processed?.length || 0;
      if (res.data.errors?.length > 0) {
        totalErrors += res.data.errors.length;
        console.error(`Errors in chunk:`, res.data.errors.slice(0, 3));
      }

      // Small delay between chunks to let Neon connection pool breathe
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Full sync complete. Total Processed: ${totalProcessed}, Total Errors: ${totalErrors}`);
  } catch (err: any) {
    console.error("Full sync failed:", err.message);
  }
}

fullSync().catch(console.error).finally(() => process.exit(0));
