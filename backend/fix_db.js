const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: {
      image_url: {
        startsWith: 'http://localhost:5000'
      }
    }
  });

  console.log(`Found ${prods.length} products with legacy port 5000 URLs.`);

  for (const p of prods) {
    const newUrl = p.image_url.replace('http://localhost:5000', '');
    await prisma.product.update({
      where: { id: p.id },
      data: { image_url: newUrl }
    });
    console.log(`Updated product ${p.name} image to ${newUrl}`);
  }
}

main()
  .then(() => console.log('Database image URLs updated successfully.'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
