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

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true, employee: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // For MVP, returning the user object directly. In production, issue a JWT here.
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        firstName: user.employee.first_name,
        lastName: user.employee.last_name,
        role: user.role.name,
        business_id: user.employee.business_id,
        employee_id: user.employee.id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
});
router.put('/update-profile', async (req, res) => {
  try {
    const { userId, firstName, lastName, currentPin, newPin } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update Employee Name
    if (firstName || lastName) {
      await prisma.employee.update({
        where: { id: user.employee_id },
        data: {
          first_name: firstName || user.employee.first_name,
          last_name: lastName || user.employee.last_name
        }
      });
    }

    // Update PIN if provided
    if (currentPin && newPin) {
      const isValid = await bcrypt.compare(currentPin, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current PIN is incorrect.' });
      }
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPin, salt);
      
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash }
      });
    }

    // Return updated user object
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true, role: true }
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser!.id,
        username: updatedUser!.username,
        firstName: updatedUser!.employee.first_name,
        lastName: updatedUser!.employee.last_name,
        role: updatedUser!.role.name,
        business_id: updatedUser!.employee.business_id,
        employee_id: updatedUser!.employee.id
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating profile.' });
  }
});

export default router;
