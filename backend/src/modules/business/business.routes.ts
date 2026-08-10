import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../database';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const existingBusiness = await prisma.business.findFirst();
    const existingOwner = await prisma.user.findFirst({
      where: { role: { name: 'Owner' } }
    });
    res.json({ 
      success: true, 
      hasBusiness: !!existingBusiness,
      hasOwner: !!existingOwner,
      isSetup: !!existingBusiness && !!existingOwner,
      business: existingBusiness
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking setup status' });
  }
});

router.post('/setup', async (req, res) => {
  try {
    const { name, phone, email, address, currency } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Business name is required.' });
    }

    // Check if a business already exists (Offline-first approach usually has 1 main business per local instance)
    const existing = await prisma.business.findFirst();
    if (existing) {
      return res.status(400).json({ success: false, message: 'A business profile has already been set up on this device.' });
    }

    const business = await prisma.business.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        currency: currency || 'USD',
      }
    });

    res.status(201).json({ success: true, business, message: 'Business profile created successfully!' });
  } catch (error) {
    console.error('Business setup error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred during setup.' });
  }
});

router.post('/setup-employee', async (req, res) => {
  try {
    const { firstName, lastName, roleName, username, password } = req.body;
    const business = await prisma.business.findFirst();
    if (!business) return res.status(400).json({ success: false, message: 'Business not found' });
    
    let role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }

    const employee = await prisma.employee.create({
      data: {
        business_id: business.id,
        first_name: firstName,
        last_name: lastName,
        status: 'Active'
      }
    });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        business_id: business.id,
        employee_id: employee.id,
        role_id: role.id,
        username,
        password_hash,
        status: 'Active'
      }
    });

    res.json({ success: true, message: 'Employee added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding employee' });
  }
});

router.post('/setup-product', async (req, res) => {
  try {
    const { name, price } = req.body;
    const business = await prisma.business.findFirst();
    if (!business) return res.status(400).json({ success: false, message: 'Business not found' });
    
    let category = await prisma.category.findFirst({ where: { business_id: business.id } });
    if (!category) {
      category = await prisma.category.create({ data: { business_id: business.id, name: 'General' } });
    }

    await prisma.product.create({
      data: {
        business_id: business.id,
        category_id: category.id,
        name,
        price: parseFloat(price) || 0,
        status: 'Active'
      }
    });
    res.json({ success: true, message: 'Product added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { 
      is_kitchen_active, 
      name, 
      owner_name, 
      phone, 
      email, 
      address, 
      logo, 
      currency, 
      tax_rate, 
      settings 
    } = req.body;
    
    const existing = await prisma.business.findFirst();
    if (!existing) return res.status(404).json({ success: false, message: 'Business not found' });
    
    const updated = await prisma.business.update({
      where: { id: existing.id },
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
    res.json({ success: true, business: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
