import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export default function SetupWizard() {
  const { currentSetupStep, checkSetupStatus, markBusinessCreated, markOwnerCreated } = useAppStore();
  
  const [businessData, setBusinessData] = useState({ name: '', email: '', phone: '', address: '' });
  const [ownerData, setOwnerData] = useState({ firstName: '', lastName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only check if it's the initial load to prevent unnecessary fetches
    checkSetupStatus();
  }, [checkSetupStatus]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/business/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      });
      const data = await res.json();
      
      if (data.success) {
        markBusinessCreated();
      } else {
        setError(data.message);
        if (data.message.includes('already been set up') || data.message.includes('already exists')) {
          setTimeout(() => markBusinessCreated(), 1500); // Auto skip after showing message briefly
        }
      }
    } catch (err) {
      setError('Connection failed to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/setup-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData)
      });
      const data = await res.json();
      
      if (data.success) {
        markOwnerCreated();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step 1 moved to ActivationPage */}

      {currentSetupStep === 2 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-purple-900/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Business Profile</CardTitle>
            <CardDescription className="text-gray-400">Let's set up your business details.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateBusiness}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Business Name</Label>
                <Input 
                  id="name" 
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                  placeholder="e.g. Grand Hotel & Restaurant" 
                  required
                  className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    placeholder="contact@business.com" 
                    className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    placeholder="+1 234 567 8900" 
                    className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">Address</Label>
                <Input 
                  id="address" 
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  placeholder="123 Main St, City" 
                  className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-purple-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-purple-700 text-foreground border-0" disabled={loading}>
                {loading ? 'Creating...' : 'Continue to Next Step'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 3 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-indigo-900/20 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Owner Account</CardTitle>
            <CardDescription className="text-gray-400">Create the primary administrator account for the system.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateOwner}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={ownerData.firstName}
                    onChange={(e) => setOwnerData({ ...ownerData, firstName: e.target.value })}
                    placeholder="John" 
                    required
                    className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={ownerData.lastName}
                    onChange={(e) => setOwnerData({ ...ownerData, lastName: e.target.value })}
                    placeholder="Doe" 
                    required
                    className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input 
                  id="username" 
                  value={ownerData.username}
                  onChange={(e) => setOwnerData({ ...ownerData, username: e.target.value })}
                  placeholder="admin" 
                  required
                  className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={ownerData.password}
                  onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                  placeholder="••••••••" 
                  required
                  className="bg-card/80 border-border text-foreground backdrop-blur-xl placeholder:text-gray-600 focus-visible:ring-indigo-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-foreground border-0" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Owner Account'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 4 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-green-900/20 animate-in zoom-in duration-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Setup Complete!</h2>
            <p className="text-gray-400">Your business profile and owner account have been created successfully.</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4 bg-primary text-primary-foreground hover:bg-gray-200 border-0">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
