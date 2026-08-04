import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [licenseKey, setLicenseKey] = useState('');
  const [businessData, setBusinessData] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed to backend.');
    } finally {
      setLoading(false);
    }
  };

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
        setStep(3); // Success step
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
      {step === 1 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-blue-900/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Activate Omnitrack</CardTitle>
            <CardDescription className="text-gray-400">Enter your product license key to continue.</CardDescription>
          </CardHeader>
          <form onSubmit={handleActivate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseKey" className="text-gray-300">License Key</Label>
                <Input 
                  id="licenseKey" 
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX" 
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-xs text-gray-500 italic">Hint: Use OMNITRACK-VALID-KEY</p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0" disabled={loading}>
                {loading ? 'Activating...' : 'Activate License'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-purple-900/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Business Profile</CardTitle>
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    placeholder="+1 234 567 8900" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0" disabled={loading}>
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-green-900/20 animate-in zoom-in duration-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Setup Complete!</h2>
            <p className="text-gray-400">Your business profile has been created successfully.</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4 bg-white text-black hover:bg-gray-200 border-0">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
