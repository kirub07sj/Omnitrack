import { Router } from 'express';
import { getUnpaidCounts } from './dashboard.controller';

const router = Router();

router.get('/unpaid-counts', getUnpaidCounts);

export default router;
