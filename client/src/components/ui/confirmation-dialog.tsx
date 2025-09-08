import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { Button } from "../ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

const ConfirmationDialog = ({
  isOpen,
  setIsOpen,
  title,
  description,
  onConfirm,
  confirmText = "Yes",
  cancelText = "Cancel",
  isLoading = false,
  variant = "destructive",
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setIsOpen(false)}
          >
            {cancelText}
          </Button>
          <Button
            className={
              variant === "destructive"
                ? "text-white !bg-red-500"
                : "text-white"
            }
            disabled={isLoading}
            type="button"
            onClick={handleConfirm}
          >
            {isLoading && <Loader className="animate-spin mr-2 h-4 w-4" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
