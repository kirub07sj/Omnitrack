import { Router } from 'express';
import { getTables, createTable, updateTable, deleteTable, setupTables } from './table.controller';

const router = Router();

router.post('/setup', setupTables);
router.get('/', getTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

export default router;
