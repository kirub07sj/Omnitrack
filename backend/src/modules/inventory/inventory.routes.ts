import { Router } from 'express';
import { getInventoryItems, getInventoryItemById, createInventoryItem, updateInventoryItem, deleteInventoryItem } from './inventory.controller';

const router = Router();

router.get('/', getInventoryItems);
router.get('/:id', getInventoryItemById);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
