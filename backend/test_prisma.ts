import { prisma } from './src/database/index';

async function main() {
  const business = await prisma.business.findFirst();
  if (!business) {
    console.log("No business found");
    return;
  }
  
  console.log("Creating test order...");
  const order = await prisma.order.create({
    data: {
      business_id: business.id,
      notes: 'Test sync',
      status: 'Pending'
    }
  });
  
  console.log("Order created:", order.id);
  
  const changes = await prisma.syncChange.findMany();
  console.log("Sync Changes:", changes.length);
}

main().catch(console.error).finally(() => process.exit(0));
