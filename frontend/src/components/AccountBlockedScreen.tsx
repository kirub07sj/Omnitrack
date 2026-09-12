import { ShieldOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { defaultAccessMessage } from '@/lib/account-access';
import logo from '@/assets/logo.png';

export default function AccountBlockedScreen() {
  const navigate = useNavigate();
  const { accountAccess, logout } = useAppStore();
  const isExpired = accountAccess.code === 'ACCOUNT_EXPIRED';

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#052619] px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B4A34] via-[#052619] to-[#02130C]" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#0FA369] blur-[150px] rounded-full opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-5">
          <img src={logo} alt="Omnitrack" className="w-full h-full object-contain" />
        </div>

        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <ShieldOff className="w-7 h-7 text-emerald-800" />
        </div>

        <h1 className="text-xl font-bold text-emerald-950">
          {isExpired ? 'License expired' : 'Account deactivated'}
        </h1>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          {accountAccess.message || defaultAccessMessage(accountAccess.code)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          You can sign out now. Once access is restored, sign in again to continue.
        </p>

        <Button
          onClick={handleSignOut}
          className="mt-6 w-full bg-emerald-800 hover:bg-emerald-900 text-white gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
