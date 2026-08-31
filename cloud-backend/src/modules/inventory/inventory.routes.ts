import { Router } from 'express';
import { getInventoryItems, getInventoryItemById, createInventoryItem, updateInventoryItem, deleteInventoryItem, getInventoryMovements } from './inventory.controller';
import { validate } from '../../middleware/validate';
import { createInventoryItemSchema, updateInventoryItemSchema } from '../../schemas/inventory.schema';

const router = Router();

router.get('/', getInventoryItems);
router.get('/movements', getInventoryMovements);
router.get('/:id', getInventoryItemById);
router.post('/', validate(createInventoryItemSchema), createInventoryItem);
router.put('/:id', validate(updateInventoryItemSchema), updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
