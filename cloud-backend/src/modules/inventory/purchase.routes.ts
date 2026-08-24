import { Router } from 'express';
import * as PurchaseController from './purchase.controller';
const router = Router();
router.get('/', PurchaseController.getPurchases);
router.post('/', PurchaseController.createPurchase);
router.patch('/:id', PurchaseController.updatePurchaseStatus);
export default router;
