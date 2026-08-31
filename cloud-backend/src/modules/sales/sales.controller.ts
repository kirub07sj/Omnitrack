import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getUnpaidOrders = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });
    const orders = await prisma.order.findMany({
      where: { business_id, status: { in: ['Ready', 'Completed'] }, sales: { none: {} } },
      include: { table: true, waiter: true, items: { include: { product: true } } },
      orderBy: { created_at: 'asc' }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};

export const checkoutOrder = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { order_id, cashier_id, payment_method, subtotal, tax, discount, total, amount_received } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id: order_id }, data: { status: 'Completed' }, include: { table: true } });
      const sale = await tx.sale.create({ data: { business_id, order_id, cashier_id, subtotal, tax: tax || 0, discount: discount || 0, total } });
      await tx.transaction.create({ data: { business_id, order_id, type: 'INCOME', amount: total, method: payment_method, status: 'PAID', date: new Date() } });
      if (order.table_id) await tx.restaurantTable.update({ where: { id: order.table_id }, data: { status: 'Available' } });

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: { cashier: true, order: { include: { table: true, waiter: true, items: { include: { product: true } }, transactions: true } } }
      });
    });
    res.json({ success: true, data: result });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};

export const createManualSale = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { table_id, waiter_id, cashier_id, items, payment_method, subtotal, tax, discount, total } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          business_id, table_id, waiter_id, status: 'Completed',
          items: { create: items.map((item: any) => ({ product_id: item.product_id, quantity: item.quantity, price: item.price })) }
        }
      });
      const sale = await tx.sale.create({ data: { business_id, order_id: order.id, cashier_id, subtotal, tax: tax || 0, discount: discount || 0, total } });
      await tx.transaction.create({ data: { business_id, order_id: order.id, type: 'INCOME', amount: total, method: payment_method, status: 'PAID', date: new Date() } });
      if (table_id) await tx.restaurantTable.update({ where: { id: table_id }, data: { status: 'Available' } });

      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: { cashier: true, order: { include: { table: true, waiter: true, items: { include: { product: true } }, transactions: true } } }
      });

      if (fullSale?.order?.items) {
        for (const item of fullSale.order.items) {
          if (item.product?.track_inventory && item.product?.inventory_item_id) {
            await tx.inventoryItem.update({ where: { id: item.product.inventory_item_id }, data: { quantity: { decrement: item.quantity } } });
            await tx.inventoryMovement.create({
              data: { business_id, inventory_item_id: item.product.inventory_item_id, type: 'OUT', quantity: item.quantity, reference_type: 'Sale', reference_id: fullSale.id }
            });
          }
        }
      }
      return fullSale;
    });
    res.json({ success: true, data: result });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};

export const getSalesHistory = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });
    const sales = await prisma.sale.findMany({
      where: { business_id },
      include: { cashier: true, order: { include: { table: true, waiter: true, items: { include: { product: true } }, transactions: true } } },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: sales });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};

export const refundSale = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    const { sale_id, cashier_id, reason, amount } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const originalSale = await tx.sale.findUnique({ where: { id: sale_id } });
      if (!originalSale) throw new Error("Sale not found");

      const refundAmount = amount || originalSale.total;
      const refundSubtotal = amount ? (parseFloat(amount) / parseFloat(originalSale.total.toString())) * parseFloat(originalSale.subtotal.toString()) : originalSale.subtotal;

      const refundSale = await tx.sale.create({
        data: { business_id, order_id: originalSale.order_id, cashier_id, subtotal: -refundSubtotal, tax: 0, discount: 0, total: -refundAmount }
      });

      const transaction = await tx.transaction.create({
        data: { business_id, order_id: originalSale.order_id, type: 'EXPENSE', amount: refundAmount, method: 'Refund', status: 'PAID', date: new Date() }
      });

      if (!amount || parseFloat(amount) >= parseFloat(originalSale.total.toString())) {
        await tx.order.update({ where: { id: originalSale.order_id }, data: { status: 'Cancelled', notes: reason } });
      }
      return { refundSale, transaction };
    });
    res.json({ success: true, data: result });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};
