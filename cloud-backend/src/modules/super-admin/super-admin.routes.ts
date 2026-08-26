import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';
import { superAdminMiddleware } from '../../middleware/super-admin.middleware';

const router = Router();

// Apply super admin middleware to all routes in this file
router.use(superAdminMiddleware);

// 1. GET /tenants - List all businesses/subscriptions
router.get('/tenants', async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        account: {
          select: { id: true, email: true, first_name: true, last_name: true }
        },
        business: {
          include: {
            users: {
              where: { role: { name: 'Owner' } },
              include: { employee: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const tenants = subscriptions.map(sub => ({
      subscription_id: sub.id,
      plan: sub.plan,
      status: sub.status,
      starts_at: sub.starts_at,
      expires_at: sub.expires_at,
      account: sub.account,
      business: sub.business ? {
        id: sub.business.id,
        name: sub.business.name,
        created_at: sub.business.created_at,
        owner: sub.business.users[0]?.employee ? {
          first_name: sub.business.users[0].employee.first_name,
          last_name: sub.business.users[0].employee.last_name,
          username: sub.business.users[0].username,
        } : null
      } : null
    }));

    res.json({ success: true, tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tenants' });
  }
});

// 2. POST /tenants - Create a new tenant (Account, Business, Owner User, Subscription)
router.post('/tenants', async (req: Request, res: Response) => {
  try {
    const { 
      businessName, 
      ownerFirstName, 
      ownerLastName, 
      ownerEmail, 
      ownerPassword, 
      plan = 'pro',
      durationDays = 30 
    } = req.body;

    if (!businessName || !ownerFirstName || !ownerLastName || !ownerEmail || !ownerPassword) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const existingAccount = await prisma.account.findUnique({ where: { email: ownerEmail } });
    if (existingAccount) {
      res.status(409).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(ownerPassword, salt);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Account
      const account = await tx.account.create({
        data: {
          email: ownerEmail,
          password_hash,
          first_name: ownerFirstName,
          last_name: ownerLastName,
        }
      });

      // 2. Create Business
      const business = await tx.business.create({
        data: {
          name: businessName,
          currency: 'USD'
        }
      });

      // 3. Create Owner Role if not exists
      let role = await tx.role.findFirst({ where: { name: 'Owner' } });
      if (!role) {
        role = await tx.role.create({ data: { name: 'Owner' } });
      }

      // 4. Create Owner Employee
      const employee = await tx.employee.create({
        data: {
          business_id: business.id,
          first_name: ownerFirstName,
          last_name: ownerLastName,
          status: 'Active'
        }
      });

      // 5. Create Owner User
      await tx.user.create({
        data: {
          business_id: business.id,
          employee_id: employee.id,
          role_id: role.id,
          username: ownerEmail, // Using email as username
          password_hash,
          status: 'Active'
        }
      });

      // 6. Create initial categories (General)
      await tx.category.create({
        data: { business_id: business.id, name: 'General' }
      });

      // 7. Create Subscription
      const subscription = await tx.subscription.create({
        data: {
          account_id: account.id,
          business_id: business.id,
          plan,
          status: 'active',
          starts_at: new Date(),
          expires_at: expiresAt
        }
      });

      return { account, business, subscription };
    });

    res.status(201).json({ success: true, message: 'Tenant created successfully', data: result });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ success: false, message: 'Failed to create tenant', error });
  }
});

// 3. PUT /tenants/:id/subscription - Update subscription
router.put('/tenants/:id/subscription', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, addDays } = req.body;

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    
    if (addDays) {
      const currentExpiry = subscription.expires_at && subscription.expires_at > new Date() 
        ? subscription.expires_at 
        : new Date();
      
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + addDays);
      dataToUpdate.expires_at = newExpiry;
      dataToUpdate.status = 'active'; // Automatically set to active if extending time
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
});

export default router;
