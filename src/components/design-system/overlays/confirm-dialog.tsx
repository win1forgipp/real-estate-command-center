"use client";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { ModalFooterActions } from "@/components/design-system/overlays/modal-footer";
import { Modal } from "@/components/design-system/overlays/modal";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
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
            <PrimaryButton
              type="button"
              className="w-full sm:w-auto"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </PrimaryButton>
          }
        />
      }
    />
  );
}
