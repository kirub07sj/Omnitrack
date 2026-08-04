import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../database';

const router = Router();

router.post('/setup-owner', async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;

    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const business = await prisma.business.findFirst();
    if (!business) {
      return res.status(400).json({ success: false, message: 'Business profile not found. Please setup business first.' });
    }

    // Check if owner already exists
    const existingOwner = await prisma.user.findFirst({
      where: { role: { name: 'Owner' } }
    });
    
    if (existingOwner) {
      return res.status(400).json({ success: false, message: 'Owner account already exists.' });
    }

    // Ensure Owner role exists
    let role = await prisma.role.findFirst({ where: { name: 'Owner' } });
    if (!role) {
      role = await prisma.role.create({ data: { name: 'Owner' } });
    }

    // Create Employee record
    const employee = await prisma.employee.create({
      data: {
        business_id: business.id,
        first_name: firstName,
        last_name: lastName,
        status: 'Active'
      }
    });

    // Hash password and create User record
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        business_id: business.id,
        employee_id: employee.id,
        role_id: role.id,
        username,
        password_hash,
        status: 'Active'
      }
    });

    res.status(201).json({ success: true, message: 'Owner account created successfully.' });
  } catch (error) {
    console.error('Owner setup error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

export default router;
