import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { describeSubscription } from '../lib/subscription-access';

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user?.is_super_admin) {
    next();
    return;
  }

  if (!user?.business_id && !user?.account_id) {
    next();
    return;
  }

  try {
    const subscription = user.business_id
      ? await prisma.subscription.findUnique({ where: { business_id: user.business_id } })
      : await prisma.subscription.findFirst({
          where: { account_id: user.account_id },
          orderBy: { created_at: 'desc' }
        });

    if (!user.business_id && !subscription) {
      next();
      return;
    }

    const access = describeSubscription(subscription);
    if (access.blocked) {
      res.status(403).json({
        success: false,
        code: access.code,
        message: access.message
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify subscription status' });
  }
};
