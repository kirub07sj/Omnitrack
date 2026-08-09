import { useEffect, useState } from "react";
import { Supplier } from "../types/supplier";
import { SupplierService } from "../services/supplier.service";
import { SupplierTable } from "../components/SupplierTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function SupplierListPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const items = await SupplierService.getSuppliers();
      setData(items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await SupplierService.deleteSupplier(itemToDelete);
    await loadData();
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers.</p>
        </div>
        <Button onClick={() => navigate("/owner/suppliers/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <SupplierTable 
          data={data} 
          onView={(id) => navigate(`/owner/suppliers/${id}`)}
          onEdit={(id) => navigate(`/owner/suppliers/${id}/edit`)}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemType="supplier"
        itemName={data.find(s => s.id === itemToDelete)?.name}
      />
    </div>
  );
}
