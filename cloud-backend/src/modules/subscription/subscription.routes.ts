import { Router } from 'express';
import { getStatus, createTrialSubscription } from './subscription.controller';
import { validate } from '../../middleware/validate';
import { createTrialSubscriptionSchema } from '../../schemas/subscription.schema';

const router = Router();

router.get('/status', getStatus);
router.post('/trial', validate(createTrialSubscriptionSchema), createTrialSubscription);

export default router;
