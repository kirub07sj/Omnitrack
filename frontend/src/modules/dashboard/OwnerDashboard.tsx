import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  Plus, 
  FileText, 
  Users, 
  ShieldAlert, 
  RefreshCw, 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Line, LineChart, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';


const dailyRevenueData = [
  { day: "Mon", revenue: 1200 },
  { day: "Tue", revenue: 1400 },
  { day: "Wed", revenue: 1100 },
  { day: "Thu", revenue: 1800 },
  { day: "Fri", revenue: 2400 },
  { day: "Sat", revenue: 3200 },
  { day: "Sun", revenue: 2900 },
];

const monthlyFinanceData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 48000, expenses: 34000 },
  { month: "Mar", revenue: 52000, expenses: 35000 },
  { month: "Apr", revenue: 50000, expenses: 34500 },
  { month: "May", revenue: 58000, expenses: 38000 },
  { month: "Jun", revenue: 61000, expenses: 39000 },
];

const categorySalesData = [
  { name: "Main Course", value: 45 },
  { name: "Beverages", value: 25 },
  { name: "Appetizers", value: 15 },
  { name: "Desserts", value: 15 },
];
const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6'];

export default function OwnerDashboard() {
  const { currentUser } = useAppStore();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`/api/sales/history?business_id=${currentUser?.business_id}`);
        const data = await res.json();
        if (data.success) {
          setSales(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard sales:", e);
      }
    };
    if (currentUser?.business_id) fetchSales();
  }, [currentUser?.business_id]);

  // Compute live metrics
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySales = sales.filter(s => format(new Date(s.created_at), 'yyyy-MM-dd') === today);
  const totalAmountToday = todaySales.reduce((sum, s) => sum + parseFloat(s.total), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthSales = sales.filter(s => {
    const d = new Date(s.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalAmountMonth = monthSales.reduce((sum, s) => sum + parseFloat(s.total), 0);

  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Omnitrack Dashboard</h1>
            <p className="text-muted-foreground mt-1">Enterprise Overview & Business Intelligence</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"><Plus className="w-4 h-4 mr-2" /> New Product</Button>
            <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"><Plus className="w-4 h-4 mr-2" /> New Purchase</Button>
            <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>
            <Button variant="outline" className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"><Users className="w-4 h-4 mr-2" /> Add Employee</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"><FileText className="w-4 h-4 mr-2" /> View Reports</Button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 omni-stagger-2">
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 omni-notification">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-200">License Expiration</p>
              <p className="text-xs text-red-400">Enterprise License expires in 12 days.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-900/50 hover:bg-red-900/50">Renew</Button>
          </div>
          <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-900/50 rounded-xl p-4 omni-notification">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">Low Inventory</p>
              <p className="text-xs text-amber-400">8 items fall below par levels.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-900/50 hover:bg-amber-900/50">Restock</Button>
          </div>
          <div className="flex items-center gap-3 bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 omni-notification">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200">Pending Sync</p>
              <p className="text-xs text-blue-400">Offline data awaiting cloud sync.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-900/50 hover:bg-blue-900/50">Sync Now</Button>
          </div>
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 omni-notification">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-200">Failed Backups</p>
              <p className="text-xs text-red-400">Last database backup failed.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-900/50 hover:bg-red-900/50">Retry</Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 omni-stagger-3">
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Today's Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalAmountToday.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ETB</span>
              </div>
              <p className="text-xs text-emerald-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> Live today</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalAmountMonth.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ETB</span>
              </div>
              <p className="text-xs text-emerald-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> This month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Monthly Expenses</CardTitle>
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$39,000.00</div>
              <p className="text-xs text-red-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +2.6% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Net Profit</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">$22,000.00</div>
              <p className="text-xs text-emerald-500 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1" /> +10.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Today's Transactions</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{todaySales.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed orders today</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Inventory Value</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$14,850.00</div>
              <p className="text-xs text-muted-foreground mt-1">Based on current stock levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 omni-stagger-4">
          <Card className="bg-card border-border omni-chart-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">Monthly Revenue vs Expenses (6 Mos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      cursor={{fill: 'hsl(153, 40%, 12%)', opacity: 0.6}}
                      contentStyle={{ backgroundColor: 'hsl(153, 50%, 6%)', border: '1px solid hsl(153, 40%, 15%)', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(153, 60%, 45%)" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="expenses" fill="hsl(0, 60%, 50%)" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border omni-chart-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">Daily Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(153, 50%, 6%)', border: '1px solid hsl(153, 40%, 15%)', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(153, 60%, 50%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(153, 60%, 50%)", strokeWidth: 2, stroke: "hsl(153, 50%, 4%)" }} activeDot={{ r: 6 }} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dense Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 omni-stagger-5">
          <Card className="bg-card border-border lg:col-span-2 flex flex-col omni-card-hover">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-card-foreground">Recent Sales Activity</CardTitle>
                <Button variant="link" className="text-primary h-auto p-0">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Order ID</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Items</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({length: 6}).map((_, i) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-muted-foreground">#ORD-{2930 + i}</TableCell>
                      <TableCell className="text-muted-foreground">12:{45 + i} PM</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">2x Burger, 1x Coke, 1x Fries...</TableCell>
                      <TableCell className="text-muted-foreground">${(Math.random() * 80 + 15).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={i % 3 === 0 ? "text-amber-500 border-amber-900 bg-amber-950/30" : "text-emerald-500 border-emerald-900 bg-emerald-950/30"}>
                          {i % 3 === 0 ? "Preparing" : "Completed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border flex flex-col omni-card-hover">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-card-foreground">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[280px]">
                <div className="p-4 space-y-4">
                  {[
                    { item: "Premium Beef Patties", current: 12, par: 50, unit: "boxes" },
                    { item: "Brioche Buns", current: 24, par: 100, unit: "packs" },
                    { item: "Truffle Oil", current: 1, par: 5, unit: "bottles" },
                    { item: "Cheddar Cheese", current: 5, par: 20, unit: "blocks" },
                    { item: "Frying Oil", current: 2, par: 10, unit: "drums" },
                  ].map((stock, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-card-foreground">{stock.item}</p>
                        <p className="text-xs text-muted-foreground">Par: {stock.par} {stock.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-red-500">{stock.current}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Lower Widgets Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 omni-stagger-6">
          <Card className="bg-card border-border omni-chart-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-card-foreground">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categorySalesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(153, 50%, 6%)', border: '1px solid hsl(153, 40%, 15%)', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">4</span>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {categorySalesData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                    {cat.name} ({cat.value}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-card-hover">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-card-foreground">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {[
                    { desc: "Produce Supplier Inc.", cat: "Food Cost", amt: "$1,250.00" },
                    { desc: "City Utilities", cat: "Utilities", amt: "$450.00" },
                    { desc: "Beverage Distributors", cat: "Beverage Cost", amt: "$890.00" },
                    { desc: "Equipment Repair", cat: "Maintenance", amt: "$320.00" },
                  ].map((exp, i) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-muted-foreground py-3">{exp.desc}</TableCell>
                      <TableCell className="text-muted-foreground py-3">{exp.cat}</TableCell>
                      <TableCell className="text-right text-red-400 py-3">{exp.amt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-3 text-center border-t border-border">
                <Button variant="link" className="text-primary text-xs h-auto p-0">View All Expenses</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-card-hover">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-card-foreground">Pending Supplier Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { po: "PO-8902", supplier: "Fresh Farms", items: 24, status: "Pending Delivery", date: "Today" },
                  { po: "PO-8903", supplier: "Global Meats", items: 12, status: "Awaiting Approval", date: "Tomorrow" },
                  { po: "PO-8904", supplier: "Ocean Catch", items: 8, status: "Draft", date: "-" },
                ].map((po, i) => (
                  <div key={i} className="p-4 flex items-start justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-card-foreground">{po.supplier}</span>
                        <span className="text-xs text-muted-foreground">({po.po})</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{po.items} items ordered</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline" className="text-xs bg-muted border-border text-muted-foreground font-normal">
                        {po.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">{po.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
