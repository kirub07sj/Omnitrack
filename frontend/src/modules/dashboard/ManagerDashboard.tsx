import { 
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Package,
  ShoppingCart,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

export default function ManagerDashboard() {
  const EMERALD_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857', '#a7f3d0'];
  const { currentUser } = useAppStore();
  const { currency } = useSettings();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard/manager?business_id=${currentUser?.business_id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch manager dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.business_id) {
      fetchData();
    }
  }, [currentUser?.business_id]);

  if (loading && !data) {
    return <div className="p-8 text-center text-muted-foreground flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive flex h-full items-center justify-center">Failed to load dashboard data.</div>;
  }

  const {
    isKitchenActive = true,
    operationalSummary,
    ordersAttention,
    kitchenStatus,
    tableStatus,
    inventoryAlerts,
    staffActivity,
    todayActivity,
    recentActivity
  } = data;

  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* 1. Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground capitalize">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {currentUser?.username || 'Manager'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="bg-muted border-border" onClick={() => navigate('/manager/orders')}><ShoppingCart className="w-4 h-4 mr-2" /> Orders</Button>
            {isKitchenActive && (
              <Button variant="outline" className="bg-muted border-border" onClick={() => navigate('/manager/kitchen')}><ChefHat className="w-4 h-4 mr-2" /> Kitchen</Button>
            )}
            <Button variant="outline" className="bg-muted border-border" onClick={() => navigate('/manager/tables')}><Coffee className="w-4 h-4 mr-2" /> Tables</Button>
            <Button variant="outline" className="bg-muted border-border" onClick={() => navigate('/manager/inventory')}><Package className="w-4 h-4 mr-2" /> Inventory</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/manager/employees')}><Users className="w-4 h-4 mr-2" /> Employees</Button>
          </div>
        </div>

        {/* 2. Operational Summary */}
        {isKitchenActive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 omni-stagger-2">
            <Card className="bg-card border-border omni-kpi-card">
              <CardHeader className="pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{operationalSummary.pending}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border omni-kpi-card">
              <CardHeader className="pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{operationalSummary.inProgress}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border omni-kpi-card">
              <CardHeader className="pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">{operationalSummary.ready}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 omni-stagger-3 mb-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-800 text-white border-0 shadow-sm omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-50">Total Sales</CardTitle>
              <TrendingUp className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {todayActivity.sales?.toLocaleString() || 0} <span className="text-sm font-normal text-emerald-100">{currency}</span>
              </div>
              <p className="text-xs text-emerald-100 mt-2 opacity-80 capitalize">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {todayActivity.expenses?.toLocaleString() || 0} <span className="text-sm font-normal text-muted-foreground">{currency}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Expenses & Purchases</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 omni-kpi-card text-emerald-950 dark:text-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Net Cash Flow</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${todayActivity.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {todayActivity.net > 0 ? '+' : ''}{todayActivity.net?.toLocaleString() || 0} <span className="text-sm font-normal opacity-70">{currency}</span>
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-2">Operating margin</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 omni-stagger-4 mb-6">
          
          {/* 3. Sales & Expenses Chart */}
          <Card className={`bg-card border-border omni-chart-card flex flex-col ${isKitchenActive ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <CardHeader className="border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Sales & Expenses (Today)
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs p-0 px-2" onClick={() => navigate('/manager/reports')}>View Reports</Button>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayActivity.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value > 0 ? value / 1000 + 'k' : value}`} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.1)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    />
                    <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-card border-border lg:col-span-1 flex flex-col">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-semibold">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-4">
              {todayActivity.topProducts?.length > 0 ? (
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={todayActivity.topProducts}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {todayActivity.topProducts.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={EMERALD_COLORS[index % EMERALD_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                        formatter={(value: number, name: string) => [`${value} units`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center w-full h-[200px] flex items-center justify-center">No product data available</div>
              )}
            </CardContent>
          </Card>

          {/* 4. Kitchen Status */}
          {isKitchenActive && (
            <Card className="bg-card border-border flex flex-col lg:col-span-1">
              <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-blue-500" /> Kitchen
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/manager/kitchen')}>Open Kitchen</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-muted/50 p-2 rounded-md">
                  <div className="font-bold text-lg text-amber-500">{kitchenStatus.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="bg-muted/50 p-2 rounded-md">
                  <div className="font-bold text-lg text-blue-500">{kitchenStatus.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="bg-muted/50 p-2 rounded-md">
                  <div className="font-bold text-lg text-emerald-500">{kitchenStatus.ready}</div>
                  <div className="text-xs text-muted-foreground">Ready</div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">Oldest Active Orders</p>
                <div className="space-y-3">
                  {kitchenStatus.oldestOrders.length > 0 ? kitchenStatus.oldestOrders.map((order: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">#{order.id.split('-')[0]}</span> <span className="text-muted-foreground ml-1">T{order.table}</span>
                      </div>
                      <div className="text-amber-500 font-medium">{order.waitingMinutes} min</div>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground">No active kitchen orders.</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 omni-stagger-4">
          
          {/* 5. Table Status */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-emerald-500" /> Tables
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs p-0 px-2" onClick={() => navigate('/manager/tables')}>Manage</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-bold text-emerald-500">{tableStatus.available}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-bold text-foreground">{tableStatus.occupied}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserved</span>
                  <span className="font-bold text-blue-500">{tableStatus.reserved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Needs Cleaning</span>
                  <span className="font-bold text-amber-500">{tableStatus.needsCleaning}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Inventory Alerts */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" /> Inventory Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs p-0 px-2" onClick={() => navigate('/manager/inventory')}>View Inventory</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-4 min-w-[120px]">
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
                  <div className="text-xs font-semibold text-red-500 uppercase">Out of Stock</div>
                  <div className="text-2xl font-bold text-red-500 mt-1">{inventoryAlerts.outOfStockCount}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center">
                  <div className="text-xs font-semibold text-amber-500 uppercase">Low Stock</div>
                  <div className="text-2xl font-bold text-amber-500 mt-1">{inventoryAlerts.lowStockCount}</div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                {inventoryAlerts.topItems.length > 0 ? inventoryAlerts.topItems.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${item.current <= 0 ? 'text-red-500' : 'text-amber-500'}`}>{item.current} {item.unit}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Min: {item.minimum} {item.unit}</div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-sm text-emerald-500 font-medium">
                    Inventory levels look good.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 7. Staff Activity */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader className="border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> Staff Today
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs p-0 px-2" onClick={() => navigate('/manager/employees')}>Manage</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm text-center">
                <div className="bg-muted p-2 rounded">
                  <div className="font-bold">{staffActivity.waitersActive}</div>
                  <div className="text-xs text-muted-foreground">Waiters</div>
                </div>
                <div className="bg-muted p-2 rounded">
                  <div className="font-bold">{staffActivity.kitchenActive}</div>
                  <div className="text-xs text-muted-foreground">Kitchen</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {staffActivity.activeStaff.length > 0 ? staffActivity.activeStaff.map((staff: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{staff.name}</span>
                      <span className="text-xs text-muted-foreground block">{staff.role || 'Staff'}</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{staff.status}</Badge>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground text-center">No staff active.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 omni-stagger-5">
          {/* 8. Orders Needing Attention */}
          <Card className="bg-card border-border flex flex-col shadow-sm border-l-4 border-l-red-500/50">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Orders Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border">
                {ordersAttention.length > 0 ? ordersAttention.map((order: any, i: number) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">Order #{order.id.split('-')[0]} <span className="text-muted-foreground font-normal ml-2">Table {order.table}</span></div>
                      <div className="text-sm text-red-400 font-medium">Waiting: {order.waitingMinutes} minutes</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="uppercase bg-muted text-muted-foreground">{order.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => navigate('/manager/orders')}>View Order</Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-80" />
                    <p className="font-medium">All orders are running normally.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 9. Recent Operational Activity */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.length > 0 ? recentActivity.map((act: any, i: number) => (
                  <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-muted/30 transition-colors text-sm">
                    <div className="font-medium">{act.action}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(act.time), 'HH:mm')}</div>
                  </div>
                )) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </ScrollArea>
  );
}
