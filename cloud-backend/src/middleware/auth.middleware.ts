import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omnitrack-cloud-secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow public status checks for frontend bootstrapping
  if (req.path === '/business/status' || req.originalUrl === '/api/business/status') {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      account_id: string;
      email: string;
      business_id: string | null;
    };

    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
