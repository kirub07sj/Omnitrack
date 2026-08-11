const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const business_id = 'a28d7aab-8d0b-4d2b-bdbf-f2e2641b0fe6';
  const emp = await prisma.employee.findFirst({ where: { business_id } });
  const product = await prisma.product.findFirst({ where: { track_inventory: true, inventory_item_id: { not: null } }});
  
  // Create an order directly
  const order = await prisma.order.create({
    data: {
      business_id,
      status: 'Ready',
      items: {
        create: [{ product_id: product.id, quantity: 1, price: product.price }]
      }
    }
  });

  const payload = {
    business_id,
    order_id: order.id,
    cashier_id: emp.id,
    payment_method: 'Cash',
    subtotal: Number(product.price),
    tax: 0,
    discount: 0,
    total: Number(product.price),
    amount_received: Number(product.price)
  };

  const inv = await prisma.inventoryItem.findUnique({ where: { id: product.inventory_item_id }});
  console.log('Inventory before:', inv.quantity);

  try {
    const res = await fetch('http://localhost:5000/api/sales/checkout', {
        method: 'POST', 
        body: JSON.stringify(payload), 
        headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    console.log('Response:', data.success);
    
    const invAfter = await prisma.inventoryItem.findUnique({ where: { id: product.inventory_item_id }});
    console.log('Inventory after:', invAfter.quantity);
  } catch(e) {
    console.log('Error:', e);
  }
}
main().finally(() => prisma.$disconnect());
