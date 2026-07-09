"use client";

import { PenLine, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { StatusBadge } from "@/components/design-system/badges/status-badge";
import { notify } from "@/components/design-system/notifications/toast";
import {
  ModalFooter,
  ModalFooterActions,
} from "@/components/design-system/overlays/modal-footer";
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
import { getItiConfigAction } from "@/features/transactions/actions/get-iti-config";
import { importTransactionAction } from "@/features/transactions/actions/import-transaction";
import {
  runItiExtractionAction,
  type RunItiResult,
} from "@/features/transactions/actions/run-iti-extraction";
import {
  extractionToReviewDefaults,
  importReviewSchema,
} from "@/features/transactions/schemas/import-transaction-schema";
import {
  formValuesToCreateInput,
  newTransactionFormSchema,
  type NewTransactionFormValues,
} from "@/features/transactions/schemas/new-transaction-schema";
import type { UserDto } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

import { IntelligentImportReview } from "./intelligent-import-review";
import {
  ItiUploadPanel,
  updateItiFileStatuses,
  type ItiUploadFile,
} from "./iti-upload-panel";
import {
  getManualStepFields,
  manualStepLabels,
  WizardManualForm,
  WizardProgress,
} from "./wizard-manual-form";

type WizardScreen =
  | "entry"
  | "import-upload"
  | "import-extracting"
  | "import-review"
  | "manual";

type NewTransactionWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: UserDto[];
  initialScreen?: "entry" | "iti";
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
  initialScreen = "entry",
}: NewTransactionWizardProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<WizardScreen>(
    initialScreen === "iti" ? "import-upload" : "entry",
  );
  const [manualStep, setManualStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [itiSetupError, setItiSetupError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<RunItiResult | null>(null);
  const [importAsArchived, setImportAsArchived] = useState(false);
  const [itiFiles, setItiFiles] = useState<ItiUploadFile[]>([]);

  const form = useValidatedForm(newTransactionFormSchema, {
    defaultValues: getDefaultValues(agents),
  });

  const importForm = useValidatedForm(importReviewSchema, {
    defaultValues: extractionToReviewDefaults(
      {
        transaction: {
          propertyAddress: { value: "", confidence: "missing" },
          city: { value: "", confidence: "missing" },
          state: { value: "", confidence: "missing" },
          zip: { value: "", confidence: "missing" },
          purchasePrice: { value: null, confidence: "missing" },
          contractDate: { value: null, confidence: "missing" },
          closingDate: { value: null, confidence: "missing" },
          transactionType: { value: "buyer", confidence: "missing" },
          transactionStatus: { value: null, confidence: "missing" },
          mlsNumber: { value: null, confidence: "missing" },
          specialTerms: { value: null, confidence: "missing" },
        },
        parties: {
          buyerNames: { value: null, confidence: "missing" },
          sellerNames: { value: null, confidence: "missing" },
          listingAgent: { value: null, confidence: "missing" },
          sellingAgent: { value: null, confidence: "missing" },
          listingBrokerage: { value: null, confidence: "missing" },
          sellingBrokerage: { value: null, confidence: "missing" },
        },
        money: {
          earnestMoneyAmount: { value: null, confidence: "missing" },
          earnestMoneyHeldBy: { value: null, confidence: "missing" },
          earnestMoneyHolderName: { value: null, confidence: "missing" },
          sellerConcessions: { value: null, confidence: "missing" },
          commission: { value: null, confidence: "missing" },
        },
        deadlines: {
          inspectionDeadline: { value: null, confidence: "missing" },
          financingDeadline: { value: null, confidence: "missing" },
          appraisalDeadline: { value: null, confidence: "missing" },
          earnestMoneyDueDate: { value: null, confidence: "missing" },
          contingencyDeadline: { value: null, confidence: "missing" },
          walkthroughDate: { value: null, confidence: "missing" },
          closingDate: { value: null, confidence: "missing" },
        },
        serviceProviders: {
          lender: { value: null, confidence: "missing" },
          titleCompany: { value: null, confidence: "missing" },
          closingCompany: { value: null, confidence: "missing" },
          attorney: { value: null, confidence: "missing" },
          inspector: { value: null, confidence: "missing" },
        },
        documents: [],
        archiveCandidate: {
          isCandidate: false,
          reasons: [],
          suggestedImportMode: "active",
        },
        overallConfidence: 0,
        provider: "mock",
      },
      agents[0]?.id ?? "",
    ),
  });

  useEffect(() => {
    if (open) {
      void getItiConfigAction().then((config) => {
        setItiSetupError(config.isConfigured ? null : config.setupMessage ?? null);
      });
    }
  }, [open]);

  const resetWizard = useCallback(() => {
    setScreen(initialScreen === "iti" ? "import-upload" : "entry");
    setManualStep(1);
    setImportError(null);
    setImportResult(null);
    setImportAsArchived(false);
    setItiFiles([]);
    form.reset(getDefaultValues(agents));
    setIsSubmitting(false);
  }, [agents, form, initialScreen]);

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

    if (screen === "import-review") {
      setScreen("import-upload");
      setItiFiles(updateItiFileStatuses(itiFiles, "waiting"));
      return;
    }

    if (screen === "import-upload" || screen === "manual") {
      setScreen("entry");
      setManualStep(1);
    }
  };

  const handleRunIti = async () => {
    if (!itiFiles.length) {
      setImportError("Add at least one document before running ITI.");
      return;
    }

    setImportError(null);
    setIsSubmitting(true);
    setItiFiles(updateItiFileStatuses(itiFiles, "uploading"));
    setScreen("import-extracting");

    const formData = new FormData();
    itiFiles.forEach((entry) => {
      formData.append("documents", entry.file);
    });

    try {
      setItiFiles(updateItiFileStatuses(itiFiles, "processing"));
      const result = await runItiExtractionAction(formData);
      setImportResult(result);
      setImportAsArchived(
        result.extraction.archiveCandidate.suggestedImportMode === "archived",
      );
      importForm.reset(extractionToReviewDefaults(result.extraction, agents[0]?.id ?? ""));

      setItiFiles(updateItiFileStatuses(itiFiles, "review_suggested"));

      if (result.setupMessage && !itiSetupError) {
        notify.info("ITI setup", result.setupMessage);
      }

      setScreen("import-review");
    } catch (error) {
      setItiFiles(updateItiFileStatuses(itiFiles, "failed"));
      setImportError(
        error instanceof Error
          ? error.message
          : "ITI extraction failed. Retry or continue manually.",
      );
      setScreen("import-upload");
      notify.error("ITI failed", "Review your files or continue with manual entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importResult) {
      return;
    }

    const isValid = await importForm.trigger();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await importTransactionAction({
        review: importForm.getValues(),
        documentIds: importResult.documentIds,
        extractionId: importResult.extractionId,
        importAsArchived,
      });

      notify.success(
        "Transaction imported successfully",
        "Opening the new transaction workspace.",
      );
      handleOpenChange(false);
      router.push(`/transactions/${result.id}`);
    } catch {
      notify.error("Could not import transaction", "Please review the fields and try again.");
      setIsSubmitting(false);
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
      notify.success("Transaction created", "Opening the new transaction workspace.");
      handleOpenChange(false);
      router.push(`/transactions/${result.id}`);
    } catch {
      notify.error("Could not create transaction", "Please check your entries and try again.");
      setIsSubmitting(false);
    }
  };

  const dialogTitle =
    screen === "entry"
      ? "How would you like to create this transaction?"
      : screen === "import-upload" || screen === "import-extracting"
        ? "Intelligent Transaction Import"
        : screen === "import-review"
          ? "Review Import"
          : `New Transaction · ${manualStepLabels[manualStep - 1]}`;

  const dialogDescription =
    screen === "entry"
      ? "Choose the fastest path to get a new deal into your workspace."
      : screen === "import-upload"
        ? "Upload your transaction documents and let ITI extract the key transaction details."
        : screen === "import-extracting"
          ? "ITI is reading your documents and extracting key fields."
          : screen === "import-review"
            ? "Review and edit extracted values before creating the workspace."
            : "Complete each step to create a transaction and open its workspace.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4 text-left sm:px-6">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {screen === "entry" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <EntryOptionCard
                title="Intelligent Transaction Import"
                description="Upload a Purchase Agreement and supporting documents. ITI will extract transaction details."
                icon={Sparkles}
                badge="Recommended"
                onClick={() => setScreen("import-upload")}
              />
              <EntryOptionCard
                title="Create Manually"
                description="Enter transaction details step by step."
                icon={PenLine}
                onClick={startManualWizard}
              />
            </div>
          ) : null}

          {screen === "import-upload" ? (
            <ItiUploadPanel
              files={itiFiles}
              onFilesChange={setItiFiles}
              setupError={itiSetupError}
              extractionError={importError}
            />
          ) : null}

          {screen === "import-extracting" ? (
            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-5">
              <p className={typography.body}>ITI is analyzing your documents...</p>
              <p className={typography.bodyMuted}>
                This may take a moment depending on file size and AI provider availability.
              </p>
            </div>
          ) : null}

          {screen === "import-review" && importResult ? (
            <IntelligentImportReview
              form={importForm}
              extraction={importResult.extraction}
              agents={agents}
              importAsArchived={importAsArchived}
              onImportModeChange={setImportAsArchived}
            />
          ) : null}

          {screen === "manual" ? (
            <div className="space-y-6">
              <WizardProgress step={manualStep} />
              <WizardManualForm step={manualStep} form={form} agents={agents} />
            </div>
          ) : null}
        </div>

        {screen === "import-upload" ? (
          <ModalFooter>
            <ModalFooterActions
              secondaryAction={
                <SecondaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </SecondaryButton>
              }
              primaryAction={
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <SecondaryButton
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={startManualWizard}
                    disabled={isSubmitting}
                  >
                    Continue Manually
                  </SecondaryButton>
                  <PrimaryButton
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={handleRunIti}
                    disabled={!itiFiles.length || isSubmitting}
                  >
                    Run ITI
                  </PrimaryButton>
                </div>
              }
            />
          </ModalFooter>
        ) : null}

        {screen === "import-review" ? (
          <ModalFooter>
            <ModalFooterActions
              secondaryAction={
                <SecondaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </SecondaryButton>
              }
              primaryAction={
                <PrimaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleImportConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Importing..." : "Create Transaction"}
                </PrimaryButton>
              }
            />
          </ModalFooter>
        ) : null}

        {screen === "manual" ? (
          <ModalFooter>
            <ModalFooterActions
              secondaryAction={
                <SecondaryButton
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </SecondaryButton>
              }
              primaryAction={
                manualStep < manualStepLabels.length ? (
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
                )
              }
            />
          </ModalFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
