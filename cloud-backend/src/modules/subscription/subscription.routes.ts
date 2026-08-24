import { Router } from 'express';
import { getStatus, createTrialSubscription } from './subscription.controller';

const router = Router();

router.get('/status', getStatus);
router.post('/trial', createTrialSubscription);

export default router;
