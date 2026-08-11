const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const movements = await prisma.inventoryMovement.findMany({ orderBy: { created_at: 'desc' }, take: 5 });
  console.log('Movements:', movements);
}
main().finally(() => prisma.$disconnect());
