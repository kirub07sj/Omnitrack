import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BusinessSettingsTab, 
  PaymentSettingsTab, 
  OrderSettingsTab, 
  InventorySettingsTab, 
  TaxesSettingsTab, 
  ReceiptSettingsTab, 
  SystemSettingsTab 
} from '../components/SettingsForms';

export default function SettingsPage() {
  const { businessSettings, updateBusinessSettings } = useAppStore();
  
  // Parse existing JSON settings or use empty object
  const initialSettings = businessSettings?.settings ? JSON.parse(businessSettings.settings) : {};

  // Construct flat form data combining DB columns and JSON settings
  const [formData, setFormData] = useState<any>({
    is_kitchen_active: businessSettings?.is_kitchen_active ?? true,
    name: businessSettings?.name || '',
    owner_name: businessSettings?.owner_name || '',
    phone: businessSettings?.phone || '',
    email: businessSettings?.email || '',
    address: businessSettings?.address || '',
    logo: businessSettings?.logo || '',
    currency: businessSettings?.currency || 'ETB',
    tax_rate: businessSettings?.tax_rate || 15,
    ...initialSettings
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Separate root columns from JSON settings
      const { 
        is_kitchen_active, name, owner_name, phone, email, address, logo, currency, tax_rate, 
        ...otherSettings 
      } = formData;

      const payload = {
        is_kitchen_active,
        name, owner_name, phone, email, address, logo, currency, tax_rate,
        settings: JSON.stringify(otherSettings)
      };

      const res = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        updateBusinessSettings(data.business);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error occurred' });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your business rules and workflows</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="shadow-lg">
          {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Save All Changes
        </Button>
      </div>

      {/* Fixed Toast Notifications */}
      {message && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-5">
          <div className={`px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'}`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent border-b p-0 rounded-none space-x-1 mb-6">
          <TabsTrigger value="business" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Business</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Payments</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Orders</TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Inventory</TabsTrigger>
          <TabsTrigger value="taxes" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Taxes & Charges</TabsTrigger>
          <TabsTrigger value="receipts" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">Receipts</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business" className="animate-in fade-in-50 duration-300">
          <BusinessSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="payments" className="animate-in fade-in-50 duration-300">
          <PaymentSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="orders" className="animate-in fade-in-50 duration-300">
          <OrderSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="inventory" className="animate-in fade-in-50 duration-300">
          <InventorySettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="taxes" className="animate-in fade-in-50 duration-300">
          <TaxesSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="receipts" className="animate-in fade-in-50 duration-300">
          <ReceiptSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
        <TabsContent value="system" className="animate-in fade-in-50 duration-300">
          <SystemSettingsTab data={formData} onChange={setFormData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
