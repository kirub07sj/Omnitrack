//@ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductForm } from "../components/ProductForm";
import { ProductService } from "../services/product.service";
import { CategoryService } from "../services/category.service";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialData, setInitialData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories first
        const cats = await CategoryService.getCategories();
        setCategories(cats);

        if (isEdit) {
          const prod = await ProductService.getProductById(id!);
          setInitialData(prod);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await ProductService.updateProduct(id!, data);
      } else {
        await ProductService.createProduct(data);
      }
      navigate(-1);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update product details and pricing." : "Fill in the details below to add a new product."}
          </p>
        </div>
      </div>

      <ProductForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={submitting}
        onCancel={() => navigate(-1)}
        categories={categories}
      />
    </div>
  );
}
