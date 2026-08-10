import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Wallet, ShoppingCart, Package, Receipt, Settings as SettingsIcon, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// We'll export the individual tab components from here

export function BusinessSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> Business Information</CardTitle>
        <CardDescription>Update your main business profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input value={data.name || ''} onChange={e => onChange({ ...data, name: e.target.value })} placeholder="Restaurant Name" />
          </div>
          <div className="space-y-2">
            <Label>Owner Name</Label>
            <Input value={data.owner_name || ''} onChange={e => onChange({ ...data, owner_name: e.target.value })} placeholder="Owner Name" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={data.phone || ''} onChange={e => onChange({ ...data, phone: e.target.value })} placeholder="+251..." />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={data.email || ''} onChange={e => onChange({ ...data, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Input value={data.address || ''} onChange={e => onChange({ ...data, address: e.target.value })} placeholder="Full Address" />
          </div>
          <div className="space-y-2">
            <Label>Currency *</Label>
            <Input value={data.currency || 'ETB'} onChange={e => onChange({ ...data, currency: e.target.value })} placeholder="ETB" />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">Upload a square image for best results.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const methods = data.payment_methods || [
    { id: '1', name: 'Cash', enabled: true },
    { id: '2', name: 'Mobile Banking', enabled: true, provider: 'Telebirr' },
    { id: '3', name: 'Card', enabled: true },
    { id: '4', name: 'Bank Transfer', enabled: false }
  ];

  const handleToggle = (id: string, enabled: boolean) => {
    const updated = methods.map((m: any) => m.id === id ? { ...m, enabled } : m);
    onChange({ ...data, payment_methods: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Payment Methods</CardTitle>
        <CardDescription>Configure accepted payment methods for checkout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {methods.map((method: any) => (
          <div key={method.id} className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <h3 className="font-semibold text-lg">{method.name}</h3>
              {method.provider && <p className="text-sm text-muted-foreground">Provider: {method.provider}</p>}
            </div>
            <Switch checked={method.enabled} onCheckedChange={(c) => handleToggle(method.id, c)} />
          </div>
        ))}
        <Button variant="outline" className="w-full">+ Add Payment Method</Button>
      </CardContent>
    </Card>
  );
}

export function OrderSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const settings = data.order_settings || {
    format: 'ORD-{YYYY}-{####}',
    defaultStatus: 'Pending',
    allowCancellation: true,
    requireCancelReason: true,
    allowModification: true
  };

  const update = (key: string, value: any) => {
    onChange({ ...data, order_settings: { ...settings, [key]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Order Settings</CardTitle>
        <CardDescription>Manage how orders are generated and handled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Order Number Format</Label>
            <Input value={settings.format} onChange={e => update('format', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Default Order Status</Label>
            <Select value={settings.defaultStatus} onValueChange={v => update('defaultStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Preparing">Preparing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-normal">Allow Order Cancellation</Label>
            <Switch checked={settings.allowCancellation} onCheckedChange={c => update('allowCancellation', c)} />
          </div>
          {settings.allowCancellation && (
            <div className="flex items-center justify-between pl-6 border-l-2 ml-2">
              <Label className="text-base font-normal text-muted-foreground">Require Cancellation Reason</Label>
              <Switch checked={settings.requireCancelReason} onCheckedChange={c => update('requireCancelReason', c)} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label className="text-base font-normal">Allow Order Modification</Label>
            <Switch checked={settings.allowModification} onCheckedChange={c => update('allowModification', c)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InventorySettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const settings = data.inventory_settings || {
    lowStockAlerts: true,
    lowStockThreshold: 10,
    allowNegativeStock: false,
    costingMethod: 'Weighted Average',
    requireSupplier: true
  };

  const update = (key: string, value: any) => {
    onChange({ ...data, inventory_settings: { ...settings, [key]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Inventory Settings</CardTitle>
        <CardDescription>Configure stock tracking behavior.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-normal">Low Stock Alerts</Label>
          <Switch checked={settings.lowStockAlerts} onCheckedChange={c => update('lowStockAlerts', c)} />
        </div>
        
        {settings.lowStockAlerts && (
          <div className="space-y-2 pl-6 border-l-2 ml-2">
            <Label>Default Low Stock Threshold</Label>
            <Input type="number" value={settings.lowStockThreshold} onChange={e => update('lowStockThreshold', parseInt(e.target.value) || 0)} className="max-w-[200px]" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-base font-normal">Allow Negative Stock</Label>
          <Switch checked={settings.allowNegativeStock} onCheckedChange={c => update('allowNegativeStock', c)} />
        </div>

        <div className="space-y-2">
          <Label>Costing Method</Label>
          <Select value={settings.costingMethod} onValueChange={v => update('costingMethod', v)}>
            <SelectTrigger className="max-w-[300px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Weighted Average">Weighted Average</SelectItem>
              <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
              <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-base font-normal">Require Supplier for Purchases</Label>
          <Switch checked={settings.requireSupplier} onCheckedChange={c => update('requireSupplier', c)} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TaxesSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const settings = data.tax_settings || {
    enableTax: true,
    taxName: 'VAT',
    taxRate: data.tax_rate || 15,
    enableServiceCharge: false,
    serviceChargeRate: 10
  };

  const update = (key: string, value: any) => {
    // If taxRate is updated, we also want to update data.tax_rate at the root level for backwards compatibility
    if (key === 'taxRate') {
      onChange({ ...data, tax_rate: value, tax_settings: { ...settings, [key]: value } });
    } else {
      onChange({ ...data, tax_settings: { ...settings, [key]: value } });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Percent className="w-5 h-5 text-primary" /> Taxes & Charges</CardTitle>
        <CardDescription>Configure VAT, custom taxes, and service charges.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-normal">Enable Tax</Label>
          <Switch checked={settings.enableTax} onCheckedChange={c => update('enableTax', c)} />
        </div>
        
        {settings.enableTax && (
          <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 ml-2">
            <div className="space-y-2">
              <Label>Tax Name</Label>
              <Input value={settings.taxName} onChange={e => update('taxName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" value={settings.taxRate} onChange={e => update('taxRate', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Label className="text-base font-normal">Enable Service Charge</Label>
          <Switch checked={settings.enableServiceCharge} onCheckedChange={c => update('enableServiceCharge', c)} />
        </div>

        {settings.enableServiceCharge && (
          <div className="space-y-2 pl-6 border-l-2 ml-2">
            <Label>Service Charge Rate (%)</Label>
            <Input type="number" value={settings.serviceChargeRate} onChange={e => update('serviceChargeRate', parseFloat(e.target.value) || 0)} className="max-w-[200px]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReceiptSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const settings = data.receipt_settings || {
    showBusinessName: true,
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showCashier: true,
    showTableNumber: true,
    showOrderNumber: true,
    footerMessage: 'Thank you for visiting us!',
    paperSize: '80mm'
  };

  const update = (key: string, value: any) => {
    onChange({ ...data, receipt_settings: { ...settings, [key]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Receipt Settings</CardTitle>
        <CardDescription>Customize the print layout for sales receipts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Visibility</h3>
            
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Business Name</Label>
              <Switch checked={settings.showBusinessName} onCheckedChange={c => update('showBusinessName', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Logo</Label>
              <Switch checked={settings.showLogo} onCheckedChange={c => update('showLogo', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Address</Label>
              <Switch checked={settings.showAddress} onCheckedChange={c => update('showAddress', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Phone</Label>
              <Switch checked={settings.showPhone} onCheckedChange={c => update('showPhone', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Cashier</Label>
              <Switch checked={settings.showCashier} onCheckedChange={c => update('showCashier', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Table Number</Label>
              <Switch checked={settings.showTableNumber} onCheckedChange={c => update('showTableNumber', c)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Show Order Number</Label>
              <Switch checked={settings.showOrderNumber} onCheckedChange={c => update('showOrderNumber', c)} />
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Configuration</h3>
             
             <div className="space-y-2">
               <Label>Paper Size</Label>
               <Select value={settings.paperSize} onValueChange={v => update('paperSize', v)}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="58mm">58mm (Small)</SelectItem>
                   <SelectItem value="80mm">80mm (Standard)</SelectItem>
                   <SelectItem value="A4">A4 (Invoice)</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <Label>Footer Message</Label>
               <Input value={settings.footerMessage} onChange={e => update('footerMessage', e.target.value)} placeholder="Thank you!" />
             </div>

             <div className="pt-4">
                <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center h-40">
                  <Receipt className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Receipt Preview</p>
                  <p className="text-xs text-muted-foreground mt-1">Live preview will be available in print mode</p>
                </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemSettingsTab({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const settings = data.system_settings || {
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Addis_Ababa',
    autoBackup: true,
    backupFrequency: 'Daily'
  };

  const update = (key: string, value: any) => {
    onChange({ ...data, system_settings: { ...settings, [key]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-primary" /> System Settings</CardTitle>
        <CardDescription>Configure core application behavior and localization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Existing Kitchen Toggle from before */}
        <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
          <div>
            <h3 className="font-semibold text-lg">Kitchen Module</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enable this if you have a kitchen display/printer. Disable this if waiters tell the kitchen directly.
            </p>
          </div>
          <Switch checked={data.is_kitchen_active} onCheckedChange={c => onChange({ ...data, is_kitchen_active: c })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Localization</h3>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={v => update('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Amharic">Amharic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={v => update('dateFormat', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select value={settings.timeZone} onValueChange={v => update('timeZone', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Backup & Sync</h3>
            
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <Label className="font-normal">Auto Backup</Label>
              <Switch checked={settings.autoBackup} onCheckedChange={c => update('autoBackup', c)} />
            </div>

            {settings.autoBackup && (
              <div className="space-y-2 pl-4 border-l-2 ml-2">
                <Label>Backup Frequency</Label>
                <Select value={settings.backupFrequency} onValueChange={v => update('backupFrequency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mt-6 border rounded-xl overflow-hidden">
              <div className="bg-muted p-3 border-b"><h4 className="font-medium text-sm">Synchronization Status</h4></div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center text-emerald-600 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="font-medium">10:42 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Sync</span>
                  <span className="font-medium">0 records</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border rounded-xl overflow-hidden">
              <div className="bg-muted p-3 border-b"><h4 className="font-medium text-sm">License</h4></div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center text-emerald-600 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span className="font-medium">August 10, 2027</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
