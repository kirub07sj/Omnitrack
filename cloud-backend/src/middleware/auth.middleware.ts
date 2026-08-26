import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Removed top-level JWT_SECRET to avoid ES6 hoisting order issues

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
    const secret = process.env.JWT_SECRET || 'omnitrack-cloud-secret';
    const decoded = jwt.verify(token, secret) as {
      account_id: string;
      email: string;
      business_id: string | null;
      is_super_admin: boolean;
    };

    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verify Error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
