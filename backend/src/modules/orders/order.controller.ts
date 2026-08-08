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
    const { business_id, table_id, waiter_id, notes, items } = req.body;

    // items should be an array of { product_id, quantity, price }
    const order = await prisma.order.create({
      data: {
        business_id,
        table_id,
        waiter_id,
        notes,
        status: 'Pending',
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
