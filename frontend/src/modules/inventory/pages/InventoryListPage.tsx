import { useEffect, useState } from "react";
import { InventoryItem } from "../types/inventory";
import { InventoryService } from "../services/inventory.service";
import { InventoryTable } from "../components/InventoryTable";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function InventoryListPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const items = await InventoryService.getInventory();
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
    await InventoryService.deleteInventory(itemToDelete);
    await loadData();
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 omni-animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory items.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/owner/suppliers/new")}>
            <Truck className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
          <Button onClick={() => navigate("/owner/inventory/new")}>
            <Plus className="mr-2 h-4 w-4" /> Purchase Items
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <InventoryTable 
          data={data} 
          onEdit={(id) => navigate(`/owner/inventory/${id}/edit`)}
          onDelete={handleDeleteClick}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemType="inventory item"
        itemName={data.find(i => i.id === itemToDelete)?.name}
      />
    </div>
  );
}
