import { Router } from 'express';
import { getUnpaidCounts, getOwnerDashboard, getManagerDashboard, getNotifications } from './dashboard.controller';
const router = Router();
router.get('/unpaid-counts', getUnpaidCounts);
router.get('/notifications', getNotifications);
router.get('/owner', getOwnerDashboard);
router.get('/manager', getManagerDashboard);
export default router;
