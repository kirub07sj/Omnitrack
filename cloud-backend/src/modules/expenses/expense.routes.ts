import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense, payExpense } from './expense.controller';
const router = Router();
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.post('/:id/pay', payExpense);
export default router;
