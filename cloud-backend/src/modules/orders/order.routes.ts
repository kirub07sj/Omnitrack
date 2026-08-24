import { Router } from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, streamOrders } from './order.controller';
const router = Router();
router.get('/sse', streamOrders);
router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
export default router;
