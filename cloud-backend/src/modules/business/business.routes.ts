import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { validate } from '../../middleware/validate';
import { setupBusinessSchema, setupEmployeeSchema, setupProductSchema, updateSettingsSchema } from '../../schemas/business.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'omnitrack-cloud-secret';
const router = Router();

router.get('/status', async (req, res) => {
  try {
    const user = (req as any).user;
    let business: any = null;
    let hasOwner = false;

    if (user?.business_id) {
      business = await prisma.business.findUnique({ where: { id: user.business_id } });
      const ownerUser = await prisma.user.findFirst({
        where: { business_id: user.business_id, role: { name: 'Owner' } }
      });
      hasOwner = !!ownerUser;
    } else if (user?.account_id) {
      const sub = await prisma.subscription.findFirst({ where: { account_id: user.account_id } });
      if (sub) {
        business = await prisma.business.findUnique({ where: { id: sub.business_id } });
        const ownerUser = await prisma.user.findFirst({
          where: { business_id: sub.business_id, role: { name: 'Owner' } }
        });
        hasOwner = !!ownerUser;
      }
    }

    res.json({
      success: true,
      hasBusiness: !!business,
      hasOwner,
      isSetup: !!business && hasOwner,
      business
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking setup status' });
  }
});

router.post('/setup', validate(setupBusinessSchema), async (req, res) => {
  try {
    const { name, phone, email, address, currency } = req.body;
    const user = (req as any).user;

    const existingSub = await prisma.subscription.findFirst({ where: { account_id: user.account_id } });
    if (existingSub) return res.status(400).json({ success: false, message: 'You already have a business.' });

    const business = await prisma.business.create({
      data: { name, phone: phone || null, email: email || null, address: address || null, currency: currency || 'USD' }
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.subscription.create({
      data: { account_id: user.account_id, business_id: business.id, plan: 'free', status: 'trial', starts_at: new Date(), expires_at: expiresAt }
    });

    const newToken = jwt.sign({ account_id: user.account_id, email: user.email, business_id: business.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ success: true, business, token: newToken, message: 'Business profile created successfully!' });
  } catch (error) {
    console.error('Business setup error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred during setup.' });
  }
});

router.post('/setup-employee', validate(setupEmployeeSchema), async (req, res) => {
  try {
    const { firstName, lastName, roleName, username, password } = req.body;
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ success: false, message: 'Business not found' });

    let role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) role = await prisma.role.create({ data: { name: roleName } });

    const employee = await prisma.employee.create({
      data: { business_id, first_name: firstName, last_name: lastName, status: 'Active' }
    });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: { business_id, employee_id: employee.id, role_id: role.id, username, password_hash, status: 'Active' }
    });

    res.json({ success: true, message: 'Employee added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding employee' });
  }
});

router.post('/setup-product', validate(setupProductSchema), async (req, res) => {
  try {
    const { name, price } = req.body;
    const business_id = (req as any).user.business_id;
    if (!business_id) return res.status(400).json({ success: false, message: 'Business not found' });

    let category = await prisma.category.findFirst({ where: { business_id } });
    if (!category) category = await prisma.category.create({ data: { business_id, name: 'General' } });

    await prisma.product.create({
      data: { business_id, category_id: category.id, name, price: parseFloat(price) || 0, status: 'Active' }
    });
    res.json({ success: true, message: 'Product added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
});

router.put('/settings', validate(updateSettingsSchema), async (req, res) => {
  try {
    const business_id = (req as any).user.business_id;
    const { is_kitchen_active, name, owner_name, phone, email, address, logo, currency, tax_rate, settings } = req.body;

    const existing = await prisma.business.findUnique({ where: { id: business_id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Business not found' });

    const updated = await prisma.business.update({
      where: { id: business_id },
      data: {
        ...(is_kitchen_active !== undefined && { is_kitchen_active }),
        ...(name !== undefined && { name }),
        ...(owner_name !== undefined && { owner_name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(logo !== undefined && { logo }),
        ...(currency !== undefined && { currency }),
        ...(tax_rate !== undefined && { tax_rate }),
        ...(settings !== undefined && { settings })
      }
    });

    if (owner_name) {
      const ownerUser = await prisma.user.findFirst({ where: { role: { name: 'Owner' } }, include: { employee: true } });
      if (ownerUser?.employee_id) {
        const parts = owner_name.trim().split(' ');
        await prisma.employee.update({
          where: { id: ownerUser.employee_id },
          data: { first_name: parts[0], last_name: parts.slice(1).join(' ') || '.' }
        });
      }
    }

    res.json({ success: true, business: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
