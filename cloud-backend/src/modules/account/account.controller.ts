import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Removed top level JWT_SECRET

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existing = await prisma.account.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const account = await prisma.account.create({
      data: { email, password_hash, first_name, last_name }
    });

    const isSuperAdmin = (account as any).is_super_admin ?? false;

    const token = jwt.sign(
      { account_id: account.id, email: account.email, business_id: null, is_super_admin: isSuperAdmin },
      (process.env.JWT_SECRET || 'omnitrack-cloud-secret'),
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      account: {
        id: account.id,
        email: account.email,
        first_name: account.first_name,
        last_name: account.last_name,
        is_super_admin: isSuperAdmin,
        business_id: null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register account', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Look up active subscription to find business_id
    const subscription = await prisma.subscription.findFirst({
      where: {
        account_id: account.id,
        status: { in: ['active', 'trial'] }
      }
    });

    const business_id = subscription?.business_id || null;
    const isSuperAdmin = (account as any).is_super_admin ?? false;

    const token = jwt.sign(
      { account_id: account.id, email: account.email, business_id, is_super_admin: isSuperAdmin },
      (process.env.JWT_SECRET || 'omnitrack-cloud-secret'),
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      account: {
        id: account.id,
        email: account.email,
        first_name: account.first_name,
        last_name: account.last_name,
        is_super_admin: isSuperAdmin,
        business_id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { account_id } = (req as any).user;

    const account = await prisma.account.findUnique({
      where: { id: account_id },
      select: { id: true, email: true, first_name: true, last_name: true, created_at: true }
    });

    if (!account) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { account_id },
      include: { business: { select: { id: true, name: true } } }
    });

    res.json({ ...account, subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error });
  }
};
