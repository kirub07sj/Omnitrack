import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { validate } from '../../middleware/validate';
import { setupOwnerSchema, loginSchema, updateProfileSchema } from '../../schemas/auth.schema';

const router = Router();

router.post('/setup-owner', validate(setupOwnerSchema), async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const business_id = (req as any).user.business_id;

    if (!business_id) return res.status(400).json({ success: false, message: 'Business not found.' });

    const existingOwner = await prisma.user.findFirst({ where: { business_id, role: { name: 'Owner' } } });
    if (existingOwner) return res.status(400).json({ success: false, message: 'Owner account already exists.' });

    let role = await prisma.role.findFirst({ where: { name: 'Owner' } });
    if (!role) role = await prisma.role.create({ data: { name: 'Owner' } });

    const employee = await prisma.employee.create({
      data: { business_id, first_name: firstName, last_name: lastName, status: 'Active' }
    });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: { business_id, employee_id: employee.id, role_id: role.id, username, password_hash, status: 'Active' }
    });

    res.status(201).json({ success: true, message: 'Owner account created successfully.' });
  } catch (error) {
    console.error('Owner setup error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true, employee: true }
    });

    if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password.' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid username or password.' });

    const token = jwt.sign(
      { 
        id: user.id, 
        business_id: user.business_id, 
        role: user.role.name 
      },
      process.env.JWT_SECRET || 'omnitrack-cloud-secret',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, { httpOnly: true, secure: process.env.VERCEL ? true : false, sameSite: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'none' : 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true,
      user: {
        id: user.id, username: user.username,
        firstName: user.employee.first_name, lastName: user.employee.last_name,
        email: user.employee.email, role: user.role.name,
        business_id: user.employee.business_id, employee_id: user.employee.id
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login.', error: error?.message || String(error), stack: error?.stack });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { sameSite: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'none' : 'lax', secure: process.env.VERCEL ? true : false });
  res.json({ success: true, message: 'Logged out successfully' });
});

router.put('/update-profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const { userId, firstName, lastName, currentPin, newPin, email } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { employee: true, role: true } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (firstName !== undefined || lastName !== undefined || email !== undefined) {
      await prisma.employee.update({
        where: { id: user.employee_id },
        data: {
          first_name: firstName !== undefined ? firstName : user.employee.first_name,
          last_name: lastName !== undefined ? lastName : user.employee.last_name,
          email: email !== undefined ? email : user.employee.email
        }
      });
    }

    if (currentPin && newPin) {
      const isValid = await bcrypt.compare(currentPin, user.password_hash);
      if (!isValid) return res.status(401).json({ success: false, message: 'Current PIN is incorrect.' });
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPin, salt);
      await prisma.user.update({ where: { id: userId }, data: { password_hash } });
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: userId }, include: { employee: true, role: true } });
    res.json({
      success: true, message: 'Profile updated successfully.',
      user: {
        id: updatedUser!.id, username: updatedUser!.username,
        firstName: updatedUser!.employee.first_name, lastName: updatedUser!.employee.last_name,
        email: updatedUser!.employee.email, role: updatedUser!.role.name,
        business_id: updatedUser!.employee.business_id, employee_id: updatedUser!.employee.id
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile.' });
  }
});

export default router;
