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

  return null; // The useEffect will handle the redirect if currentUser exists
}

