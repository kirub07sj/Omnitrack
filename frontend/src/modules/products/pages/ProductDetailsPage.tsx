import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from "../services/product.service";
import { ArrowLeft, Edit, DollarSign, Tag, Box, AlertTriangle, Layers, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from '@/utils/image';
import { useSettings } from '@/hooks/useSettings';

export default function ProductDetailsPage() {
  const { currency } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ProductService.getProductById(id!);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center h-[400px]">
      <h2 className="text-xl font-bold">Product not found</h2>
      <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const profit = product.price && product.cost ? (product.price - product.cost) : null;
  const margin = profit && product.price ? ((profit / product.price) * 100).toFixed(1) : null;

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full omni-animate-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.status === "Active" ? "bg-primary/20 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>
                {product.status}
              </span>
              {product.categoryId && (
                <span className="text-muted-foreground text-sm flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> {product.categoryId}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`../edit`, { relative: 'path' })} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Edit className="mr-2 h-4 w-4" /> Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-48 h-48 rounded-xl bg-muted flex items-center justify-center border border-border overflow-hidden shrink-0">
              {product.imageUrl ? (
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description || "No description provided."}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">SKU</div>
                  <div className="font-medium">{product.sku || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Barcode</div>
                  <div className="font-medium">{product.barcode || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Unit</div>
                  <div className="font-medium">{product.unit || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Inventory */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-600" /> Pricing
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground text-sm font-medium">Selling Price</span>
                <span className="text-lg font-bold text-emerald-600">{product.price ? `${Number(product.price).toFixed(2)} ${currency}` : "-"}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <span className="text-muted-foreground text-sm font-medium">Cost</span>
                <span className="text-base font-semibold">{product.cost ? `${Number(product.cost).toFixed(2)} ${currency}` : "-"}</span>
              </div>
              {profit !== null && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground text-sm font-medium">Profit Margin</span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {profit.toFixed(2)} {currency} ({margin}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Box className="w-5 h-5 mr-2 text-blue-600" /> Inventory
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm font-medium">Track Inventory</span>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.trackInventory ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                  {product.trackInventory ? "Yes" : "No"}
                </span>
              </div>
              
              {product.inventory_item_id && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Linked to raw ingredient stock</span>
                </div>
              )}

              {product.trackInventory && (
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="text-muted-foreground text-sm font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" /> Min Stock Alert
                  </span>
                  <span className="font-semibold">{product.minStock || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
