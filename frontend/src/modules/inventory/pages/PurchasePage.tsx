import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InventoryService } from "../services/inventory.service";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { Supplier } from "../../suppliers/types/supplier";
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";

export default function AddEditInventoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("Paid");
  const [items, setItems] = useState([
    { id: Date.now().toString(), name: "", inventory_item_id: "", quantity: "", unit: "kg", cost: "", min_quantity: "" }
  ]);

  useEffect(() => {
    SupplierService.getSuppliers().then(setSuppliers);
    InventoryService.getInventory().then(setExistingItems);
  }, []);

  const totalCost = items.reduce((sum, item) => sum + (parseFloat(item.quantity || "0") * parseFloat(item.cost || "0")), 0);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), name: "", inventory_item_id: "", quantity: "", unit: "kg", cost: "", min_quantity: "" }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(idx, 1);
      setItems(newItems);
    }
  };

  const handleChangeItem = (idx: number, field: string, value: string) => {
    const newItems = [...items];
    const item = newItems[idx];
    (item as any)[field] = value;
    
    // Auto-fill unit if existing item selected
    if (field === 'inventory_item_id' && value !== 'new') {
      const existing = existingItems.find(i => i.id === value);
      if (existing) {
        item.name = existing.name;
        item.unit = existing.unit;
      }
    } else if (field === 'inventory_item_id' && value === 'new') {
      item.inventory_item_id = '';
      item.name = '';
    }

    setItems(newItems);
  };

  const onSubmit = async () => {
    if (!supplierId) return alert("Please select a supplier");
    for (const item of items) {
      if (!item.inventory_item_id && !item.name) return alert("All items must have a product selected or named");
      if (!item.quantity || isNaN(Number(item.quantity))) return alert("Invalid quantity");
      if (!item.cost || isNaN(Number(item.cost))) return alert("Invalid unit cost");
    }

    try {
      setIsLoading(true);
      const payload = {
        business_id: currentUser?.business_id,
        supplier_id: supplierId,
        status,
        items: items.map(i => ({
          inventory_item_id: i.inventory_item_id || undefined,
          name: i.name,
          quantity: parseFloat(i.quantity),
          cost: parseFloat(i.cost),
          unit: i.unit,
          minimum_quantity: i.min_quantity ? parseFloat(i.min_quantity) : undefined
        }))
      };

      await InventoryService.createPurchase(payload);
      navigate("/owner/inventory");
    } catch (error) {
      console.error(error);
      alert("Failed to save purchase");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 omni-animate-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Purchase</h1>
          <p className="text-muted-foreground">Add new stock from a supplier.</p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-8 relative overflow-hidden">
        {/* Supplier Selection */}
        <div className="max-w-md">
          <Label className="text-sm font-semibold mb-2 block uppercase text-muted-foreground">Supplier</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="h-12 bg-muted/20">
              <SelectValue placeholder="Select a supplier..." />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold uppercase text-muted-foreground">Products</Label>
          
          {items.map((item, idx) => (
            <Card key={item.id} className="relative group bg-muted/10 border-muted/30">
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-2">
                  <Label>Product</Label>
                  <Select value={item.inventory_item_id || (item.name ? '' : undefined)} onValueChange={(v) => handleChangeItem(idx, 'inventory_item_id', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select existing or enter new..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="font-bold text-primary">+ Add New Product</SelectItem>
                      {existingItems.map(ei => (
                        <SelectItem key={ei.id} value={ei.id}>{ei.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!item.inventory_item_id && (
                    <Input 
                      placeholder="Product Name" 
                      value={item.name} 
                      onChange={e => handleChangeItem(idx, 'name', e.target.value)}
                      className="mt-2 bg-background"
                    />
                  )}
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={item.quantity} 
                      onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                      className="bg-background"
                    />
                    <Select value={item.unit} onValueChange={v => handleChangeItem(idx, 'unit', v)} disabled={!!item.inventory_item_id}>
                      <SelectTrigger className="w-24 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="box">box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Unit Cost</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={item.cost} 
                    onChange={e => handleChangeItem(idx, 'cost', e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Min Qty</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={item.min_quantity} 
                    onChange={e => handleChangeItem(idx, 'min_quantity', e.target.value)}
                    className="bg-background"
                    disabled={!!item.inventory_item_id}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pb-1">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="border-dashed border-2 w-full h-12 hover:bg-primary/5 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors" onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" /> Add another item
        </Button>

        {/* Footer info */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-3 w-full md:w-auto">
            <Label className="text-sm font-semibold uppercase text-muted-foreground block">Payment Status</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="Paid" 
                  checked={status === 'Paid'} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span className={status === 'Paid' ? 'font-bold' : ''}>Paid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="Unpaid" 
                  checked={status === 'Unpaid'} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span className={status === 'Unpaid' ? 'font-bold' : ''}>Unpaid</span>
              </label>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-xl text-right min-w-[250px] w-full md:w-auto">
            <p className="text-sm font-medium text-primary uppercase mb-1">Total Due</p>
            <h3 className="text-3xl font-black text-primary">{totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB</h3>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-md w-full md:w-auto" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Save Purchase
          </Button>
        </div>
      </div>
    </div>
  );
}
