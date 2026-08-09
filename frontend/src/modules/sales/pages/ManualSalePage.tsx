import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ArrowLeft, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutDialog from '../components/CheckoutDialog';
import ReceiptDialog from '../components/ReceiptDialog';

export default function ManualSalePage() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, tableRes] = await Promise.all([
          fetch(`/api/products?business_id=${currentUser?.business_id}`),
          fetch(`/api/tables?business_id=${currentUser?.business_id}`)
        ]);
        
        const pData = await prodRes.json();
        const tData = await tableRes.json();
        
        if (pData.success) {
          // Adjust based on your API structure (some APIs wrap array in `data`)
          setProducts(Array.isArray(pData.data) ? pData.data : pData);
        }
        if (tData.success) {
          setTables(Array.isArray(tData.data) ? tData.data : tData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser?.business_id) fetchData();
  }, [currentUser?.business_id]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product_id: product.id, product, quantity: 1, price: product.price }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleContinue = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const manualOrderPayload = {
    table_id: selectedTable || null,
    waiter_id: null,
    items: cart
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Manual Sale</h2>
          <p className="text-muted-foreground">Create a completed sale directly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products by name or SKU..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="border rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors bg-card flex flex-col"
                      onClick={() => addToCart(product)}
                    >
                      <div className="font-bold text-sm leading-tight mb-1">{product.name}</div>
                      <div className="text-xs text-muted-foreground mt-auto pt-2">{parseFloat(product.price).toFixed(2)} ETB</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Current Sale
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              <div className="mb-4">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Assign Table (Optional)</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <option value="">-- Walk-in / No Table --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>Table {t.table_number}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 border-y py-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <ShoppingCart className="w-10 h-10 mb-2" />
                    <p className="text-sm">Cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product_id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.product.name}</div>
                        <div className="text-xs text-muted-foreground">{(item.price * item.quantity).toFixed(2)} ETB</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(item.product_id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 mt-auto">
                <div className="flex justify-between font-bold text-xl mb-4">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(2)} ETB</span>
                </div>
                <Button 
                  className="w-full font-bold h-12" 
                  disabled={cart.length === 0}
                  onClick={handleContinue}
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckoutDialog
        order={manualOrderPayload}
        open={showCheckout}
        onOpenChange={setShowCheckout}
        isManual={true}
        onSuccess={(data) => {
          setCart([]);
          setSelectedTable('');
          setCompletedSale(data);
          setShowReceipt(true);
        }}
      />

      <ReceiptDialog
        sale={completedSale}
        open={showReceipt}
        onOpenChange={(open) => {
          setShowReceipt(open);
          if (!open) navigate(`/${currentUser?.role?.toLowerCase() || 'owner'}/sales`);
        }}
      />
    </div>
  );
}
