"use client";

import { FileUp, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { StatusBadge } from "@/components/design-system/badges/status-badge";
import { notify } from "@/components/design-system/notifications/toast";
import { OverlayFooter } from "@/components/design-system/overlays/overlay-footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useValidatedForm } from "@/lib/design-system/form-helpers";
import { typography } from "@/lib/design-system/typography";
import { createTransactionAction } from "@/features/transactions/actions/create-transaction";
import {
  formValuesToCreateInput,
  newTransactionFormSchema,
  type NewTransactionFormValues,
} from "@/features/transactions/schemas/new-transaction-schema";
import type { UserDto } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

import {
  getManualStepFields,
  manualStepLabels,
  WizardManualForm,
  WizardProgress,
} from "./wizard-manual-form";

type WizardScreen = "entry" | "upload-prompt" | "manual";

type NewTransactionWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: UserDto[];
};

function getDefaultValues(agents: UserDto[]): NewTransactionFormValues {
  return {
    transactionType: "buyer",
    propertyAddress: "",
    city: "",
    state: "",
    zip: "",
    buyerNames: "",
    sellerNames: "",
    assignedUserId: agents[0]?.id ?? "",
    purchasePrice: "",
    contractDate: "",
    closingDate: "",
    earnestMoneyAmount: "",
    earnestMoneyHeldBy: undefined,
    earnestMoneyHolderName: "",
  };
}

function EntryOptionCard({
  title,
  description,
  icon: Icon,
  badge,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        {badge ? <StatusBadge label={badge} variant="success" /> : null}
      </div>
      <h3 className={cn(typography.sectionTitle, "mt-4")}>{title}</h3>
      <p className={cn(typography.bodyMuted, "mt-2")}>{description}</p>
    </button>
  );
}

export function NewTransactionWizard({
  open,
  onOpenChange,
  agents,
}: NewTransactionWizardProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<WizardScreen>("entry");
  const [manualStep, setManualStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useValidatedForm(newTransactionFormSchema, {
    defaultValues: getDefaultValues(agents),
  });

  const resetWizard = () => {
    setScreen("entry");
    setManualStep(1);
    form.reset(getDefaultValues(agents));
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetWizard();
    }

    onOpenChange(nextOpen);
  };

  const startManualWizard = () => {
    setScreen("manual");
    setManualStep(1);
  };

  const handleBack = () => {
    if (screen === "manual" && manualStep > 1) {
      setManualStep((step) => step - 1);
      return;
    }

    if (screen === "upload-prompt" || screen === "manual") {
      setScreen("entry");
      setManualStep(1);
    }
  };

  const handleNext = async () => {
    const fields = getManualStepFields(manualStep);
    const isValid = fields.length ? await form.trigger(fields) : true;

    if (!isValid) {
      return;
    }

    setManualStep((step) => Math.min(step + 1, manualStepLabels.length));
  };

  const handleCreate = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input = formValuesToCreateInput(form.getValues());
      const result = await createTransactionAction(input);

      notify.success(
        "Transaction created",
        "Opening the new transaction workspace.",
      );
      handleOpenChange(false);
      router.push(`/transactions/${result.id}`);
    } catch {
      notify.error(
        "Could not create transaction",
        "Please check your entries and try again.",
      );
      setIsSubmitting(false);
    }
  };

  const showBackButton = screen !== "entry";
  const dialogTitle =
    screen === "entry"
      ? "How would you like to create this transaction?"
      : screen === "upload-prompt"
        ? "Upload Purchase Agreement"
        : `New Transaction · ${manualStepLabels[manualStep - 1]}`;

  const dialogDescription =
    screen === "entry"
      ? "Choose the fastest path to get a new deal into your workspace."
      : screen === "upload-prompt"
        ? "Document upload and AI extraction are not available yet."
        : "Complete each step to create a transaction and open its workspace.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4 text-left">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {screen === "entry" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <EntryOptionCard
                title="Upload Purchase Agreement"
                description="Upload a contract and let AI extract the deal details for you."
                icon={FileUp}
                badge="Recommended"
                onClick={() => setScreen("upload-prompt")}
              />
              <EntryOptionCard
                title="Create Manually"
                description="Enter transaction details step by step."
                icon={PenLine}
                onClick={startManualWizard}
              />
            </div>
          ) : null}

          {screen === "upload-prompt" ? (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-5">
              <p className={typography.body}>
                AI document extraction is coming soon. Continue with manual entry
                for now?
              </p>
              <PrimaryButton
                type="button"
                className="w-full sm:w-auto"
                onClick={startManualWizard}
              >
                Continue Manually
              </PrimaryButton>
            </div>
          ) : null}

          {screen === "manual" ? (
            <div className="space-y-6">
              <WizardProgress step={manualStep} />
              <WizardManualForm step={manualStep} form={form} agents={agents} />
            </div>
          ) : null}
        </div>

        {screen === "manual" ? (
          <OverlayFooter className="sm:justify-between">
            <SecondaryButton
              type="button"
              className="w-full sm:w-auto"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </SecondaryButton>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {manualStep < manualStepLabels.length ? (
                <PrimaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleNext}
                >
                  Continue
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Transaction"}
                </PrimaryButton>
              )}
            </div>
          </OverlayFooter>
        ) : showBackButton ? (
          <OverlayFooter>
            <SecondaryButton
              type="button"
              className="w-full sm:w-auto"
              onClick={handleBack}
            >
              Back
            </SecondaryButton>
          </OverlayFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
