import { useState, useEffect } from "react";
import { EmployeeTable } from "../components/EmployeeTable";
import { EmployeeService } from "../services/employee.service";
import { Employee } from "../types/employee";
import { Plus, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleView = (emp: Employee) => {
    navigate(`/${currentUser?.role?.toLowerCase() || 'owner'}/employees/${emp.id}`);
  };
  
  const handleEdit = (emp: Employee) => {
    console.log("Edit", emp);
  };

  const handleDeactivate = (emp: Employee) => {
    console.log("Deactivate", emp);
  };

  const handleDelete = (emp: Employee) => {
    console.log("Delete", emp);
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full h-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant staff, access, and roles.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={fetchEmployees}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}
