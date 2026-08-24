import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });
    const transactions = await prisma.transaction.findMany({
      where: { business_id },
      include: { order: true, purchase: { include: { supplier: true } }, expense: true },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: transactions });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
};
