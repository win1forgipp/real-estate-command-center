"use client";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ActionFormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ActionFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/70 px-5 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ActionFormFooter({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
      <SecondaryButton
        type="button"
        className="w-full sm:w-auto"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </SecondaryButton>
      <PrimaryButton
        type="button"
        className="w-full sm:w-auto"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </div>
  );
}
