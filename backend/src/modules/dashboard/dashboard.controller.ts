import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUnpaidCounts = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    // Unpaid Sales (Orders where status is not PAID, typically PENDING, SERVED, etc. Wait, we should define what unpaid means. In sales.controller.ts or order.controller.ts, paid orders have status 'PAID'.)
    // Let's check what 'status' values orders have. Typically 'PENDING', 'PREPARING', 'SERVED', 'PAID'.
    const unpaidSalesCount = await prisma.order.count({
      where: {
        business_id: String(business_id),
        status: { notIn: ['PAID', 'CANCELLED'] } // everything not paid or cancelled is effectively unpaid
      }
    });

    // Unpaid Expenses (Expense where status === 'UNPAID')
    const unpaidExpensesCount = await prisma.expense.count({
      where: {
        business_id: String(business_id),
        status: 'UNPAID'
      }
    });

    // Unpaid Inventory Purchases (Purchase where status === 'UNPAID' or similar)
    const unpaidPurchasesCount = await prisma.purchase.count({
      where: {
        business_id: String(business_id),
        status: { in: ['Unpaid', 'UNPAID'] } // Handling case-sensitivity just in case
      }
    });

    res.json({
      success: true,
      data: {
        unpaidSales: unpaidSalesCount,
        unpaidExpenses: unpaidExpensesCount,
        unpaidPurchases: unpaidPurchasesCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch unpaid counts', error: error.message });
  }
};
