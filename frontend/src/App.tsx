import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Login from './modules/auth/Login';

export default function App() {
  const navigate = useNavigate();
  const { isSetupComplete, isLoadingStatus, checkSetupStatus, currentUser, logout } = useAppStore();
  const [error, setError] = useState(false);

  useEffect(() => {
    checkSetupStatus().catch(() => setError(true));
  }, [checkSetupStatus]);

  useEffect(() => {
    if (!isLoadingStatus && !error) {
      if (!isSetupComplete) {
        navigate('/setup');
      }
    }
  }, [isSetupComplete, isLoadingStatus, error, navigate]);

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
        <p className="text-gray-400">Failed to connect to the Omnitrack backend service.</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-white text-black rounded hover:bg-gray-200">Retry</button>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-900/10 via-black to-purple-900/10 pointer-events-none" />

      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-white/10 bg-black/40 backdrop-blur-xl p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">O</div>
          <span className="text-xl font-semibold tracking-tight">Omnitrack</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <span className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="text-xs text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">{currentUser.role}</span>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="flex-1 p-8 z-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to your Workspace</h1>
        <p className="text-gray-400 max-w-md text-center mb-8">
          You are successfully authenticated. Depending on your role, we will load your specific interface modules here soon.
        </p>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-lg">Logged in as: <span className="font-bold text-blue-400">{currentUser.role}</span></p>
          <p className="text-sm text-gray-400 mt-2">If you were a Chef, you'd see the KDS.</p>
          <p className="text-sm text-gray-400">If you were a Cashier, you'd see the POS.</p>
        </div>
      </main>
    </div>
  );
}
