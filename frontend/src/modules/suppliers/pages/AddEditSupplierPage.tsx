import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SupplierForm } from "../components/SupplierForm";
import { SupplierService } from "../services/supplier.service";
import { Supplier } from "../types/supplier";
import { SupplierFormValues } from "../schemas/supplier.schema";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddEditSupplierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Supplier | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit && id) {
      SupplierService.getSupplierById(id).then(setInitialData);
    }
  }, [id, isEdit]);

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      setIsLoading(true);
      if (isEdit && id) {
        await SupplierService.updateSupplier(id, values);
      } else {
        await SupplierService.createSupplier(values);
      }
      navigate("/owner/suppliers");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/owner/suppliers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Supplier" : "Add Supplier"}
          </h1>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <SupplierForm 
          initialData={initialData} 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
