import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store SSE clients
const clients: { id: string; business_id: string; res: Response }[] = [];

export const streamOrders = (req: Request, res: Response) => {
  const { business_id } = req.query;
  
  if (!business_id) {
    res.status(400).json({ message: 'business_id is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial heartbeat
  res.write(': heartbeat\n\n');

  const clientId = Date.now().toString();
  const newClient = { id: clientId, business_id: String(business_id), res };
  clients.push(newClient);

  req.on('close', () => {
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
};

const notifyClients = (business_id: string, event: string, data: any) => {
  clients.filter(c => c.business_id === business_id).forEach(client => {
    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { business_id, status } = req.query;
    
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const whereClause: any = { business_id: String(business_id) };
    if (status) {
      whereClause.status = String(status);
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        table: true,
        waiter: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { business_id, table_id, waiter_id, notes, items, status } = req.body;

    // Check if there is an existing active order for this table
    if (table_id) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          business_id,
          table_id,
          status: {
            notIn: ['Completed', 'Cancelled', 'PAID']
          }
        }
      });

      if (existingOrder) {
        // Append new items
        await prisma.orderItem.createMany({
          data: items.map((item: any) => ({
            order_id: existingOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }))
        });

        // Optionally update notes if provided
        const updatedNotes = notes 
          ? (existingOrder.notes ? `${existingOrder.notes}\n${notes}` : notes)
          : existingOrder.notes;

        // If the order was Ready or Served, change it back to Pending so the kitchen can prepare the new items.
        // Otherwise, keep its current status.
        let updatedStatus = existingOrder.status;
        if (['Ready', 'Served'].includes(existingOrder.status as string)) {
          updatedStatus = 'Pending';
        }

        const updatedOrder = await prisma.order.update({
          where: { id: existingOrder.id },
          data: { 
            notes: updatedNotes,
            status: updatedStatus 
          },
          include: {
            table: true,
            waiter: true,
            items: {
              include: { product: true }
            }
          }
        });

        // Decrement inventory for newly added items
        for (const reqItem of items) {
          const product = await prisma.product.findUnique({ where: { id: reqItem.product_id } });
          if (product?.track_inventory && product?.inventory_item_id) {
            await prisma.inventoryItem.update({
              where: { id: product.inventory_item_id },
              data: { quantity: { decrement: reqItem.quantity } }
            });
            await prisma.inventoryMovement.create({
              data: {
                business_id,
                inventory_item_id: product.inventory_item_id,
                type: 'OUT',
                quantity: reqItem.quantity,
                reference_type: 'Order',
                reference_id: updatedOrder.id
              }
            });
          }
        }

        notifyClients(business_id, 'UPDATE_ORDER', updatedOrder);
        res.status(200).json(updatedOrder);
        return;
      }
    }

    // items should be an array of { product_id, quantity, price }
    const order = await prisma.order.create({
      data: {
        business_id,
        table_id,
        waiter_id,
        notes,
        status: status || 'Pending',
        items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        table: true,
        waiter: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Decrement inventory for all items in the new order
    for (const item of order.items) {
      if (item.product?.track_inventory && item.product?.inventory_item_id) {
        await prisma.inventoryItem.update({
          where: { id: item.product.inventory_item_id },
          data: { quantity: { decrement: item.quantity } }
        });
        await prisma.inventoryMovement.create({
          data: {
            business_id,
            inventory_item_id: item.product.inventory_item_id,
            type: 'OUT',
            quantity: item.quantity,
            reference_type: 'Order',
            reference_id: order.id
          }
        });
      }
    }

    notifyClients(business_id, 'NEW_ORDER', order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, items, notes } = req.body;
    
    // First find the order
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
       res.status(404).json({ message: 'Order not found' });
       return;
    }

    // Prepare update data
    const updateData: any = { status, notes };

    // If we need to update items, we might need to delete old and create new ones (simplest approach for POS)
    if (items && Array.isArray(items)) {
      updateData.items = {
        deleteMany: {},
        create: items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        waiter: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // If status changed to Cancelled, restore inventory
    if (status === 'Cancelled' && existingOrder.status !== 'Cancelled') {
      for (const item of order.items) {
        if (item.product?.track_inventory && item.product?.inventory_item_id) {
          await prisma.inventoryItem.update({
            where: { id: item.product.inventory_item_id },
            data: { quantity: { increment: item.quantity } }
          });
          await prisma.inventoryMovement.create({
            data: {
              business_id: existingOrder.business_id,
              inventory_item_id: item.product.inventory_item_id,
              type: 'IN',
              quantity: item.quantity,
              reference_type: 'Order Cancelled',
              reference_id: order.id
            }
          });
        }
      }
    }

    notifyClients(existingOrder.business_id, 'UPDATE_ORDER', order);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
       res.status(404).json({ message: 'Order not found' });
       return;
    }

    const items = await prisma.orderItem.findMany({ 
      where: { order_id: id },
      include: { product: true }
    });

    // Restore inventory if not already cancelled
    if (order.status !== 'Cancelled') {
      for (const item of items) {
        if (item.product?.track_inventory && item.product?.inventory_item_id) {
          await prisma.inventoryItem.update({
            where: { id: item.product.inventory_item_id },
            data: { quantity: { increment: item.quantity } }
          });
          await prisma.inventoryMovement.create({
            data: {
              business_id: order.business_id,
              inventory_item_id: item.product.inventory_item_id,
              type: 'IN',
              quantity: item.quantity,
              reference_type: 'Order Deleted',
              reference_id: order.id
            }
          });
        }
      }
    }

    // Delete items first (though cascade might handle it if set, prisma doesn't cascade by default unless specified)
    await prisma.orderItem.deleteMany({
      where: { order_id: id }
    });

    await prisma.order.delete({
      where: { id }
    });

    notifyClients(order.business_id, 'DELETE_ORDER', { id });
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error });
  }
};
