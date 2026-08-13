import { Request, Response } from 'express';
import { prisma } from '../../database';


export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'business_id is required' });

    const expenses = await prisma.expense.findMany({
      where: { business_id: String(business_id) },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { business_id, category, amount, description, paid_to, status, receipt_image, date, method, reference } = req.body;

    if (!business_id || !category || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          business_id,
          category,
          amount,
          description,
          paid_to,
          status: status || 'UNPAID',
          receipt_image,
          date: date ? new Date(date) : new Date()
        }
      });

      if (exp.status === 'PAID') {
        await tx.transaction.create({
          data: {
            business_id,
            expense_id: exp.id,
            type: 'EXPENSE',
            amount,
            method: method || 'Cash',
            proof_image: receipt_image,
            status: 'PAID',
            date: new Date()
          }
        });
      }

      return exp;
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { category, amount, description, paid_to, date, status, method } = req.body;

    const expense = await prisma.$transaction(async (tx) => {
      // Get previous state
      const prevExp = await tx.expense.findUnique({ where: { id } });
      if (!prevExp) throw new Error('Expense not found');

      // Update expense
      const updated = await tx.expense.update({
        where: { id },
        data: {
          category,
          amount,
          description,
          paid_to,
          status,
          date: date ? new Date(date) : undefined
        }
      });

      // Handle transactions
      if (status === 'UNPAID' && prevExp.status === 'PAID') {
        // Delete linked transaction
        await tx.transaction.deleteMany({ where: { expense_id: id } });
      } else if (status === 'PAID' && prevExp.status === 'UNPAID') {
        // Create new transaction
        await tx.transaction.create({
          data: {
            business_id: updated.business_id,
            expense_id: id,
            type: 'EXPENSE',
            amount: updated.amount,
            method: method || 'Cash',
            status: 'PAID',
            date: new Date()
          }
        });
      } else if (status === 'PAID' && prevExp.status === 'PAID') {
        // Update existing transaction amounts/dates
        await tx.transaction.updateMany({
          where: { expense_id: id },
          data: { amount, method: method || undefined }
        });
      }

      return updated;
    });

    res.json({ success: true, data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { expense_id: id } });
      await tx.expense.delete({ where: { id } });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const payExpense = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { method, reference, receipt_image } = req.body;

    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.update({
        where: { id },
        data: { status: 'PAID', receipt_image: receipt_image || undefined }
      });

      // Avoid creating multiple transactions if already paid
      const existing = await tx.transaction.findFirst({ where: { expense_id: id } });
      if (!existing) {
        await tx.transaction.create({
          data: {
            business_id: exp.business_id,
            expense_id: exp.id,
            type: 'EXPENSE',
            amount: exp.amount,
            method: method || 'Cash',
            status: 'PAID',
            date: new Date()
          }
        });
      }

      return exp;
    });

    res.json({ success: true, data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
