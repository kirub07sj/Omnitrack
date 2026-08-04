import { Router } from 'express';

const router = Router();

router.post('/activate', (req, res) => {
  const { licenseKey } = req.body;
  
  // Using a static key for MVP validation
  if (licenseKey === 'OMNITRACK-VALID-KEY') {
    return res.json({ success: true, message: 'License activated successfully!' });
  }
  
  return res.status(400).json({ success: false, message: 'Invalid license key. Please check and try again.' });
});

export default router;
