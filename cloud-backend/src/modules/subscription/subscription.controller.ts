import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getStatus = async (req: Request, res: Response) => {
  try {
    const business_id = (req as any).user?.business_id;

    if (!business_id) {
      res.json({ subscription: null, message: 'No business associated' });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { business_id }
    });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscription status', error });
  }
};

export const createTrialSubscription = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.body;
    const account_id = (req as any).user.account_id;

    if (!business_id) {
      res.status(400).json({ message: 'business_id is required' });
      return;
    }

    const existing = await prisma.subscription.findUnique({ where: { business_id } });
    if (existing) {
      res.status(409).json({ message: 'A subscription already exists for this business' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const subscription = await prisma.subscription.create({
      data: {
        account_id,
        business_id,
        plan: 'free',
        status: 'trial',
        starts_at: new Date(),
        expires_at: expiresAt
      }
    });

    res.status(201).json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create trial subscription', error });
  }
};
