import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, CheckCircle2, ChevronDown, Plus, Minus, X, Image as ImageIcon } from 'lucide-react';

export default function WaiterAppPage() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');

  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [waiterName, setWaiterName] = useState<string>('Waiter 1');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (businessId) {
      setLoading(true);
      setError(null);
        Promise.all([
          fetch(`/api/products?business_id=${businessId}&t=${Date.now()}`).then(async r => {
            const text = await r.text();
            return text ? JSON.parse(text) : [];
          }),
          fetch(`/api/tables?business_id=${businessId}`).then(async r => {
            const text = await r.text();
            return text ? JSON.parse(text) : [];
          })
        ]).then(([prods, tabs]) => {
          let pItems = [];
          if (Array.isArray(prods)) pItems = prods;
          else if (prods && Array.isArray(prods.products)) pItems = prods.products;
          else if (prods && Array.isArray(prods.data)) pItems = prods.data;
          
          let tItems = [];
          if (Array.isArray(tabs)) tItems = tabs;
          else if (tabs && Array.isArray(tabs.tables)) tItems = tabs.tables;
          else if (tabs && Array.isArray(tabs.data)) tItems = tabs.data;

          const activeProducts = pItems.filter((p: any) => 
            p && typeof p === 'object' && (!p.status || String(p.status).toLowerCase() === 'active')
          );
          setProducts(activeProducts);
          setTables(tItems);
          setLoading(false);
      }).catch(err => {
        console.error("Failed to load data", err);
        setError("Failed to load menu data. Please try again.");
        setLoading(false);
      });
    } else {
      setError("Invalid QR Code. Missing business ID.");
      setLoading(false);
    }
  }, [businessId]);

  const activeProducts = useMemo(() => {
    return products.filter((p: any) => p.status === 'Active');
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeProducts.forEach(p => {
      const catName = p.category?.name || p.category_id;
      if (catName) cats.add(catName);
    });
    return ['All', ...Array.from(cats)];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return activeProducts;
    return activeProducts.filter(p => (p.category?.name || p.category_id) === selectedCategory);
  }, [activeProducts, selectedCategory]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, completely: boolean = false) => {
    setCart(prev => {
      if (completely) return prev.filter(item => item.product.id !== productId);
      
      return prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    setSubmitLoading(true);
    setError(null);

    const orderData = {
      business_id: businessId,
      notes: `Waiter: ${waiterName}`,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        setCart([]);
        setOrderSuccess(true);
        setIsCartOpen(false);
        setTimeout(() => setOrderSuccess(false), 3000);
      } else {
        setError("Failed to submit order. Please try again.");
      }
    } catch (e) {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="dark bg-background text-foreground min-h-screen font-sans flex flex-col w-full max-w-md mx-auto relative overflow-hidden">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary tracking-tight">Table Order</h1>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-destructive/70 hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <input 
            type="text" 
            value={waiterName}
            onChange={(e) => setWaiterName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </header>

      {/* Category Pills */}
      <div className="bg-background z-30 pt-3 pb-2 sticky top-[120px] md:top-[128px]">
        <ScrollArea className="w-full whitespace-nowrap px-4">
          <div className="flex space-x-2 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1 px-4 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p>No active products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-2">
            {filteredProducts.map(product => {
              const inCartCount = cart.find(c => c.product.id === product.id)?.quantity || 0;
              
              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  {inCartCount > 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-in zoom-in z-10 shadow-sm">
                      {inCartCount}
                    </div>
                  )}
                  <div className="relative h-24 w-full bg-secondary/30 flex items-center justify-center overflow-hidden border-b border-border/30">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-active:scale-110 transition-transform duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 group-active:text-primary/40 group-active:scale-110 transition-all duration-500">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="p-3 w-full flex flex-col items-center justify-between flex-1">
                    <h3 className="text-sm text-center font-semibold line-clamp-2 mb-2 text-card-foreground leading-tight">{product.name}</h3>
                    <div className="mt-auto bg-background/50 rounded-lg px-3 py-1 w-full text-center border border-border/30">
                      <span className="text-primary font-bold"><span className="text-[0.65em] font-medium opacity-80 mr-0.5">ETB</span> {Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCartOpen && !orderSuccess && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background via-background to-transparent animate-in slide-in-from-bottom-10 flex justify-center">
          <div className="w-full max-w-md">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary/25 active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary-foreground/20 rounded-full p-2">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">View Cart</span>
                  <span className="font-bold text-lg leading-none">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
                </div>
              </div>
              <span className="font-bold text-xl"><span className="text-[0.65em] font-medium opacity-80 mr-0.5">ETB</span> {cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Cart Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Your Cart
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-6">
              {cart.map(item => (
                <div key={item.product.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-xl">{item.product.name[0]}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-sm leading-tight text-foreground">{item.product.name}</h4>
                    <div className="text-primary font-bold mt-1"><span className="text-[0.7em] font-medium opacity-80 mr-0.5">ETB</span> {Number(item.product.price).toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-foreground shadow-sm active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item.product)}
                      className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-foreground shadow-sm active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-card border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border/50 mb-4">
              <span className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Total</span>
              <span className="font-bold text-xl"><span className="text-[0.65em] font-medium opacity-80 mr-0.5 relative -top-0.5">ETB</span> {cartTotal.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={submitOrder}
              disabled={submitLoading || cart.length === 0}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg"
              size="lg"
            >
              {submitLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                'Send to Kitchen'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success State Overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-card border border-border p-8 rounded-3xl flex flex-col items-center max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Sent!</h2>
            <p className="text-muted-foreground">The kitchen has received your order.</p>
          </div>
        </div>
      )}
    </div>
  );
}
