//@ts-nocheck
import { useState, useEffect } from "react";
import { EmployeeTable } from "../components/EmployeeTable";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeService } from "../services/employee.service";
import { Employee } from "../types/employee";
import { Plus, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { DeleteEmployeeDialog } from "../components/DeleteEmployeeDialog";
import { DeactivateEmployeeDialog } from "../components/DeactivateEmployeeDialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSettings } from '@/hooks/useSettings';

export default function EmployeeListPage() {
  const { currency } = useSettings();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const roleBase = `/${currentUser?.role?.toLowerCase() || 'owner'}`;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmployeeService.getEmployees();
      const filteredData = data.filter((e: Employee) => 
        e.position?.toLowerCase() !== 'system owner' && 
        e.role?.toLowerCase() !== 'owner'
      );
      setEmployees(filteredData);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ---- CRUD handlers ----

  const handleView = (emp: Employee) => {
    navigate(`${roleBase}/employees/${emp.id}`);
  };

  const handleEdit = (emp: Employee) => {
    navigate(`${roleBase}/employees/${emp.id}/edit`);
  };

  const handleAddNew = () => {
    navigate(`${roleBase}/employees/new`);
  };

  const handleDeactivate = (emp: Employee) => {
    setDeactivateTarget(emp);
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    await EmployeeService.updateEmployee(deactivateTarget.id, { status: "Suspended" } as any);
    setDeactivateTarget(null);
    fetchEmployees();
  };

  const handleDelete = (emp: Employee) => {
    setDeleteTarget(emp);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await EmployeeService.deleteEmployee(deleteTarget.id);
    setDeleteTarget(null);
    fetchEmployees();
  };

  const handleExport = () => {
    const doc = new jsPDF("landscape");
    doc.text("Omnitrack - Employee List", 14, 15);
    
    const headers = [["Employee ID", "First Name", "Last Name", "Position", "Department", "Status", "Phone", "Salary", "Hire Date"]];
    const data = employees.map(e => [
      e.employeeNumber || 'N/A', 
      e.firstName, 
      e.lastName, 
      e.position, 
      e.department,
      e.status, 
      e.phoneNumber, 
      `${e.salary} ${currency}`,
      new Date(e.hireDate).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 95, 70] } // Emerald green header
    });
    
    doc.save(`employees_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full h-full omni-animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant staff, access, and roles.
            {!loading && <span className="ml-2 text-xs">({employees.length} total)</span>}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={fetchEmployees}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" className="border-border" onClick={handleExport} disabled={employees.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
          {error}
          <Button variant="link" className="ml-2 text-destructive underline p-0 h-auto" onClick={fetchEmployees}>
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4 w-full">
            <Skeleton className="h-10 w-full rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <EmployeeTable
            data={employees}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Dialogs */}
      <DeleteEmployeeDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        employee={deleteTarget}
        onConfirm={confirmDelete}
      />
      <DeactivateEmployeeDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        employee={deactivateTarget}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
