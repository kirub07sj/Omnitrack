//@ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployeeForm } from "../components/EmployeeForm";
import { EmployeeService } from "../services/employee.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Employee } from "../types/employee";
import { EmployeeFormData } from "../schemas/employee.schema";

export default function AddEditEmployeePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialData, setInitialData] = useState<Employee | null>(null);
  const [fetching, setFetching] = useState<boolean>(isEdit);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setFetching(true);
      EmployeeService.getEmployeeById(id)
        .then((data) => {
          if (data) {
            setInitialData(data);
          } else {
            setError("Employee not found");
          }
        })
        .catch((err) => {
          console.error("Error fetching employee:", err);
          setError("Failed to load employee details");
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await EmployeeService.updateEmployee(id, data);
        console.log("Employee updated successfully:", data);
      } else {
        await EmployeeService.createEmployee(data);
        console.log("Employee created successfully:", data);
      }
      navigate(-1);
    } catch (err) {
      console.error("Failed to save employee:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center p-8">
        <h2 className="text-2xl font-bold text-foreground">{error}</h2>
        <p className="text-muted-foreground mt-2 mb-6">The employee details could not be retrieved.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full h-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to add/update an employee.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <EmployeeForm
          initialData={initialData || undefined}
          onSubmit={handleSubmit}
          isLoading={submitting}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
