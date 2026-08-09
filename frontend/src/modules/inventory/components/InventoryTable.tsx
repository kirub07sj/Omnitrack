import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { InventoryItem } from "../types/inventory";

interface InventoryTableProps {
  data: InventoryItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InventoryTable({ data, onEdit, onDelete }: InventoryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Min. Qty</TableHead>
            <TableHead>Cost/Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No inventory found.</TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.quantity}
                    {Number(item.quantity) <= Number(item.minimum_quantity) ? (
                      <Badge variant="destructive" className="flex items-center gap-1 h-5 px-1.5 text-[10px] bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </Badge>
                    ) : Number(item.quantity) <= Number(item.minimum_quantity) * 1.25 + 5 ? (
                      <Badge variant="outline" className="flex items-center gap-1 h-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{item.minimum_quantity}</TableCell>
                <TableCell>${Number(item.cost_per_unit).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
