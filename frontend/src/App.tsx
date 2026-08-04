import { useEffect, useState } from 'react'

export default function App() {
  const [serverMessage, setServerMessage] = useState<string>('Connecting to backend...')
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setServerMessage(data.message)
        setStatus('connected')
      } catch (error) {
        setServerMessage('Failed to connect to backend server.')
        setStatus('error')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-8 p-8 border border-border rounded-xl bg-card shadow-lg text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Omnitrack Setup</h1>
          <p className="text-muted-foreground">Frontend and Backend Connection Status</p>
        </div>

        <div className="py-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 text-blue-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
              <p className="font-medium">{serverMessage}</p>
            </div>
          )}
          
          {status === 'connected' && (
            <div className="flex flex-col items-center gap-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <p className="font-medium text-lg">{serverMessage}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p className="font-medium text-lg">{serverMessage}</p>
              <p className="text-sm text-muted-foreground">Make sure the backend server is running on port 5000.</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Refresh Connection
        </button>
      </div>
    </div>
  )
}
