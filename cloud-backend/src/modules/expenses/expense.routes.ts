import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense, payExpense } from './expense.controller';
import { validate } from '../../middleware/validate';
import { createExpenseSchema, updateExpenseSchema, payExpenseSchema } from '../../schemas/expense.schema';

const router = Router();
router.get('/', getExpenses);
router.post('/', validate(createExpenseSchema), createExpense);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);
router.post('/:id/pay', validate(payExpenseSchema), payExpense);
export default router;
