import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Get Unpaid Orders (Payment Queue)
export const getUnpaidOrders = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });

    // Fetch orders that are Ready or Completed but don't have a Sale record yet
    const orders = await prisma.order.findMany({
      where: {
        business_id: String(business_id),
        status: { in: ['Ready', 'Completed'] },
        sales: { none: {} }
      },
      include: {
        table: true,
        waiter: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error fetching unpaid orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Checkout Existing Order
export const checkoutOrder = async (req: Request, res: Response) => {
  try {
    const { business_id, order_id, cashier_id, payment_method, subtotal, tax, discount, total, amount_received } = req.body;

    if (!business_id || !order_id || !cashier_id || !payment_method || total === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark order as completed if it's not already
      const order = await tx.order.update({
        where: { id: order_id },
        data: { status: 'Completed' },
        include: { table: true }
      });

      // 2. Create Sale
      const sale = await tx.sale.create({
        data: {
          business_id,
          order_id,
          cashier_id,
          subtotal,
          tax: tax || 0,
          discount: discount || 0,
          total
        }
      });

      // 3. Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          business_id,
          order_id,
          type: 'INCOME',
          amount: total, // For now assuming full payment
          method: payment_method,
          status: 'PAID',
          date: new Date()
        }
      });

      // 4. Update Table Status to Available if a table is linked
      if (order.table_id) {
        await tx.restaurantTable.update({
          where: { id: order.table_id },
          data: { status: 'Available' }
        });
      }

      // Fetch populated sale
      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          cashier: true,
          order: {
            include: {
              table: true,
              waiter: true,
              items: { include: { product: true } },
              transactions: true
            }
          }
        }
      });

      return fullSale;
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error during checkout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Create Manual Sale (Order + Sale + Payment)
export const createManualSale = async (req: Request, res: Response) => {
  try {
    const { business_id, table_id, waiter_id, cashier_id, items, payment_method, subtotal, tax, discount, total } = req.body;

    if (!business_id || !cashier_id || !payment_method || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order with 'Completed' status
      const order = await tx.order.create({
        data: {
          business_id,
          table_id,
          waiter_id,
          status: 'Completed',
          items: {
            create: items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 2. Create Sale
      const sale = await tx.sale.create({
        data: {
          business_id,
          order_id: order.id,
          cashier_id,
          subtotal,
          tax: tax || 0,
          discount: discount || 0,
          total
        }
      });

      // 3. Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          business_id,
          order_id: order.id,
          type: 'INCOME',
          amount: total,
          method: payment_method,
          status: 'PAID',
          date: new Date()
        }
      });

      // 4. Free the table if selected
      if (table_id) {
        await tx.restaurantTable.update({
          where: { id: table_id },
          data: { status: 'Available' }
        });
      }

      // Fetch populated sale
      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          cashier: true,
          order: {
            include: {
              table: true,
              waiter: true,
              items: { include: { product: true } },
              transactions: true
            }
          }
        }
      });

      // Decrement Inventory
      if (fullSale?.order?.items) {
        for (const item of fullSale.order.items) {
          if (item.product?.track_inventory && item.product?.inventory_item_id) {
            await tx.inventoryItem.update({
              where: { id: item.product.inventory_item_id },
              data: { quantity: { decrement: item.quantity } }
            });
            
            await tx.inventoryMovement.create({
              data: {
                business_id,
                inventory_item_id: item.product.inventory_item_id,
                type: 'OUT',
                quantity: item.quantity,
                reference_type: 'Sale',
                reference_id: fullSale.id
              }
            });
          }
        }
      }

      return fullSale;
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating manual sale:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Get Sales History
export const getSalesHistory = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });

    const sales = await prisma.sale.findMany({
      where: { business_id: String(business_id) },
      include: {
        cashier: true,
        order: {
          include: {
            table: true,
            waiter: true,
            items: {
              include: { product: true }
            },
            transactions: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: sales });
  } catch (error: any) {
    console.error('Error fetching sales history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Refund Sale
export const refundSale = async (req: Request, res: Response) => {
  try {
    const { business_id, sale_id, cashier_id, reason, amount } = req.body;
    if (!business_id || !sale_id || !cashier_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify sale exists
      const originalSale = await tx.sale.findUnique({ where: { id: sale_id } });
      if (!originalSale) throw new Error("Sale not found");

      // 2. Create a negative refund Sale record
      const refundAmount = amount || originalSale.total;
      const refundSubtotal = amount ? (parseFloat(amount) / parseFloat(originalSale.total.toString())) * parseFloat(originalSale.subtotal.toString()) : originalSale.subtotal;

      const refundSale = await tx.sale.create({
        data: {
          business_id,
          order_id: originalSale.order_id, // keep link to original order
          cashier_id,
          subtotal: -refundSubtotal,
          tax: 0,
          discount: 0,
          total: -refundAmount,
        }
      });

      // 3. Create Transaction record for the refund
      const transaction = await tx.transaction.create({
        data: {
          business_id,
          order_id: originalSale.order_id,
          type: 'EXPENSE',
          amount: refundAmount, // Store as a positive amount since type is EXPENSE
          method: 'Refund',
          status: 'PAID', // Mark as PAID so it appears in the transactions list
          date: new Date()
        }
      });

      // 4. Update original order status to Cancelled if fully refunded
      if (!amount || parseFloat(amount) >= parseFloat(originalSale.total.toString())) {
        await tx.order.update({
          where: { id: originalSale.order_id },
          data: { status: 'Cancelled', notes: reason }
        });
      }

      return { refundSale, transaction };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
