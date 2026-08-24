import { Router } from 'express';
import { getUnpaidOrders, checkoutOrder, createManualSale, getSalesHistory, refundSale } from './sales.controller';
const router = Router();
router.get('/unpaid-orders', getUnpaidOrders);
router.post('/checkout', checkoutOrder);
router.post('/manual', createManualSale);
router.get('/history', getSalesHistory);
router.post('/refund', refundSale);
export default router;
