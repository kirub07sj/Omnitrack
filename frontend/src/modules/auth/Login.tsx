import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A0A] text-white overflow-hidden font-sans">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.9); }
        }
        .animate-orb-1 {
          animation: float-slow 15s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: float-slow-reverse 18s ease-in-out infinite;
        }
      `}</style>
      
      {/* Left Panel - Emerald Brand Area */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative p-14 overflow-hidden">
        {/* Deep Emerald Background with Glows */}
        <div className="absolute inset-0 z-0 bg-[#063322]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B4A34] via-[#052619] to-[#02130C] opacity-90" />
        <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-[#0FA369] blur-[150px] rounded-full opacity-25 pointer-events-none animate-orb-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-[#086343] blur-[120px] rounded-full opacity-35 pointer-events-none animate-orb-2" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center bg-none">
               <img src="./logo.png" alt="Logo" className="w-full h-full object-contain scale-150" />
             </div>
             <span className="text-lg font-semibold tracking-tight text-white">Omnitrack</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[3.5rem] font-medium leading-[1.1] tracking-tight mb-5 text-white">
              Manage your<br/>hotel seamlessly.
            </h1>
            <p className="text-[#84C3A6] text-base leading-relaxed max-w-sm mb-12">
              The all-in-one, offline-first management system designed exclusively for modern hospitality and seamless service.
            </p>
          </div>

          {/* The 3 Cards matching the reference image */}
          <div className="flex gap-4 pb-6 w-full max-w-xl">
             {/* Card 1 */}
             <div className="flex-1 bg-white rounded-2xl p-5 shadow-2xl flex flex-col justify-between aspect-square max-h-[140px]">
               <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold mb-3">1</div>
               <h3 className="text-black font-medium text-sm leading-snug">Process<br/>reservations</h3>
             </div>
             
             {/* Card 2 */}
             <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex flex-col justify-between aspect-square max-h-[140px]">
               <div className="w-7 h-7 rounded-full bg-white/10 text-white/90 flex items-center justify-center text-xs font-semibold mb-3">2</div>
               <h3 className="text-white font-medium text-sm leading-snug text-white/90">Track your<br/>inventory</h3>
             </div>
             
             {/* Card 3 */}
             <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex flex-col justify-between aspect-square max-h-[140px]">
               <div className="w-7 h-7 rounded-full bg-white/10 text-white/90 flex items-center justify-center text-xs font-semibold mb-3">3</div>
               <h3 className="text-white font-medium text-sm leading-snug text-white/90">Offline-first<br/>syncing</h3>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white relative px-6 sm:px-12 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-20">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Log In Account</h2>
            <p className="text-gray-500 text-sm">Enter your personal data to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700 pl-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="eg. johnfrans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-700 pl-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5 mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06402B] text-white font-semibold rounded-xl py-3.5 text-[15px] hover:bg-[#042F1F] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex items-center justify-center shadow-md shadow-[#06402B]/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
