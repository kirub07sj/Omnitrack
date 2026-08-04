import { Outlet } from 'react-router-dom';

export default function SetupLayout() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xl mx-auto p-4">
        <Outlet />
      </div>
    </div>
  );
}
