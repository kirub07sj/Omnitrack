import { Router } from 'express';
import { getUnpaidCounts, getOwnerDashboard, getManagerDashboard } from './dashboard.controller';
const router = Router();
router.get('/unpaid-counts', getUnpaidCounts);
router.get('/owner', getOwnerDashboard);
router.get('/manager', getManagerDashboard);
export default router;
