import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ArrowLeft, ShoppingCart, Minus, Plus, Trash2, ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/utils/image';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CheckoutDialog from '../components/CheckoutDialog';
import ReceiptDialog from '../components/ReceiptDialog';
import { useSettings } from '@/hooks/useSettings';
import { apiFetch } from '@/lib/api';

export default function ManualSalePage() {
  const { currentUser } = useAppStore();
  const { currency } = useSettings();
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
          apiFetch(`/api/products?business_id=${currentUser?.business_id}`),
          apiFetch(`/api/tables?business_id=${currentUser?.business_id}`)
        ]);
        
        const pData = await prodRes.json();
        const tData = await tableRes.json();
        
        if (Array.isArray(pData)) {
          setProducts(pData);
        } else if (pData.success) {
          setProducts(Array.isArray(pData.data) ? pData.data : []);
        }

        if (Array.isArray(tData)) {
          setTables(tData);
        } else if (tData.success) {
          setTables(Array.isArray(tData.data) ? tData.data : []);
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
    table_id: (!selectedTable || selectedTable === 'walk_in') ? null : selectedTable,
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 pb-10">
                  {filteredProducts.map((product, i) => {
                    const staggerClass = `omni-stagger-${Math.min((i % 8) + 1, 8)}`;
                    const catName = product.Category?.name || product.category_name || '';
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => addToCart(product)}
                        className={`cursor-pointer bg-card/50 hover:bg-card border border-border/50 rounded-xl transition-all duration-300 omni-card-hover omni-animate-in-scale ${staggerClass} flex flex-col overflow-hidden group`}
                      >
                        <div className="relative h-32 w-full bg-muted/30 flex flex-col items-center justify-center">
                          {catName && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-bold z-10 shadow-sm border border-border/50">
                              {catName}
                            </div>
                          )}
                          
                          {(product.image_url || product.imageUrl) ? (
                            <img src={getImageUrl(product.image_url || product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-500">
                              <ImageIcon size={32} />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1 text-center items-center justify-between">
                          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                          <p className="text-primary font-bold mt-2 text-lg"><span className="text-[0.65em] font-medium opacity-80 mr-0.5">{currency}</span> {Number(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
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
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="-- Walk-in / No Table --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk_in">-- Walk-in / No Table --</SelectItem>
                    {tables.map(t => (
                      <SelectItem key={t.id} value={t.id}>Table {t.table_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        <div className="text-xs text-muted-foreground">{(item.price * item.quantity).toFixed(2)} {currency}</div>
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
                  <span className="text-primary">{total.toFixed(2)} {currency}</span>
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
