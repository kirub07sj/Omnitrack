import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InventoryForm } from "../components/InventoryForm";
import { InventoryService } from "../services/inventory.service";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { InventoryItem } from "../types/inventory";
import { Supplier } from "../../suppliers/types/supplier";
import { InventoryFormValues } from "../schemas/inventory.schema";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddEditInventoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<InventoryItem | undefined>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    SupplierService.getSuppliers().then(setSuppliers);
    if (isEdit && id) {
      InventoryService.getInventoryById(id).then(setInitialData);
    }
  }, [id, isEdit]);

  const onSubmit = async (values: InventoryFormValues) => {
    try {
      setIsLoading(true);
      if (isEdit && id) {
        await InventoryService.updateInventory(id, values);
      } else {
        await InventoryService.createInventory(values);
      }
      navigate("/owner/inventory");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 omni-animate-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/owner/inventory")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
          </h1>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <InventoryForm 
          initialData={initialData} 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
          suppliers={suppliers}
        />
      </div>
    </div>
  );
}
