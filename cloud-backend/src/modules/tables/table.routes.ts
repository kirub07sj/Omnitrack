import { Router } from 'express';
import { getTables, createTable, updateTable, deleteTable, setupTables } from './table.controller';
import { validate } from '../../middleware/validate';
import { setupTablesSchema, createTableSchema, updateTableSchema } from '../../schemas/table.schema';

const router = Router();
router.post('/setup', validate(setupTablesSchema), setupTables);
router.get('/', getTables);
router.post('/', validate(createTableSchema), createTable);
router.put('/:id', validate(updateTableSchema), updateTable);
router.delete('/:id', deleteTable);
export default router;
