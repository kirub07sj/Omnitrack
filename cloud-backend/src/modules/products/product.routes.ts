import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './product.controller';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema } from '../../schemas/product.schema';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
