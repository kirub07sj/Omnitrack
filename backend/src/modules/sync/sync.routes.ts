import { Router } from 'express';
import { syncEngine } from './sync.engine';

const router = Router();

// GET /api/sync/status
// Returns the current status of the sync engine
router.get('/status', async (req, res) => {
  try {
    const status = await syncEngine.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sync/now
// Manually triggers a synchronization
router.post('/now', async (req, res) => {
  try {
    // Start sync asynchronously
    syncEngine.sync();
    res.json({ success: true, message: 'Synchronization triggered' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sync/history
router.get('/history', async (req, res) => {
  try {
    const { prisma } = require('../../database');
    const history = await prisma.syncChange.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
