import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const res = await fetch('/api/business/status');
        const data = await res.json();
        
        if (data.success && data.isSetup) {
          // Business profile exists
          setLoading(false);
        } else {
          // Go to setup wizard
          navigate('/setup');
        }
      } catch (err) {
        console.error("Failed to connect to backend", err);
        setError(true);
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, [navigate]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Omnitrack Dashboard</h1>
      <p className="text-gray-400 max-w-md text-center">
        Your business is successfully set up! We will build the Auth and Dashboard modules here next.
      </p>
    </div>
  );
}
