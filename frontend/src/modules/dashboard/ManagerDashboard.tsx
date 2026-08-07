import { 
  Users, 
  ShoppingCart, 
  AlertCircle, 
  Clock, 
  Plus, 
  ChefHat, 
  Coffee,
  Activity,
  Package,
  DollarSign,
  Timer
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

const hourlyOrdersData = [
  { hour: "10 AM", orders: 12 },
  { hour: "11 AM", orders: 25 },
  { hour: "12 PM", orders: 48 },
  { hour: "1 PM", orders: 56 },
  { hour: "2 PM", orders: 30 },
  { hour: "3 PM", orders: 15 },
  { hour: "4 PM", orders: 22 },
];

const productSalesData = [
  { name: "Burgers", value: 45 },
  { name: "Pizzas", value: 30 },
  { name: "Salads", value: 15 },
  { name: "Drinks", value: 10 },
];
const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6'];

export default function ManagerDashboard() {
  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Operations Dashboard</h1>
            <p className="text-muted-foreground mt-1">Daily Operations & Shift Management</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground"><Plus className="w-4 h-4 mr-2" /> New Order</Button>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground"><Coffee className="w-4 h-4 mr-2" /> Assign Table</Button>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground"><Package className="w-4 h-4 mr-2" /> Receive Inventory</Button>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground"><DollarSign className="w-4 h-4 mr-2" /> Add Expense</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Users className="w-4 h-4 mr-2" /> Manage Employees</Button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 omni-stagger-2">
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 omni-notification">
            <Timer className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-200">Delayed Orders</p>
              <p className="text-xs text-red-400">3 orders exceeding 30m prep time.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-900/50 hover:bg-red-900/50 text-red-200">View</Button>
          </div>
          <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-900/50 rounded-xl p-4 omni-notification">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">Low Stock</p>
              <p className="text-xs text-amber-400">Tomatoes & Buns below par.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-900/50 hover:bg-amber-900/50 text-amber-200">Restock</Button>
          </div>
          <div className="flex items-center gap-3 bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 omni-notification">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200">New Orders</p>
              <p className="text-xs text-blue-400">5 pending web orders to accept.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-900/50 hover:bg-blue-900/50 text-blue-200">Review</Button>
          </div>
          <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-900/50 rounded-xl p-4 omni-notification">
            <Users className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">Staff Alerts</p>
              <p className="text-xs text-amber-400">1 server late for shift.</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-900/50 hover:bg-amber-900/50 text-amber-200">Details</Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 omni-stagger-3">
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Orders</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18</div>
              <p className="text-xs text-muted-foreground mt-1">4 delivery, 14 dine-in</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Occupied Tables</CardTitle>
              <Coffee className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">14 / 30</div>
              <p className="text-xs text-emerald-500 flex items-center mt-1">46% occupancy rate</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Today's Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$1,842.50</div>
              <p className="text-xs text-muted-foreground mt-1">From 86 transactions</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">6</div>
              <p className="text-xs text-muted-foreground mt-1">Require urgent attention</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Employees on Shift</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground mt-1">3 FOH, 7 BOH, 2 Managers</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Kitchen Queue</CardTitle>
              <ChefHat className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24</div>
              <p className="text-xs text-red-400 mt-1">Items currently prepping</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 omni-stagger-4">
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Orders by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(153, 40%, 12%)', opacity: 0.6}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Table Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }}
                    />
                    <Line type="monotone" dataKey="orders" stroke="hsl(153, 60%, 50%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(153, 60%, 50%)", strokeWidth: 2, stroke: "hsl(153, 50%, 4%)" }} activeDot={{ r: 6 }} name="Guests Seated" />
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
                <CardTitle className="text-base text-foreground">Live Order Queue</CardTitle>
                <Button variant="link" className="text-primary h-auto p-0">View All Orders</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Order</TableHead>
                    <TableHead className="text-muted-foreground">Table/Type</TableHead>
                    <TableHead className="text-muted-foreground">Time Elapsed</TableHead>
                    <TableHead className="text-muted-foreground">Items</TableHead>
                    <TableHead className="text-muted-foreground text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: "482", table: "T-14", time: "22m", items: "2x Burger, 1x Coke", status: "Delayed" },
                    { id: "483", table: "T-02", time: "15m", items: "1x Steak, 2x Wine", status: "Cooking" },
                    { id: "484", table: "Delivery", time: "8m", items: "4x Pizza, 1x Salad", status: "Prep" },
                    { id: "485", table: "T-08", time: "3m", items: "2x Coffee", status: "New" },
                    { id: "486", table: "Takeaway", time: "1m", items: "1x Wrap", status: "New" },
                  ].map((ord, i) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground">#{ord.id}</TableCell>
                      <TableCell className="text-muted-foreground">{ord.table}</TableCell>
                      <TableCell className={`text-muted-foreground font-medium ${ord.status === 'Delayed' ? 'text-red-400' : ''}`}>{ord.time}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">{ord.items}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={
                          ord.status === "Delayed" ? "text-red-500 border-red-900 bg-red-950/30" : 
                          ord.status === "Cooking" ? "text-amber-500 border-amber-900 bg-amber-950/30" : 
                          "text-blue-500 border-blue-900 bg-blue-950/30"
                        }>
                          {ord.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-foreground">Employee Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[280px]">
                <div className="p-4 space-y-4">
                  {[
                    { name: "Sarah J.", role: "Server", status: "Clocked In", time: "09:00 AM" },
                    { name: "Mike T.", role: "Chef", status: "Clocked In", time: "08:30 AM" },
                    { name: "David L.", role: "Server", status: "Late", time: "Scheduled 10:00 AM" },
                    { name: "Emma W.", role: "Bartender", status: "Clocked In", time: "10:15 AM" },
                    { name: "Tom B.", role: "Dishwasher", status: "Clocked Out", time: "04:00 PM" },
                  ].map((emp, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-card-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.role}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`text-xs font-bold ${emp.status === 'Late' ? 'text-red-500' : emp.status === 'Clocked In' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                          {emp.status}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{emp.time}</p>
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
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-foreground">Product Sales Today</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productSalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {productSalesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(153, 20%, 98%)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">105</span>
                    <p className="text-xs text-muted-foreground">Items Sold</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {productSalesData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                    {cat.name} ({cat.value}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-foreground">Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {[
                    { desc: "Fresh Tomatoes", cat: "Produce", qty: "2 kg (Par: 10)" },
                    { desc: "Burger Buns", cat: "Bakery", qty: "15 pk (Par: 50)" },
                    { desc: "Napkins", cat: "Supplies", qty: "1 box (Par: 5)" },
                    { desc: "Draft Beer", cat: "Beverage", qty: "0.5 keg (Par: 2)" },
                  ].map((exp, i) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground py-3">{exp.desc}</TableCell>
                      <TableCell className="text-muted-foreground py-3 text-xs">{exp.cat}</TableCell>
                      <TableCell className="text-right text-amber-500 text-xs font-medium py-3">{exp.qty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-3 text-center border-t border-border">
                <Button variant="link" className="text-primary text-xs h-auto p-0">View All Inventory</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base text-foreground">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { user: "System", action: "EOD Report Generated", time: "10 mins ago" },
                  { user: "Sarah J.", action: "Voided Order #480", time: "25 mins ago" },
                  { user: "Mike T.", action: "Updated Kitchen Stock", time: "1 hour ago" },
                  { user: "Manager", action: "Approved Schedule", time: "2 hours ago" },
                ].map((act, i) => (
                  <div key={i} className="p-4 flex items-start justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">{act.action}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">By {act.user}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-muted-foreground">{act.time}</p>
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
