import { Router } from 'express';
import { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } from './supplier.controller';
import { validate } from '../../middleware/validate';
import { createSupplierSchema, updateSupplierSchema } from '../../schemas/supplier.schema';

const router = Router();

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', validate(createSupplierSchema), createSupplier);
router.put('/:id', validate(updateSupplierSchema), updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
