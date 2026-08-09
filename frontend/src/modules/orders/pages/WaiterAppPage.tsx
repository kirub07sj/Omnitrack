import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '@/store/useProductStore';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, CheckCircle2, Plus, Minus, X, Image as ImageIcon } from 'lucide-react';

export default function WaiterAppPage() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');

  const { products: allProducts, fetchProducts, isLoading: productsLoading } = useProductStore();
  
  const products = useMemo(() => {
    return allProducts.filter(p => !p.status || String(p.status).toLowerCase() === 'active');
  }, [allProducts]);

  const [tables, setTables] = useState<any[]>([]);
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isOrdersListOpen, setIsOrdersListOpen] = useState(false);

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
      
      fetchProducts(businessId);
      
      Promise.all([
        fetch(`/api/tables?business_id=${businessId}`).then(async r => {
          const text = await r.text();
          return text ? JSON.parse(text) : [];
        }),
        fetch(`/api/orders?business_id=${businessId}&status=Pending`).then(async r => {
          const text = await r.text();
          return text ? JSON.parse(text) : [];
        })
      ]).then(([tabs, ords]) => {
        let tItems = [];
        if (Array.isArray(tabs)) tItems = tabs;
        else if (tabs && Array.isArray(tabs.tables)) tItems = tabs.tables;
        else if (tabs && Array.isArray(tabs.data)) tItems = tabs.data;

        tItems.sort((a: any, b: any) => {
          const numA = parseInt(String(a.table_number || '').replace(/\D/g, '')) || 0;
          const numB = parseInt(String(b.table_number || '').replace(/\D/g, '')) || 0;
          return numA - numB;
        });

        let oItems = [];
        if (Array.isArray(ords)) oItems = ords;
        else if (ords && Array.isArray(ords.data)) oItems = ords.data;

        setTables(tItems);
        setOrdersList(oItems);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load data", err);
        setError("Failed to load table and order data. Please try again.");
        setLoading(false);
      });
    } else {
      setError("Invalid QR Code. Missing business ID.");
      setLoading(false);
    }
  }, [businessId, fetchProducts]);

  // Polling for products auto-update without refresh
  useEffect(() => {
    if (!businessId) return;
    const intervalId = setInterval(() => {
      fetchProducts(businessId, true); // true = silent
    }, 5000);
    return () => clearInterval(intervalId);
  }, [businessId, fetchProducts]);

  const activeProducts = products; // Already filtered in useMemo

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
      table_id: selectedTable || null,
      notes: "",
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
        // Refresh orders list
        fetch(`/api/orders?business_id=${businessId}&status=Pending`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) setOrdersList(data);
            else if (data && Array.isArray(data.data)) setOrdersList(data.data);
          })
          .catch(err => console.error(err));
          
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

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans flex flex-col w-full max-w-md mx-auto relative overflow-hidden">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-emerald-600 tracking-tight">Table Order</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsOrdersListOpen(true)}
              className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Active Orders
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live</span>
            </div>
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
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-slate-800"
          >
            <option value="" disabled>Select Table</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>{t.table_number}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Category Pills */}
      <div className="bg-white z-30 pt-3 pb-2 sticky top-[120px] md:top-[128px]">
        <ScrollArea className="w-full whitespace-nowrap px-4">
          <div className="flex space-x-2 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
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
                  className="group relative bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  {inCartCount > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-in zoom-in z-10 shadow-sm">
                      {inCartCount}
                    </div>
                  )}
                  <div className="relative h-24 w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-active:scale-110 transition-transform duration-500 ease-out" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 group-active:text-emerald-400 group-active:scale-110 transition-all duration-500">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="p-3 w-full flex flex-col items-center justify-between flex-1">
                    <h3 className="text-sm text-center font-semibold line-clamp-2 mb-2 text-slate-800 leading-tight">{product.name}</h3>
                    <div className="mt-auto bg-slate-50 rounded-lg px-3 py-1 w-full text-center border border-slate-100">
                      <span className="text-emerald-600 font-bold"><span className="text-[0.65em] font-medium opacity-80 mr-0.5">ETB</span> {Number(product.price).toFixed(2)}</span>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-white via-white to-transparent animate-in slide-in-from-bottom-10 flex justify-center">
          <div className="w-full max-w-md">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">View Cart</span>
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
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
              Your Cart
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-6">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-600 font-bold text-xl">{item.product.name[0]}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 pr-4">
                    <h4 className="font-semibold text-sm leading-tight text-slate-900">{item.product.name}</h4>
                    <div className="text-emerald-600 font-bold mt-1"><span className="text-[0.7em] font-medium opacity-80 mr-0.5">ETB</span> {Number(item.product.price).toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-900 shadow-sm active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item.product)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-900 shadow-sm active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
              <span className="font-semibold text-slate-500 text-sm uppercase tracking-wider">Total</span>
              <span className="font-bold text-xl"><span className="text-[0.65em] font-medium opacity-80 mr-0.5 relative -top-0.5">ETB</span> {cartTotal.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={submitOrder}
              disabled={submitLoading || cart.length === 0 || !selectedTable}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              {submitLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                'Place Order'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success State Overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Sent!</h2>
            <p className="text-slate-500">The kitchen has received your order.</p>
          </div>
        </div>
      )}

      {/* Orders List Overlay */}
      {isOrdersListOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Active Orders</h2>
            <button 
              onClick={() => setIsOrdersListOpen(false)}
              className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-6">
              {ordersList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-medium">No active orders</div>
              ) : (
                ordersList.map(order => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                      <span className="font-bold text-lg text-emerald-600">{order.table?.table_number ? `Table ${order.table.table_number}` : 'No Table'} - #{order.id.split('-')[0].toUpperCase()}</span>
                      <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">{order.status}</span>
                    </div>
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm items-center">
                          <span className="text-slate-700 font-medium"><span className="text-emerald-600 font-bold mr-1">{item.quantity}x</span> {item.product?.name}</span>
                          <span className="font-semibold text-slate-900">ETB {Number(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center font-bold">
                      <span className="text-slate-500">Total</span>
                      <span className="text-lg text-emerald-600">ETB {order.items?.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
