"use client";

import {
  DestructiveButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { ModalFooterActions } from "@/components/design-system/overlays/modal-footer";
import { Modal } from "@/components/design-system/overlays/modal";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export function DeleteDialog({
  open,
  onOpenChange,
  title = "Delete item",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <ModalFooterActions
          secondaryAction={
            <SecondaryButton
              type="button"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </SecondaryButton>
          }
          primaryAction={
            <DestructiveButton
              type="button"
              className="w-full sm:w-auto"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </DestructiveButton>
          }
        />
      }
    />
  );
}
