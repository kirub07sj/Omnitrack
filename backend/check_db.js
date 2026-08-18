const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const prods = await prisma.product.findMany({ select: { id: true, name: true, image_url: true }});
  console.log(prods);
}
main().finally(() => prisma.$disconnect());
