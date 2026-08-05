//@ts-nocheck
import { useState, useEffect } from "react";
import { ProductTable } from "../components/ProductTable";
import { Plus, Download, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { ProductService } from "../services/product.service";
// import { DeleteProductDialog } from "../components/DeleteProductDialog";

export default function ProductListPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const roleBase = `/${currentUser?.role?.toLowerCase() || 'owner'}`;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleView = (prod: any) => {
    navigate(`${roleBase}/products/${prod.id}`);
  };

  const handleEdit = (prod: any) => {
    navigate(`${roleBase}/products/${prod.id}/edit`);
  };

  const handleAddNew = () => {
    navigate(`${roleBase}/products/new`);
  };

  const handleDuplicate = (prod: any) => {
    console.log("Duplicate", prod);
  };

  const handleDelete = (prod: any) => {
    console.log("Delete", prod);
  };

  const handleExport = () => {
    console.log("Exporting PDF...");
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory, pricing, and catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading} className="border-border">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="border-border hidden sm:flex">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="border-border">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddNew} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 rounded-xl bg-card border border-border p-6 shadow-sm min-h-[500px]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-red-500 mb-2">Failed to load products</div>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={fetchProducts} className="mt-4 border-border">Retry</Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse">Loading products...</p>
          </div>
        ) : (
          <ProductTable 
            data={products} 
            onView={handleView}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
