//@ts-nocheck
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Employee } from "../types/employee";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, UserX, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: Employee[];
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDeactivate: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export function EmployeeTable({ data, onView, onEdit, onDeactivate, onDelete }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "firstName",
      header: "Employee",
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="flex items-center gap-3">
            <EmployeeAvatar firstName={emp.firstName} lastName={emp.lastName} url={emp.avatarUrl} />
            <div className="flex flex-col">
              <span className="font-medium text-card-foreground">{emp.firstName} {emp.lastName}</span>
              <span className="text-xs text-muted-foreground">{emp.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeNumber",
      header: "ID",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("employeeNumber")}</span>
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <span className="text-card-foreground">{row.getValue("position")}</span>
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("department")}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <EmployeeStatusBadge status={row.getValue("status")} />
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(emp)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(emp)}><Edit className="mr-2 h-4 w-4" /> Edit Employee</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeactivate(emp)}><UserX className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(emp)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter employees..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("firstName")?.setFilterValue(event.target.value)}
          className="max-w-sm bg-background border-border"
        />
        <div className="flex gap-2">
          <Select
            value={(table.getColumn("department")?.getFilterValue() as string) ?? "all"}
            onValueChange={(val) => table.getColumn("department")?.setFilterValue(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-[180px] bg-background border-border">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Kitchen">Kitchen</SelectItem>
              <SelectItem value="Front of House">Front of House</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-border hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-border"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-border"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
