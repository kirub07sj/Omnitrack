import { Router } from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, streamOrders } from './order.controller';
import { validate } from '../../middleware/validate';
import { createOrderSchema, updateOrderSchema } from '../../schemas/order.schema';

const router = Router();

router.get('/sse', streamOrders);
router.get('/', getOrders);
router.post('/', validate(createOrderSchema), createOrder);
router.put('/:id', validate(updateOrderSchema), updateOrder);
router.delete('/:id', deleteOrder);

export default router;
