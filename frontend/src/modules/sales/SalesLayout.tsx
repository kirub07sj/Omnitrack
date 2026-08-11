import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';

export default function SalesLayout() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/${currentUser?.role?.toLowerCase() || 'owner'}/sales`;

  const isManual = location.pathname.includes('/manual');
  
  // Determine current tab
  let currentTab = 'queue';
  if (location.pathname.includes('/history')) currentTab = 'history';

  const handleTabChange = (value: string) => {
    if (value === 'queue') navigate(basePath);
    else if (value === 'history') navigate(`${basePath}/history`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales & Payments</h2>
      </div>
      
      {!isManual && (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="queue">Payment Queue</TabsTrigger>
            <TabsTrigger value="history">Sales History</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
