import { Router } from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from './category.controller';
import { validate } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../../schemas/category.schema';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
