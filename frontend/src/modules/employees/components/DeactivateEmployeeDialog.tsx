import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee } from "../types/employee";
import { Loader2, UserX } from "lucide-react";

export interface DeactivateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => Promise<void>;
}

export function DeactivateEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
}: DeactivateEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (error) {
      console.error("Failed to deactivate employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`.trim()
    : "this employee";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <UserX className="h-5 w-5 text-amber-500" />
            Deactivate Employee
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">{employeeName}</span>? They will no longer be able to log in.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium focus-visible:ring-amber-500"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
