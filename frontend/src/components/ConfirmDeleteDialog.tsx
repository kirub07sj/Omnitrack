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
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void>;
  itemType?: string;
  itemName?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  itemType = "item",
  itemName,
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "An error occurred while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const nameDisplay = itemName ? <span className="font-semibold text-foreground">{itemName}</span> : `this ${itemType}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <span>{title || `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-3 pl-[52px]">
            {description ? (
              description
            ) : (
              <>
                Are you sure you want to delete {nameDisplay}? This action is permanent and cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 text-sm flex items-start gap-2 ml-[52px]">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              onOpenChange(false);
            }}
            disabled={loading}
            className="border-border text-foreground hover:bg-muted transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
