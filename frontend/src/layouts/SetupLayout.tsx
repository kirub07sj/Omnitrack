import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import ActivationPage from '@/modules/license/ActivationPage';

export default function SetupLayout() {
  const { isLicensed } = useAppStore();

  if (!isLicensed) {
    return <ActivationPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden flex items-center justify-center">
      {/* Mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 80%, hsla(153, 60%, 25%, 0.15), transparent),
            radial-gradient(ellipse 60% 60% at 80% 20%, hsla(170, 50%, 20%, 0.12), transparent),
            radial-gradient(ellipse 50% 80% at 50% 50%, hsla(140, 40%, 15%, 0.08), transparent)
          `
        }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 omni-bg-grid opacity-60" style={{
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%)'
      }} />
      
      {/* Animated floating orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xl mx-auto p-4 omni-page-enter">
        <Outlet />
      </div>
    </div>
  );
}
