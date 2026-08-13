import { prisma } from './src/database/index';

async function check() {
  const orders = await prisma.order.findMany({ orderBy: { created_at: 'desc' }, take: 5 });
  console.log("Last 5 orders:");
  for (const o of orders) {
    console.log(o.id, o.created_at);
  }
}
check().catch(console.error).finally(() => process.exit(0));
