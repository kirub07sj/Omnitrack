import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });

    const transactions = await prisma.transaction.findMany({
      where: { business_id: String(business_id) },
      include: {
        order: true,
        purchase: {
          include: {
            supplier: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
