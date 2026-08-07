import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Supplier } from "../types/supplier";
import { SupplierService } from "../services/supplier.service";
import { InventoryService } from "../../inventory/services/inventory.service";
import { InventoryItem } from "../../inventory/types/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, MapPin, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const supplierData = await SupplierService.getSupplierById(id);
        if (supplierData) {
          setSupplier(supplierData);
        }
        
        // Fetch inventory and filter by supplier_id to simulate purchase history
        const inventoryData = await InventoryService.getInventory();
        const suppliedItems = (inventoryData || []).filter(item => item.supplier_id === id);
        setPurchasedItems(suppliedItems);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  if (isLoading) {
    return <div className="p-6 max-w-7xl mx-auto text-foreground">Loading...</div>;
  }

  if (!supplier) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-foreground">
        <p>Supplier not found.</p>
        <Button variant="link" className="text-primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 omni-animate-in">
      <div className="flex items-center gap-4 omni-stagger-1">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="bg-card border-border hover:bg-muted text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{supplier.name}</h1>
          <p className="text-muted-foreground">Supplier Details & Purchase History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 omni-stagger-2">
        <Card className="bg-card border-border omni-card-hover md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>{supplier.phone || "No phone provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>{supplier.email || "No email provided"}</span>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary mt-1" />
              <span>{supplier.address || "No address provided"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border omni-card-hover md:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> 
              Purchased Items History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Current Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No items have been purchased from this supplier yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchasedItems.map(item => (
                      <TableRow key={item.id} className="border-border/50 hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell className="text-muted-foreground">${Number(item.cost_per_unit).toFixed(2)} / {item.unit}</TableCell>
                        <TableCell className="text-muted-foreground">{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
