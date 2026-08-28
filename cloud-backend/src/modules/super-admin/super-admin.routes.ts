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
        email: sub.business.email,
        phone: sub.business.phone,
        address: sub.business.address,
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
      // Business Profile (matching desktop setup)
      businessName, 
      businessEmail,
      businessPhone,
      businessAddress,
      currency = 'USD',

      // Owner Info (matching desktop setup with separated email and username)
      ownerFirstName, 
      ownerLastName, 
      ownerEmail, 
      ownerUsername,
      ownerPassword, 

      // Subscription
      plan = 'pro',
      durationDays = 30 
    } = req.body;

    const usernameToUse = ownerUsername || ownerEmail;

    if (!businessName || !ownerFirstName || !ownerLastName || !ownerEmail || !usernameToUse || !ownerPassword) {
      res.status(400).json({ success: false, message: 'Missing required fields. Please provide business name, owner names, email, username, and password.' });
      return;
    }

    const existingAccount = await prisma.account.findUnique({ where: { email: ownerEmail } });
    if (existingAccount) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { username: usernameToUse } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'A user with this username already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(ownerPassword, salt);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays || 30));

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
          email: businessEmail || null,
          phone: businessPhone || null,
          address: businessAddress || null,
          currency: currency || 'USD',
          owner_name: `${ownerFirstName} ${ownerLastName}`.trim()
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
          email: ownerEmail || null,
          phone: businessPhone || null,
          address: businessAddress || null,
          status: 'Active'
        }
      });

      // 5. Create Owner User (distinct username separated from email!)
      await tx.user.create({
        data: {
          business_id: business.id,
          employee_id: employee.id,
          role_id: role.id,
          username: usernameToUse,
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

    const subscription = await prisma.subscription.findUnique({ where: { id: id as string } });
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
      where: { id: id as string },
      data: dataToUpdate
    });

    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
});


// 4. GET /businesses/:id - Detailed business view
router.get('/businesses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const business = await prisma.business.findUnique({
      where: { id: id as string },
      include: {
        users: {
          include: {
            role: true,
            employee: true
          }
        },
        
        subscriptions: {
          include: { account: true },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    res.json({ success: true, business });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch business details' });
  }
});


// 5. GET /users - List all users across the platform
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        business: { select: { name: true } },
        role: { select: { name: true } },
        employee: { select: { first_name: true, last_name: true, email: true } }
      }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching platform users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform users' });
  }
});

// 6. GET /subscriptions - List all subscriptions
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        business: { select: { name: true } },
        account: { select: { first_name: true, last_name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
});

export default router;


