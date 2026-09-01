import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isStatusCheck = req.path === '/business/status' || req.originalUrl === '/api/business/status';
  
  // Check for token in cookies first, then fallback to Authorization header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (isStatusCheck) {
      next();
      return;
    }
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'omnitrack-cloud-secret';
    const decoded = jwt.verify(token, secret) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verify Error:', error);
    if (isStatusCheck) {
      next();
      return;
    }
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
