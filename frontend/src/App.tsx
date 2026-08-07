import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Login from './modules/auth/Login';

export default function App() {
  const navigate = useNavigate();
  const { isSetupComplete, isLoadingStatus, checkSetupStatus, currentUser } = useAppStore();
  const [error, setError] = useState(false);

  useEffect(() => {
    checkSetupStatus().catch(() => setError(true));
  }, [checkSetupStatus]);

  useEffect(() => {
    if (!isLoadingStatus && !error) {
      if (!isSetupComplete) {
        navigate('/setup');
      } else if (currentUser) {
        navigate(`/${currentUser.role.toLowerCase()}`);
      }
    }
  }, [isSetupComplete, isLoadingStatus, error, navigate, currentUser]);

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        
        {/* Spinner */}
        <div className="relative z-10">
          <div className="w-14 h-14 border-4 border-primary/20 rounded-full" />
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse relative z-10">Initializing Omnitrack...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 omni-bg-dots opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center omni-animate-in">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">Failed to connect to the Omnitrack backend service. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return null; // The useEffect will handle the redirect if currentUser exists
}
