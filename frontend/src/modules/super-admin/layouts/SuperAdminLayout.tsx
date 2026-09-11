import { useEffect } from 'react';
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
  User
} from 'lucide-react';
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

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAppStore();

  useEffect(() => {
    if (!currentUser?.is_super_admin) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser?.is_super_admin) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r-0 bg-gradient-to-b from-emerald-600 to-emerald-950 flex flex-col h-screen sticky top-0 z-20 text-emerald-50">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-50/70'}`} />
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
              <p className="text-sm font-medium text-white truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-emerald-200/70 truncate">{currentUser.email || currentUser.username}</p>
            </div>
          </div>
          
          <Link
            to="/super-admin/settings"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-emerald-50/70 hover:bg-emerald-800/40 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-emerald-50/70" />
            Account Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-emerald-50/70 hover:bg-emerald-800/40 hover:text-white transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-emerald-50/70" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
