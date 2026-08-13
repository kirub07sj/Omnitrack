import { prisma as localPrisma } from './src/database/index';
import axios from 'axios';

async function bootstrap() {
  console.log("Extracting local data...");
  const business = await localPrisma.business.findFirst();
  if (!business) return console.log("No business found");

  const categories = await localPrisma.category.findMany();
  const products = await localPrisma.product.findMany();
  const employees = await localPrisma.employee.findMany();
  const tables = await localPrisma.restaurantTable.findMany();
  
  const changes = [];
  let changeId = 1000;

  const addChange = (type: string, data: any) => {
    changes.push({
      changeId: `bootstrap-${changeId++}`,
      businessId: business.id,
      entityType: type,
      entityId: data.id,
      operation: 'CREATE',
      deviceId: 'BOOTSTRAP',
      installationId: 'BOOTSTRAP',
      timestamp: new Date().toISOString(),
      data: data
    });
  };

  addChange('Business', business);
  categories.forEach(c => addChange('Category', c));
  products.forEach(p => addChange('Product', p));
  employees.forEach(e => addChange('Employee', e));
  tables.forEach(t => addChange('RestaurantTable', t));

  console.log(`Pushing ${changes.length} foundational records to Neon via cloud API...`);
  
  try {
    const res = await axios.post('http://localhost:8000/api/sync/push', {
      installationId: 'BOOTSTRAP',
      changes
    });
    console.log("Bootstrap success:", res.data);
  } catch (err: any) {
    console.error("Bootstrap failed:", err.message);
  }
}

bootstrap().catch(console.error).finally(() => process.exit(0));
