const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const business_id = 'a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6'; // From earlier DB dump
  const cashier_id = 'c13c75a4-569b-4f9e-a6a9-839f9b54ce09'; // Arbitrary or needs valid ID?
  
  // Find a valid cashier
  const emp = await prisma.employee.findFirst({ where: { business_id } });
  if (!emp) return console.log("No employee found");
  
  const product = await prisma.product.findFirst({ where: { track_inventory: true, inventory_item_id: { not: null } }});
  if (!product) return console.log("No trackable product found");
  
  const inv = await prisma.inventoryItem.findUnique({ where: { id: product.inventory_item_id }});
  console.log('Inventory before:', inv.quantity);
  
  const payload = {
    business_id,
    cashier_id: emp.id,
    payment_method: 'Cash',
    subtotal: Number(product.price),
    tax: 0,
    discount: 0,
    total: Number(product.price),
    items: [
      {
        product_id: product.id,
        quantity: 1,
        price: Number(product.price)
      }
    ]
  };

  try {
    const res = await fetch('http://localhost:5000/api/sales/manual', payload);
    console.log('Response:', res.data.success);
    
    const invAfter = await prisma.inventoryItem.findUnique({ where: { id: product.inventory_item_id }});
    console.log('Inventory after:', invAfter.quantity);
    
    const moves = await prisma.inventoryMovement.findMany({ orderBy: { created_at: 'desc' }, take: 1 });
    console.log('Movement:', moves);
  } catch(e) {
    console.log('Error:', e.response ? e.response.data : e.message);
  }
}
main().finally(() => prisma.$disconnect());
