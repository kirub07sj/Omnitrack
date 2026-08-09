const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const inv = await prisma.inventoryItem.findFirst();
  const order = await prisma.orderItem.findFirst({ where: { product: { track_inventory: true } } });
  if (inv && order) {
    try {
      console.log('Order quantity:', order.quantity, typeof order.quantity);
      await prisma.inventoryItem.update({
        where: { id: inv.id },
        data: { quantity: { decrement: order.quantity } }
      });
      console.log('Success');
    } catch(e) {
      console.error('Error:', e);
    }
  }
}
main().finally(() => prisma.$disconnect());
