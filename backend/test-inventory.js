const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inv = await prisma.inventoryItem.findFirst();
  console.log('Before:', inv);
  
  if (inv) {
    try {
      await prisma.inventoryItem.update({
        where: { id: inv.id },
        data: { quantity: { decrement: 1 } } // Testing decrement
      });
      const after = await prisma.inventoryItem.findFirst({ where: { id: inv.id }});
      console.log('After:', after);
    } catch(e) {
      console.error('Error:', e);
    }
  }
}
main().finally(() => prisma.$disconnect());
