const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const purchases = await prisma.purchase.findMany({
    include: { items: true }
  });
  
  let deletedCount = 0;
  for (const p of purchases) {
    if (p.items.length === 0) {
      await prisma.purchase.delete({ where: { id: p.id } });
      deletedCount++;
    }
  }
  console.log(`Deleted ${deletedCount} empty purchases.`);
}

cleanup()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
