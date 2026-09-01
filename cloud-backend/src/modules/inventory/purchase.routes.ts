import { Router } from 'express';
import * as PurchaseController from './purchase.controller';
import { validate } from '../../middleware/validate';
import { createPurchaseSchema, updatePurchaseStatusSchema } from '../../schemas/purchase.schema';

const router = Router();

router.get('/', PurchaseController.getPurchases);
router.post('/', validate(createPurchaseSchema), PurchaseController.createPurchase);
router.patch('/:id', validate(updatePurchaseStatusSchema), PurchaseController.updatePurchaseStatus);

export default router;
