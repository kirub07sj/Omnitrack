import { Router } from 'express';
import prisma from '../../database';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const existing = await prisma.business.findFirst();
    res.json({ success: true, isSetup: !!existing });
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

export default router;
