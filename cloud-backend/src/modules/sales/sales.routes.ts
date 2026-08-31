import { Router } from 'express';
import { getUnpaidOrders, checkoutOrder, createManualSale, getSalesHistory, refundSale } from './sales.controller';
import { validate } from '../../middleware/validate';
import { checkoutOrderSchema, createManualSaleSchema, refundSaleSchema } from '../../schemas/sales.schema';

const router = Router();
router.get('/unpaid-orders', getUnpaidOrders);
router.post('/checkout', validate(checkoutOrderSchema), checkoutOrder);
router.post('/manual', validate(createManualSaleSchema), createManualSale);
router.get('/history', getSalesHistory);
router.post('/refund', validate(refundSaleSchema), refundSale);
export default router;
