import { Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import ActivationPage from '@/modules/license/ActivationPage';

export default function SetupLayout() {
  const { isLicensed, isSetupComplete } = useAppStore();

  if (!isLicensed) {
    return <ActivationPage />;
  }

  if (isSetupComplete) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 bg-[#0A0A0A] font-sans text-foreground selection:bg-emerald-500/30">
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

      {/* Deep Emerald Background with Glows */}
      <div className="absolute inset-0 z-0 bg-[#063322]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B4A34] via-[#052619] to-[#02130C] opacity-90" />
      <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-[#0FA369] blur-[150px] rounded-full opacity-25 pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-[#086343] blur-[120px] rounded-full opacity-35 pointer-events-none animate-orb-2" />

      {/* Brand Logo Top Left */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="./logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Omnitrack</span>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto p-4 omni-page-enter">
        <Outlet />
      </div>
    </div>
  );
}
