import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useSSE } from '@/hooks/useSSE';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function POSPage() {
  const { currentUser, businessSettings } = useAppStore();
  const isKitchenActive = businessSettings?.is_kitchen_active ?? true;
  const { orders, tables, fetchOrders, fetchTables, createOrder, updateOrder } = useOrderStore();
  const { products: allProducts, fetchProducts } = useProductStore();
  
  const products = useMemo(() => {
    return allProducts.filter(p => !p.status || String(p.status).toLowerCase() === 'active');
  }, [allProducts]);

  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [activeCategory, setActiveCategory] = useState('All');
  const [qrOpen, setQrOpen] = useState(false);

  useSSE(); // Initialize SSE

  useEffect(() => {
    if (currentUser?.business_id) {
      fetchOrders(currentUser.business_id);
      fetchTables(currentUser.business_id);
      fetchProducts(currentUser.business_id);
    }
  }, [currentUser, fetchOrders, fetchTables, fetchProducts]);

  // Build a LAN-accessible URL for the QR code (phones can't reach localhost)
  const qrUrl = (() => {
    const loc = window.location;
    const host = loc.hostname === 'localhost' || loc.hostname === '127.0.0.1'
      ? loc.hostname // will be replaced below
      : loc.hostname;
    return `${loc.protocol}//${host}:${loc.port}/waiter?business_id=${currentUser?.business_id}`;
  })();

  // Detect the LAN IP from the Vite network URL (shown in terminal)
  const [lanUrl, setLanUrl] = useState(qrUrl);
  useEffect(() => {
    // Try to get the actual network IP by checking what Vite exposes
    const loc = window.location;
    if (loc.hostname !== 'localhost' && loc.hostname !== '127.0.0.1') {
      setLanUrl(`${loc.protocol}//${loc.hostname}:${loc.port}/waiter?business_id=${currentUser?.business_id}`);
    } else {
      // Fallback: fetch a special endpoint or use the known IP
      fetch('/api/network-info').then(r => r.json()).then(data => {
        if (data.ip) {
          setLanUrl(`${loc.protocol}//${data.ip}:${loc.port}/waiter?business_id=${currentUser?.business_id}`);
        }
      }).catch(() => {
        // Last resort: keep localhost URL
        setLanUrl(`${loc.protocol}//${loc.hostname}:${loc.port}/waiter?business_id=${currentUser?.business_id}`);
      });
    }
  }, [currentUser?.business_id]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const decrementFromCart = (productId: string) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getCategoryName = (p: any) => {
    if (typeof p.category === 'string') return p.category;
    if (p.category?.name) return p.category.name;
    return null;
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(getCategoryName).filter(Boolean));
    return ['All', ...Array.from(cats)] as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => getCategoryName(p) === activeCategory);
  }, [products, activeCategory]);

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const orderData = {
      business_id: currentUser?.business_id,
      waiter_id: currentUser?.employee_id, // Cashier is acting as waiter here
      table_id: selectedTable || null,
      status: isKitchenActive ? 'Pending' : 'Completed',
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    try {
      await createOrder(orderData);
      setCart([]);
      setSelectedTable('');
      setSuccess(isKitchenActive ? "Order sent to kitchen!" : "Checkout completed!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError("Failed to create order: " + e.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrder(orderId, { status });
      setSuccess(`Order marked as ${status}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError("Failed to update status");
      setTimeout(() => setError(null), 3000);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-primary/20 text-primary border-primary/30';
      case 'In Progress': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'Completed': return 'bg-muted text-muted-foreground border-border';
      case 'Cancelled': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {(error || success) && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-5">
          {error && (
            <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}
        </div>
      )}
      
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4 bg-background text-foreground">
      {/* Left Area: Menu / Active Orders */}
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden omni-animate-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="menu" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Menu</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                Active Orders
                {orders.filter(o => o.status === 'Pending').length > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    {orders.filter(o => o.status === 'Pending').length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 transition-colors" onClick={() => setQrOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                Waiter QR Code
              </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 pt-4">
          {activeTab === 'menu' ? (
            <div className="h-full flex flex-col">
              {categories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-4 px-4 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === cat 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              
              <ScrollArea className="flex-1 px-4 pb-4">
                {filteredProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 omni-animate-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <p className="text-lg font-medium">No products available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                    {filteredProducts.map((product, i) => {
                      const staggerClass = `omni-stagger-${Math.min((i % 8) + 1, 8)}`;
                      const catName = getCategoryName(product);
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
                              <img src={(product.image_url || product.imageUrl)?.replace(/^https?:\/\/[^/]+(\/uploads\/)/, '$1')} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-500">
                                <ImageIcon size={32} />
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1 text-center items-center justify-between">
                            <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                            <p className="text-primary font-bold mt-2 text-lg"><span className="text-[0.65em] font-medium opacity-80 mr-0.5">ETB</span> {Number(product.price).toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-4 pb-10">
                {orders.map((order, i) => {
                   const staggerClass = `omni-stagger-${Math.min((i % 8) + 1, 8)}`;
                   return (
                  <div key={order.id} className={`bg-card/50 hover:bg-card border border-border/50 rounded-xl p-5 flex flex-col gap-4 omni-animate-in ${staggerClass} transition-colors`}>
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                      <div>
                        <span className="font-bold text-lg text-foreground">
                          {order.table?.table_number ? `${order.table.table_number} - #${order.id.split('-')[0].toUpperCase()}` : `Order #${order.id.split('-')[0].toUpperCase()}`}
                        </span>
                        <span className="text-xs text-muted-foreground ml-3 font-medium bg-muted px-2 py-1 rounded-md">Wait: {order.waiter?.first_name || 'Staff'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-background border border-input text-foreground text-xs rounded-md p-1.5 focus:ring-1 focus:ring-primary outline-none cursor-pointer shadow-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm items-center">
                          <span className="text-foreground"><span className="text-primary font-bold mr-2">{item.quantity}x</span> {item.product?.name}</span>
                          <div className="text-right">
                          <span className="text-muted-foreground font-medium"><span className="text-[0.75em] opacity-80 mr-0.5">ETB</span> {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )})}
                {orders.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 omni-animate-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <p className="text-lg font-medium">No active orders</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Right Area: Cart */}
      <Card className="w-96 flex flex-col bg-card border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] omni-animate-in omni-stagger-2 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
        <CardHeader className="border-b border-border/30 pb-5 bg-card/80 backdrop-blur-md relative z-10">
          <CardTitle className="text-xl font-bold flex items-center justify-between text-foreground tracking-tight w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              Current Order
            </div>
            
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="text-sm bg-background border border-border text-foreground rounded-md px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none max-w-[130px]"
            >
              <option value="" disabled>Select Table</option>
              {tables.map((t: any) => (
                <option key={t.id} value={t.id}>{t.table_number}</option>
              ))}
            </select>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 bg-background/30 relative">
          <ScrollArea className="h-full px-5 pt-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-24 omni-animate-in">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </div>
                <p className="font-medium text-lg">Your cart is empty</p>
                <p className="text-xs text-muted-foreground/70 text-center px-8">Add items from the menu to start creating an order.</p>
              </div>
            ) : (
              <div className="space-y-4 pb-10">
                {cart.map((item, i) => {
                  const staggerClass = `omni-stagger-${Math.min((i % 8) + 1, 8)}`;
                  return (
                  <div key={item.product.id} className={`group flex flex-col bg-card rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30 omni-animate-in ${staggerClass}`}>
                    <div className="flex items-start justify-between p-4 pb-3">
                      <div className="flex-1 pr-3">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md"><span className="opacity-80 font-normal mr-0.5">ETB</span> {Number(item.product.price).toFixed(2)} each</span>
                        </div>
                      </div>
                      <span className="text-base font-bold text-foreground">
                        <span className="text-[0.65em] font-medium opacity-80 mr-0.5 text-muted-foreground">ETB</span> {(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="px-4 pb-3 pt-2 flex justify-between items-center border-t border-border/30 border-dashed">
                      <button 
                        onClick={() => decrementFromCart(item.product.id)}
                        className="text-[10px] uppercase font-bold tracking-wider text-destructive/70 hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                      <div className="flex items-center bg-secondary/80 rounded-lg p-0.5 shadow-sm border border-border/50">
                        <button className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-all" onClick={() => decrementFromCart(item.product.id)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                        <span className="text-sm font-bold w-8 text-center text-foreground tabular-nums">{item.quantity}</span>
                        <button className="w-8 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-all" onClick={() => addToCart(item.product)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        
        <div className="p-5 pt-0 bg-card relative z-10">
          <div className="absolute top-0 inset-x-5 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          
          <div className="pt-5 pb-4 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span><span className="text-[0.8em] opacity-80 mr-0.5">ETB</span> {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Tax (0%)</span>
              <span><span className="text-[0.8em] opacity-80 mr-0.5">ETB</span> 0.00</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-medium text-foreground">Total</span>
              <span className="text-3xl font-black text-primary tracking-tight"><span className="text-[0.5em] font-medium opacity-70 mr-1 relative -top-1">ETB</span> {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full py-6 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 border-0"
            onClick={() => handleCreateOrder()}
            disabled={cart.length === 0 || !selectedTable}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              {isKitchenActive ? 'Send to Kitchen' : 'Checkout & Complete'}
            </span>
          </Button>
        </div>
      </Card>
    </div>

    {/* QR Code Dialog — rendered outside the layout so it centers properly */}
    <Dialog open={qrOpen} onOpenChange={setQrOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">Waiter Ordering System</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-lg ring-1 ring-border/50">
            <QRCode value={lanUrl} size={256} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Waiters can scan this QR code to access the mobile ordering system directly on their phones. Must be on the same local network.
          </p>
          <code className="text-xs bg-muted text-muted-foreground p-3 rounded-lg w-full text-center break-all border border-border/50">{lanUrl}</code>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
