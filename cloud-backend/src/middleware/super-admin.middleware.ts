import { Request, Response, NextFunction } from 'express';

export const superAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || !user.is_super_admin) {
    res.status(403).json({ message: 'Forbidden: Super Admin access required' });
    return;
  }

  next();
};
