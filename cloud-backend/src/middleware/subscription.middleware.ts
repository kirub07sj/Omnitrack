import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user?.business_id) {
    // User hasn't created a business yet — allow through
    next();
    return;
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { business_id: user.business_id }
    });

    if (!subscription) {
      res.status(403).json({ message: 'Subscription required. Please subscribe to continue.' });
      return;
    }

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      res.status(403).json({ message: 'Your subscription is inactive. Please renew to continue.' });
      return;
    }

    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      res.status(403).json({ message: 'Your subscription has expired. Please renew to continue.' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify subscription status' });
  }
};
