import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export default function SetupWizard() {
  const { currentSetupStep, setSetupStep, checkSetupStatus, markBusinessCreated, markOwnerCreated, markEmployeesDone, markProductsDone } = useAppStore();
  
  const [licenseKey, setLicenseKey] = useState('');
  const [businessData, setBusinessData] = useState({ name: '', email: '', phone: '', address: '' });
  const [ownerData, setOwnerData] = useState({ firstName: '', lastName: '', username: '', password: '' });
  const [employeeData, setEmployeeData] = useState({ firstName: '', lastName: '', roleName: 'Waiter', username: '', password: '' });
  const [productData, setProductData] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only check if it's the initial load to prevent unnecessary fetches
    checkSetupStatus();
  }, [checkSetupStatus]);

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
        setSetupStep(2);
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

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/business/setup-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      const data = await res.json();
      if (data.success) {
        markEmployeesDone();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/business/setup-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success) {
        markProductsDone();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {currentSetupStep === 1 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in-95 duration-300">
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

      {currentSetupStep === 2 && (
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
                {loading ? 'Creating...' : 'Continue to Next Step'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 3 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-indigo-900/20 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Owner Account</CardTitle>
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
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
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Owner Account'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 4 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-yellow-900/20 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Staff & Employees</CardTitle>
            <CardDescription className="text-gray-400">Add your first employee to the system. You can skip and do this later.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateEmployee}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empFirstName" className="text-gray-300">First Name</Label>
                  <Input 
                    id="empFirstName" 
                    value={employeeData.firstName}
                    onChange={(e) => setEmployeeData({ ...employeeData, firstName: e.target.value })}
                    placeholder="Jane" 
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empLastName" className="text-gray-300">Last Name</Label>
                  <Input 
                    id="empLastName" 
                    value={employeeData.lastName}
                    onChange={(e) => setEmployeeData({ ...employeeData, lastName: e.target.value })}
                    placeholder="Smith" 
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empRole" className="text-gray-300">Staff Role</Label>
                <select
                  id="empRole"
                  value={employeeData.roleName}
                  onChange={(e) => setEmployeeData({ ...employeeData, roleName: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                  <option value="Waiter" className="bg-black text-white">Waiter</option>
                  <option value="Chef" className="bg-black text-white">Chef</option>
                  <option value="Cashier" className="bg-black text-white">Cashier</option>
                  <option value="Manager" className="bg-black text-white">Manager</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empUsername" className="text-gray-300">Username</Label>
                  <Input 
                    id="empUsername" 
                    value={employeeData.username}
                    onChange={(e) => setEmployeeData({ ...employeeData, username: e.target.value })}
                    placeholder="jane.s" 
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empPassword" className="text-gray-300">Password</Label>
                  <Input 
                    id="empPassword" 
                    type="password"
                    value={employeeData.password}
                    onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                    placeholder="••••••••" 
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-yellow-500"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => markEmployeesDone()} className="w-1/3 bg-transparent text-gray-300 border-white/20 hover:bg-white/10">
                Skip
              </Button>
              <Button type="submit" className="w-2/3 bg-yellow-600 hover:bg-yellow-700 text-white border-0" disabled={loading}>
                {loading ? 'Adding...' : 'Add Employee'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 5 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-orange-900/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Initial Inventory</CardTitle>
            <CardDescription className="text-gray-400">Do you have inventory to add? Create your first product or skip for now.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateProduct}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prodName" className="text-gray-300">Product Name</Label>
                <Input 
                  id="prodName" 
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="e.g. Signature Burger" 
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prodPrice" className="text-gray-300">Price</Label>
                <Input 
                  id="prodPrice" 
                  type="number"
                  step="0.01"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                  placeholder="12.99" 
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-orange-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => markProductsDone()} className="w-1/3 bg-transparent text-gray-300 border-white/20 hover:bg-white/10">
                Skip
              </Button>
              <Button type="submit" className="w-2/3 bg-orange-600 hover:bg-orange-700 text-white border-0" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentSetupStep === 6 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-green-900/20 animate-in zoom-in duration-500">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Setup Complete!</h2>
            <p className="text-gray-400">Your business profile and owner account have been created successfully.</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4 bg-white text-black hover:bg-gray-200 border-0">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
