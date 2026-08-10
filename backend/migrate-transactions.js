const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTransactions() {
  console.log('Migrating existing sales and purchases to transactions...');
  
  const sales = await prisma.sale.findMany({ include: { order: true } });
  for (const sale of sales) {
    if (sale.order_id) {
      // determine if it's a refund based on subtotal or total being negative
      const isRefund = sale.total < 0;
      await prisma.transaction.create({
        data: {
          business_id: sale.business_id,
          order_id: sale.order_id,
          type: isRefund ? 'EXPENSE' : 'INCOME',
          amount: sale.total,
          method: isRefund ? 'Refund' : 'Cash',
          status: isRefund ? 'REFUNDED' : 'PAID',
          date: sale.created_at
        }
      });
    }
  }

  const purchases = await prisma.purchase.findMany({});
  for (const purchase of purchases) {
    await prisma.transaction.create({
      data: {
        business_id: purchase.business_id,
        purchase_id: purchase.id,
        type: 'EXPENSE',
        amount: purchase.total,
        method: 'Cash',
        status: purchase.status || 'PAID',
        date: purchase.created_at
      }
    });
  }

  console.log(`Migrated ${sales.length} sales and ${purchases.length} purchases to transactions.`);
}

migrateTransactions()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
