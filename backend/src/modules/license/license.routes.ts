import { Router } from 'express';
import { activate, deactivate, checkLicenseOnStartup, verifyCertificateLocally, getLicenseState } from '../../services/license.service';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = await checkLicenseOnStartup();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ allowed: false, reason: error.message });
  }
});

router.get('/info', (req, res) => {
  try {
    const state = getLicenseState();
    if (!state) {
      return res.status(404).json({ success: false, message: 'No license found' });
    }
    res.json({ success: true, data: state });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/activate', async (req, res) => {
  const { licenseKey } = req.body;
  
  if (!licenseKey) {
    return res.status(400).json({ success: false, message: 'License key is required' });
  }
  
  try {
    const cert = await activate(licenseKey);
    const claims = verifyCertificateLocally(cert);
    return res.json({ success: true, message: 'License activated successfully!', data: claims });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to activate license.' });
  }
});

router.post('/deactivate', async (req, res) => {
  try {
    await deactivate();
    return res.json({ success: true, message: 'License deactivated successfully!' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to deactivate license.' });
  }
});

export default router;
