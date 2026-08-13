import { Request, Response } from 'express';
import { prisma } from '../../database';


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

export const getOwnerDashboard = async (req: Request, res: Response) => {
  try {
    const { business_id, dateRange } = req.query;
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let prevStartDate = new Date(startDate);
    let prevEndDate = new Date(endDate);
    
    if (dateRange === 'week') {
       startDate.setDate(startDate.getDate() - startDate.getDay());
       prevStartDate.setDate(startDate.getDate() - 7);
       prevEndDate = new Date(startDate);
       prevEndDate.setMilliseconds(-1);
    } else if (dateRange === 'month') {
       startDate.setDate(1);
       prevStartDate.setMonth(startDate.getMonth() - 1);
       prevStartDate.setDate(1);
       prevEndDate = new Date(startDate);
       prevEndDate.setMilliseconds(-1);
    } else {
       // today
       prevStartDate.setDate(startDate.getDate() - 1);
       prevEndDate.setDate(endDate.getDate() - 1);
    }

    // 1. Financial Summary
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        business_id: String(business_id),
        date: { gte: startDate, lte: endDate }
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    currentTransactions.forEach(t => {
      if (t.type === 'INCOME') totalIncome += Number(t.amount);
      if (t.type === 'EXPENSE') totalExpense += Number(t.amount);
    });
    const netCashFlow = totalIncome - totalExpense;

    // Previous period
    const prevTransactions = await prisma.transaction.findMany({
      where: {
        business_id: String(business_id),
        date: { gte: prevStartDate, lte: prevEndDate }
      }
    });
    let prevTotalIncome = 0;
    prevTransactions.forEach(t => {
      if (t.type === 'INCOME') prevTotalIncome += Number(t.amount);
    });
    
    // Generate detailed chart data
    const chartData: any[] = [];
    if (dateRange === 'today') {
      // Hourly data for today (0-23)
      for (let i = 0; i < 24; i++) {
        chartData.push({ name: `${i}:00`, income: 0, expense: 0 });
      }
      currentTransactions.forEach(t => {
        const hour = new Date(t.date).getHours();
        if (t.type === 'INCOME') chartData[hour].income += Number(t.amount);
        if (t.type === 'EXPENSE') chartData[hour].expense += Number(t.amount);
      });
    } else if (dateRange === 'week') {
      // Daily data for the week (Sun-Sat)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        chartData.push({ name: days[i], income: 0, expense: 0 });
      }
      currentTransactions.forEach(t => {
        const day = new Date(t.date).getDay();
        if (t.type === 'INCOME') chartData[day].income += Number(t.amount);
        if (t.type === 'EXPENSE') chartData[day].expense += Number(t.amount);
      });
    } else if (dateRange === 'month') {
      // Daily data for the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        chartData.push({ name: i.toString(), income: 0, expense: 0 });
      }
      currentTransactions.forEach(t => {
        const date = new Date(t.date).getDate();
        if (t.type === 'INCOME') chartData[date - 1].income += Number(t.amount);
        if (t.type === 'EXPENSE') chartData[date - 1].expense += Number(t.amount);
      });
    }

    const salesPerformance = {
      current: totalIncome,
      previous: prevTotalIncome,
      percentChange: prevTotalIncome === 0 ? 100 : ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100,
      chartData
    };

    // 2. Activity Summary (Orders)
    const todayOrders = await prisma.order.findMany({
      where: {
        business_id: String(business_id),
        created_at: { gte: startDate, lte: endDate }
      },
      include: { table: true }
    });
    
    // Active tables
    const activeTables = new Set(todayOrders.filter(o => !['PAID', 'CANCELLED'].includes(o.status || '') && o.table_id).map(o => o.table_id));
    const totalTables = await prisma.restaurantTable.count({ where: { business_id: String(business_id) }});
    
    const activitySummary = {
      total: todayOrders.length,
      completed: todayOrders.filter(o => o.status === 'PAID').length,
      inProgress: todayOrders.filter(o => !['PAID', 'CANCELLED'].includes(o.status || '')).length,
      cancelled: todayOrders.filter(o => o.status === 'CANCELLED').length,
      activeTables: activeTables.size,
      totalTables
    };

    // 3. Alerts & Inventory
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { business_id: String(business_id) }
    });
    const lowStockItems = inventoryItems.filter(i => Number(i.quantity) <= Number(i.minimum_quantity) && Number(i.quantity) > 0);
    const outOfStockItems = inventoryItems.filter(i => Number(i.quantity) <= 0);
    const inventoryValue = inventoryItems.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.cost_per_unit || 0)), 0);

    const inventorySummary = {
      totalItems: inventoryItems.length,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      value: inventoryValue,
      topLowStock: [...outOfStockItems, ...lowStockItems].slice(0, 5)
    };

    const unpaidPurchasesCount = await prisma.purchase.count({
      where: { business_id: String(business_id), status: { in: ['Unpaid', 'UNPAID'] } }
    });
    const unpaidExpensesCount = await prisma.expense.count({
      where: { business_id: String(business_id), status: 'UNPAID' }
    });

    const alerts = {
      lowStock: lowStockItems.length + outOfStockItems.length,
      unpaidPurchases: unpaidPurchasesCount,
      unpaidExpenses: unpaidExpensesCount,
      pendingOrders: activitySummary.inProgress
    };

    // 4. Staff Summary
    const employees = await prisma.employee.findMany({
      where: { business_id: String(business_id) }
    });
    
    const ordersByWaiter: Record<string, number> = {};
    todayOrders.forEach(o => {
      if (o.waiter_id) {
         ordersByWaiter[o.waiter_id] = (ordersByWaiter[o.waiter_id] || 0) + 1;
      }
    });
    
    const staffSummary = {
      totalActive: employees.filter(e => e.status === 'ACTIVE').length,
      activeToday: Object.keys(ordersByWaiter).length,
      waiterPerformance: Object.entries(ordersByWaiter).map(([id, count]) => {
         const emp = employees.find(e => e.id === id);
         return { name: emp ? emp.first_name : 'Unknown', orders: count };
      }).sort((a, b) => b.orders - a.orders).slice(0, 5)
    };

    // 5. Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { business_id: String(business_id) },
      orderBy: { date: 'desc' },
      take: 6,
      include: {
         order: true,
         expense: true,
         purchase: { include: { supplier: true } }
      }
    });

    res.json({
      success: true,
      data: {
        financialSummary: { totalIncome, totalExpense, moneyOut: totalExpense, netCashFlow, transactions: currentTransactions.length },
        salesPerformance,
        activitySummary,
        alerts,
        inventorySummary,
        staffSummary,
        recentTransactions: recentTransactions.map(t => {
           let description = 'Transaction';
           if (t.type === 'INCOME' && t.order) description = `Order #${t.order.id.split('-')[0]}`;
           if (t.type === 'EXPENSE' && t.expense) description = t.expense.description || t.expense.category;
           if (t.type === 'EXPENSE' && t.purchase) description = `Purchase: ${t.purchase.supplier?.name || 'Supplier'}`;
           return {
             id: t.id,
             amount: Number(t.amount),
             type: t.type,
             description,
             method: t.method || 'Cash',
             date: t.date
           };
        })
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getManagerDashboard = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
       res.status(400).json({ message: 'business_id is required' });
       return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const business = await prisma.business.findUnique({
      where: { id: String(business_id) }
    });
    const isKitchenActive = business?.is_kitchen_active ?? true;
    
    // 1. Orders
    const allOrdersToday = await prisma.order.findMany({
      where: {
        business_id: String(business_id),
        created_at: { gte: todayStart }
      },
      include: { table: true, items: { include: { product: true } } }
    });

    const pending = allOrdersToday.filter(o => o.status === 'PENDING');
    const inProgress = allOrdersToday.filter(o => o.status === 'PREPARING');
    const ready = allOrdersToday.filter(o => o.status === 'READY');
    const activeOrders = pending.length + inProgress.length + ready.length;

    // 2. Tables
    const allTables = await prisma.restaurantTable.findMany({
      where: { business_id: String(business_id) }
    });
    const occupiedTables = allTables.filter(t => t.status === 'Occupied' || t.status === 'OCCUPIED').length;

    // 3. Staff
    const employees = await prisma.employee.findMany({
      where: { business_id: String(business_id), status: 'ACTIVE' }
    });

    // Operational Summary
    const operationalSummary = {
      todayOrders: allOrdersToday.length,
      pending: pending.length,
      inProgress: inProgress.length,
      ready: ready.length,
      occupiedTables,
      totalTables: allTables.length,
      activeStaff: employees.length
    };

    // Orders Needing Attention (e.g. > 15 mins wait)
    const now = new Date();
    const ordersAttention = [...pending, ...inProgress]
      .filter(o => (now.getTime() - new Date(o.created_at).getTime()) > 15 * 60000)
      .map(o => ({
        id: o.id,
        table: o.table?.table_number || 'N/A',
        waitingMinutes: Math.floor((now.getTime() - new Date(o.created_at).getTime()) / 60000),
        status: o.status
      }))
      .slice(0, 5);

    // Kitchen Status
    const oldestOrders = [...pending, ...inProgress]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 3)
      .map(o => ({
        id: o.id,
        table: o.table?.table_number || 'N/A',
        waitingMinutes: Math.floor((now.getTime() - new Date(o.created_at).getTime()) / 60000),
        status: o.status
      }));
    const kitchenStatus = {
      pending: pending.length,
      inProgress: inProgress.length,
      ready: ready.length,
      oldestOrders
    };

    // Table Status
    const available = allTables.filter(t => !t.status || t.status === 'Available' || t.status === 'AVAILABLE').length;
    const reserved = allTables.filter(t => t.status === 'Reserved' || t.status === 'RESERVED').length;
    const needsCleaning = allTables.filter(t => t.status === 'Cleaning' || t.status === 'CLEANING').length;
    const tableStatus = {
      available,
      occupied: occupiedTables,
      reserved,
      needsCleaning,
      tables: allTables.map(t => ({ number: t.table_number, status: t.status || 'Available' }))
    };

    // Inventory Alerts
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { business_id: String(business_id) }
    });
    const lowStock = inventoryItems.filter(i => Number(i.quantity) <= Number(i.minimum_quantity) && Number(i.quantity) > 0);
    const outOfStock = inventoryItems.filter(i => Number(i.quantity) <= 0);
    const inventoryAlerts = {
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      topItems: [...outOfStock, ...lowStock].slice(0, 5).map(i => ({
        name: i.name,
        current: Number(i.quantity),
        minimum: Number(i.minimum_quantity),
        unit: i.unit
      }))
    };

    // Staff Activity
    const waitersActive = employees.filter(e => e.position?.toLowerCase().includes('waiter') || e.position?.toLowerCase().includes('server')).length;
    const kitchenActive = employees.filter(e => e.position?.toLowerCase().includes('chef') || e.position?.toLowerCase().includes('cook')).length;
    const cashiersActive = employees.filter(e => e.position?.toLowerCase().includes('cashier')).length;
    const staffActivity = {
      waitersActive,
      kitchenActive,
      cashiersActive,
      activeStaff: employees.slice(0, 5).map(e => ({ name: e.first_name, role: e.position, status: 'Active' }))
    };

    // Today's Activity
    const completedOrders = allOrdersToday.filter(o => o.status === 'PAID' || o.status === 'SERVED');
    const cancelledOrders = allOrdersToday.filter(o => o.status === 'CANCELLED');
    const salesToday = await prisma.sale.findMany({
      where: { business_id: String(business_id), created_at: { gte: todayStart } }
    });
    const expensesToday = await prisma.expense.findMany({
      where: { business_id: String(business_id), date: { gte: todayStart } }
    });
    
    const salesTotal = salesToday.reduce((sum, s) => sum + Number(s.total), 0);
    const expensesTotal = expensesToday.reduce((sum, e) => sum + Number(e.amount), 0);
    const averageOrder = salesToday.length > 0 ? salesTotal / salesToday.length : 0;
    
    // Generate hourly chart data for today
    const chartData: any[] = [];
    for (let i = 0; i < 24; i++) {
      chartData.push({ name: `${i}:00`, sales: 0, expenses: 0, orders: 0 });
    }
    
    salesToday.forEach(s => {
      const hour = new Date(s.created_at).getHours();
      chartData[hour].sales += Number(s.total);
    });
    expensesToday.forEach(e => {
      const hour = new Date(e.date).getHours();
      chartData[hour].expenses += Number(e.amount);
    });
    allOrdersToday.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      chartData[hour].orders += 1;
    });

    const currentHour = new Date().getHours();
    const activeChartData = chartData.slice(Math.max(0, currentHour - 8), currentHour + 2); // Show last 8 hours to next hour
    
    const productCounts: Record<string, number> = {};
    allOrdersToday.forEach(o => {
      o.items.forEach(item => {
        if (item.product?.name) {
          productCounts[item.product.name] = (productCounts[item.product.name] || 0) + Number(item.quantity);
        }
      });
    });
    const topProducts = Object.entries(productCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
      
    const todayActivity = {
      totalOrders: allOrdersToday.length,
      completed: completedOrders.length,
      cancelled: cancelledOrders.length,
      sales: salesTotal,
      expenses: expensesTotal,
      net: salesTotal - expensesTotal,
      averageOrder,
      chartData: activeChartData,
      topProducts
    };

    // Recent Activity
    const recentOrders = [...allOrdersToday].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    const recentActivity = recentOrders.map(o => ({
      time: o.created_at,
      action: `Order #${o.id.split('-')[0]} created`,
      user: 'System' // Or actual user if available
    }));

    res.json({
      success: true,
      data: {
        isKitchenActive,
        operationalSummary,
        ordersAttention,
        kitchenStatus,
        tableStatus,
        inventoryAlerts,
        staffActivity,
        todayActivity,
        recentActivity
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

