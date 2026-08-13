import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar, BarChart3, LineChart, PieChart, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { OverviewReport } from '../components/OverviewReport';
import { SalesReport } from '../components/SalesReport';
import { ExpenseReport } from '../components/ExpenseReport';
import { TransactionsReport } from '../components/TransactionsReport';
import { InventoryReport } from '../components/InventoryReport';
import { useAppStore } from '@/store/useAppStore';

export default function ReportsPage() {
  const { currentUser } = useAppStore();
  const isCashier = currentUser?.role?.toLowerCase() === 'cashier';

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and historical data overview</p>
        </div>
        
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                disabled={isCashier}
                className={cn(
                  "h-8 justify-start text-left font-normal px-3 w-[150px]",
                  !dateRange.startDate && "text-muted-foreground",
                  isCashier && "opacity-50 cursor-not-allowed"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {dateRange.startDate ? format(new Date(dateRange.startDate), "PPP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
                onSelect={(d) => d && setDateRange(prev => ({ ...prev, startDate: format(d, 'yyyy-MM-dd') }))}
                
              />
            </PopoverContent>
          </Popover>
          <span className="text-sm text-muted-foreground px-2">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                disabled={isCashier}
                className={cn(
                  "h-8 justify-start text-left font-normal px-3 w-[150px]",
                  !dateRange.endDate && "text-muted-foreground",
                  isCashier && "opacity-50 cursor-not-allowed"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {dateRange.endDate ? format(new Date(dateRange.endDate), "PPP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
                onSelect={(d) => d && setDateRange(prev => ({ ...prev, endDate: format(d, 'yyyy-MM-dd') }))}
                
              />
            </PopoverContent>
          </Popover>
          <div className="border-l pl-1 ml-1">
            <Button variant="ghost" size="icon" onClick={() => setRefreshTrigger(prev => prev + 1)} title="Refresh Data" className="h-8 w-8">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={isCashier ? "sales" : "overview"} className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent border-b p-0 rounded-none space-x-1 mb-6">
          {!isCashier && <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3"><BarChart3 className="w-4 h-4 mr-2"/> Overview</TabsTrigger>}
          <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3"><TrendingUp className="w-4 h-4 mr-2"/> Sales</TabsTrigger>
          {!isCashier && <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3"><LineChart className="w-4 h-4 mr-2"/> Expenses</TabsTrigger>}
          <TabsTrigger value="transactions" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3"><PieChart className="w-4 h-4 mr-2"/> Cash Flow</TabsTrigger>
          {!isCashier && <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3"><Package className="w-4 h-4 mr-2"/> Inventory</TabsTrigger>}
        </TabsList>
        
        {!isCashier && (
          <TabsContent value="overview" className="animate-in fade-in-50 duration-300">
            <OverviewReport dateRange={dateRange} refreshTrigger={refreshTrigger} />
          </TabsContent>
        )}

        <TabsContent value="sales" className="animate-in fade-in-50 duration-300">
          <SalesReport dateRange={dateRange} refreshTrigger={refreshTrigger} />
        </TabsContent>

        {!isCashier && (
          <TabsContent value="expenses" className="animate-in fade-in-50 duration-300">
             <ExpenseReport dateRange={dateRange} refreshTrigger={refreshTrigger} />
          </TabsContent>
        )}

        <TabsContent value="transactions" className="animate-in fade-in-50 duration-300">
           <TransactionsReport dateRange={dateRange} refreshTrigger={refreshTrigger} />
        </TabsContent>

        {!isCashier && (
          <TabsContent value="inventory" className="animate-in fade-in-50 duration-300">
             <InventoryReport refreshTrigger={refreshTrigger} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
