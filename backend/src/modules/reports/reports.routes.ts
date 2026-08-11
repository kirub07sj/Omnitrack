import { Router, Request, Response } from 'express';
import prisma from '../../database';

const router = Router();

const getDateFilter = (req: Request, dateField: string = 'created_at') => {
  const { startDate, endDate } = req.query;
  const filter: any = {};
  if (startDate) {
    filter.gte = new Date(startDate as string);
  }
  if (endDate) {
    const end = new Date(endDate as string);
    end.setUTCHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return Object.keys(filter).length > 0 ? { [dateField]: filter } : {};
};

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const dateFilter = getDateFilter(req, 'date');
    
    const transactions = await prisma.transaction.findMany({
      where: dateFilter
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const dailyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      const day = t.date.toISOString().split('T')[0];

      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expense: 0 };
      }

      if (t.type === 'INCOME') {
         totalIncome += amount;
         dailyData[day].income += amount;
      } else if (t.type === 'EXPENSE') {
         totalExpense += amount;
         dailyData[day].expense += amount;
      }
    });

    const netCashFlow = totalIncome - totalExpense;
    const chartData = Object.keys(dailyData).map(date => ({
      date,
      income: dailyData[date].income,
      expense: dailyData[date].expense
    })).sort((a, b) => a.date.localeCompare(b.date));

    const saleDateFilter = getDateFilter(req, 'created_at');
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          sales: {
            some: saleDateFilter
          }
        }
      },
      include: {
        product: true
      }
    });

    const productSales: Record<string, { name: string, value: number }> = {};
    orderItems.forEach(item => {
      if (item.product) {
        const pName = item.product.name;
        if (!productSales[pName]) {
          productSales[pName] = { name: pName, value: 0 };
        }
        productSales[pName].value += Number(item.quantity);
      }
    });
    
    const topProducts = Object.values(productSales).sort((a, b) => b.value - a.value).slice(0, 5);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netCashFlow,
        chartData,
        topProducts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch overview' });
  }
});

router.get('/sales', async (req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      where: getDateFilter(req, 'created_at'),
      include: {
        order: true,
        cashier: true
      }
    });
    res.json({ success: true, data: sales });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch sales' });
  }
});

router.get('/expenses', async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: getDateFilter(req, 'date')
    });
    res.json({ success: true, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch expenses' });
  }
});

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: getDateFilter(req, 'date')
    });
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch transactions' });
  }
});

router.get('/inventory', async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.inventoryItem.findMany();
    res.json({ success: true, data: inventory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch inventory' });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: getDateFilter(req, 'created_at'),
      include: {
        orders: {
          include: {
            order: {
              include: {
                sales: true
              }
            }
          }
        }
      }
    });

    const data = products.map(p => {
      let soldCount = 0;
      p.orders.forEach(oi => {
        if (oi.order && oi.order.sales && oi.order.sales.length > 0) {
          soldCount += Number(oi.quantity);
        }
      });
      const { orders, ...rest } = p;
      return {
        ...rest,
        soldCount
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch products' });
  }
});

export default router;
