import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Supplier } from "../types/supplier";

interface SupplierTableProps {
  data: Supplier[];
  onView?: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SupplierTable({ data, onView, onEdit, onDelete }: SupplierTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No suppliers found.</TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell className="text-right">
                  {onView && (
                    <Button variant="ghost" size="icon" onClick={() => onView(item.id)}>
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                  )}
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
