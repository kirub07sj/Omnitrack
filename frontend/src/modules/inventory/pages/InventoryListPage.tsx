import { useEffect, useState } from "react";
import { InventoryItem } from "../types/inventory";
import { InventoryService } from "../services/inventory.service";
import { InventoryTable } from "../components/InventoryTable";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSettings } from '@/hooks/useSettings';

export default function InventoryListPage() {
  const { currency } = useSettings();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [items, purchData, moveData] = await Promise.all([
        InventoryService.getInventory(),
        InventoryService.getPurchases(),
        InventoryService.getMovements()
      ]);
      setData(items || []);
      setPurchases(purchData || []);
      setMovements(moveData || []);
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

  const handleTogglePurchaseStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
      await InventoryService.updatePurchaseStatus(id, newStatus);
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 omni-animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock, view purchases, and track movements.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/owner/suppliers/new")}>
            <Truck className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
          <Button onClick={() => navigate("/owner/inventory/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Purchase
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
          <TabsTrigger value="movements">Stock Movement</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="pt-2">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <InventoryTable 
              data={data} 
              onEdit={(id) => navigate(`/owner/inventory/${id}/edit`)}
              onDelete={handleDeleteClick}
            />
          )}
        </TabsContent>

        <TabsContent value="purchases" className="pt-2">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : purchases.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No purchases found.</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{format(new Date(p.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{p.supplier?.name || 'Unknown'}</TableCell>
                      <TableCell>{p.items?.length || 0} items</TableCell>
                      <TableCell className="font-bold">{parseFloat(p.total).toLocaleString()} {currency}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'Paid' ? 'default' : 'secondary'} className={p.status === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                          {p.status || 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedPurchase(p)}>
                              <FileText className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePurchaseStatus(p.id, p.status || 'Unpaid')}>
                              <CheckCircle className="mr-2 h-4 w-4" /> 
                              Mark as {p.status === 'Paid' ? 'Unpaid' : 'Paid'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="pt-2">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No stock movements found.</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{format(new Date(m.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{m.inventory_item?.name || 'Unknown Item'}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${m.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {m.type === 'IN' ? '+ IN' : '- OUT'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">{parseFloat(m.quantity)} {m.inventory_item?.unit || 'units'}</TableCell>
                      <TableCell className="text-muted-foreground">{m.reference_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemType="inventory item"
        itemName={data.find(i => i.id === itemToDelete)?.name}
      />

      <Dialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              {selectedPurchase && format(new Date(selectedPurchase.created_at), 'MMM dd, yyyy')} - {selectedPurchase?.supplier?.name || 'Unknown Supplier'}
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.inventory_item?.name || 'Unknown'}</TableCell>
                        <TableCell>{item.quantity} {item.inventory_item?.unit || ''}</TableCell>
                        <TableCell>{parseFloat(item.cost).toLocaleString()} {currency}</TableCell>
                        <TableCell className="text-right font-medium">
                          {(parseFloat(item.quantity) * parseFloat(item.cost)).toLocaleString()} {currency}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-muted/50">
                <div className="font-medium">Status: <Badge variant={selectedPurchase.status === 'Paid' ? 'default' : 'secondary'} className={selectedPurchase.status === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>{selectedPurchase.status || 'Unpaid'}</Badge></div>
                <div className="text-2xl font-black text-primary">Total: {parseFloat(selectedPurchase.total).toLocaleString()} {currency}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
