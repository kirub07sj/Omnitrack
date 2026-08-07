//@ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { ProductService } from "../services/product.service";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // const data = await ProductService.getProductById(id!);
        // setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full omni-animate-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
        </div>
        <Button onClick={() => navigate(`edit`)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Edit className="mr-2 h-4 w-4" /> Edit Product
        </Button>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <p className="text-muted-foreground">Product Details tabs will go here (Overview, Inventory, Sales History).</p>
      </div>
    </div>
  );
}
