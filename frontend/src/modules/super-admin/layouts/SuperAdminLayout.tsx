import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Key, 
  CreditCard, 
  MonitorSmartphone, 
  RefreshCcw, 
  LifeBuoy, 
  BarChart3, 
  ScrollText, 
  Settings,
  LogOut,
  ShieldCheck,
  User,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

const SUPER_ADMIN_NAV = [
  { name: 'Dashboard', path: '/super-admin', exact: true, icon: LayoutDashboard },
  { name: 'Businesses', path: '/super-admin/businesses', icon: Building2 },
  { name: 'Users', path: '/super-admin/users', icon: Users },
  { name: 'Licenses & Plans', path: '/super-admin/licenses', icon: Key },
  { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
  { name: 'Devices', path: '/super-admin/devices', icon: MonitorSmartphone },
  { name: 'Synchronization', path: '/super-admin/sync', icon: RefreshCcw },
  { name: 'Support', path: '/super-admin/support', icon: LifeBuoy },
  { name: 'Reports', path: '/super-admin/reports', icon: BarChart3 },
  { name: 'Audit Logs', path: '/super-admin/audit-logs', icon: ScrollText },
  { name: 'System Settings', path: '/super-admin/settings', icon: Settings },
];

function SuperAdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { currentUser, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="p-4 border-b border-emerald-500/20 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src={logo} alt="Logo" className="w-full h-full object-contain scale-150" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-lg font-bold tracking-tight text-white truncate">Omnitrack</h1>
          <p className="text-[10px] font-medium text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" /> Super Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {SUPER_ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-emerald-800/80 text-white shadow-sm' 
                  : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-300'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-800/50 space-y-1 mt-auto">
        <div className="px-3 py-2 flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-sm font-medium text-white truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
            <p className="text-xs text-emerald-200/70 truncate">{currentUser?.email || currentUser?.username}</p>
          </div>
        </div>
        
        <Link
          to="/super-admin/settings"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-emerald-800/40 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-300" />
          Account Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-emerald-800/40 hover:text-white transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-gray-300" />
          Logout
        </button>
      </div>
    </>
  );
}

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.is_super_admin) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser?.is_super_admin) return null;

  const sidebarClass = "w-64 border-r-0 bg-gradient-to-b from-emerald-900 via-emerald-950 to-gray-950 flex flex-col h-full text-emerald-50";

  return (
    <div className="min-h-screen bg-gray-50/50 flex min-w-0">
      <aside className={`${sidebarClass} hidden md:flex h-screen sticky top-0 z-20`}>
        <SuperAdminNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[280px] border-0 bg-gradient-to-b from-emerald-900 via-emerald-950 to-gray-950 text-emerald-50 [&>button]:text-white [&>button]:opacity-80"
        >
          <div className="flex flex-col h-full">
            <SuperAdminNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden flex items-center gap-3 h-14 px-3 border-b bg-white/90 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
            <span className="font-semibold text-gray-900 truncate">Super Admin</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-7xl mx-auto min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
