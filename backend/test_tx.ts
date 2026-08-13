import { prisma } from './src/database/index';

async function testTx() {
  const business = await prisma.business.findFirst();
  if (!business) return console.log("no business");
  
  const order = await prisma.order.findFirst();
  if (!order) return console.log("no order");

  const cashier = await prisma.employee.findFirst({ where: { business_id: business.id } });
  if (!cashier) return console.log("no cashier");

  console.log("Checking out order:", order.id);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'Completed' },
        include: { table: true }
      });

      const sale = await tx.sale.create({
        data: {
          business_id: business.id,
          order_id: order.id,
          cashier_id: cashier.id,
          subtotal: 10,
          tax: 0,
          discount: 0,
          total: 10
        }
      });

      return sale;
    });
    console.log("Tx result:", result);
  } catch (err) {
    console.error("Tx error:", err);
  }
}
testTx().catch(console.error).finally(() => process.exit(0));
