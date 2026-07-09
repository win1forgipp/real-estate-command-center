"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { ConfidenceBadge } from "@/features/transactions/components/new-transaction-wizard/confidence-badge";
import { StatusBadge } from "@/components/design-system/badges/status-badge";
import { CurrencyInput } from "@/components/design-system/forms/currency-input";
import { DatePickerInput } from "@/components/design-system/forms/date-picker-input";
import { DropdownInput } from "@/components/design-system/forms/dropdown-input";
import { TextInput } from "@/components/design-system/forms/text-input";
import { TextareaInput } from "@/components/design-system/forms/textarea-input";
import { typography } from "@/lib/design-system/typography";
import type { ImportReviewInput } from "@/features/transactions/schemas/import-transaction-schema";
import { parseCurrencyValue } from "@/features/transactions/schemas/new-transaction-schema";
import type { ItiConfidenceLevel, ItiExtractionResult } from "@/services/iti/types";
import type { UserDto } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

type IntelligentImportReviewProps = {
  form: UseFormReturn<ImportReviewInput>;
  extraction: ItiExtractionResult;
  agents: UserDto[];
  importAsArchived: boolean;
  onImportModeChange: (archived: boolean) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h3 className={typography.sectionTitle}>{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function FieldRow({
  confidence,
  children,
}: {
  confidence?: ItiConfidenceLevel;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {confidence ? (
        <div className="flex justify-end">
          <ConfidenceBadge level={confidence} />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function IntelligentImportReview({
  form,
  extraction,
  agents,
  importAsArchived,
  onImportModeChange,
}: IntelligentImportReviewProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      {extraction.setupMessage ? (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {extraction.setupMessage}
        </p>
      ) : null}

      {extraction.archiveCandidate.isCandidate ? (
        <section className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <h3 className={typography.sectionTitle}>Archive Decision</h3>
          <p className={cn(typography.bodyMuted, "mt-2")}>
            This transaction appears to be closed or historical.
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            {extraction.archiveCandidate.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="importMode"
                checked={importAsArchived}
                onChange={() => onImportModeChange(true)}
              />
              Import as Archived Transaction
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="importMode"
                checked={!importAsArchived}
                onChange={() => onImportModeChange(false)}
              />
              Import as Active Transaction
            </label>
          </div>
        </section>
      ) : null}

      <Section title="Transaction Details">
        <FieldRow confidence={extraction.transaction.propertyAddress.confidence}>
          <TextInput label="Property Address" {...register("propertyAddress")} error={errors.propertyAddress?.message} />
        </FieldRow>
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldRow confidence={extraction.transaction.city.confidence}>
            <TextInput label="City" {...register("city")} error={errors.city?.message} />
          </FieldRow>
          <FieldRow confidence={extraction.transaction.state.confidence}>
            <TextInput label="State" {...register("state")} maxLength={2} error={errors.state?.message} />
          </FieldRow>
          <FieldRow confidence={extraction.transaction.zip.confidence}>
            <TextInput label="ZIP" {...register("zip")} error={errors.zip?.message} />
          </FieldRow>
        </div>
        <FieldRow confidence={extraction.transaction.mlsNumber.confidence}>
          <TextInput label="MLS Number" {...register("mlsNumber")} />
        </FieldRow>
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerInput label="Contract Date" {...register("contractDate")} />
          <DatePickerInput label="Closing Date" {...register("closingDate")} />
        </div>
        <Controller
          name="purchasePrice"
          control={control}
          render={({ field }) => (
            <FieldRow confidence={extraction.transaction.purchasePrice.confidence}>
              <CurrencyInput
                label="Purchase Price"
                value={field.value?.toString() ?? ""}
                onChange={(value) => field.onChange(parseCurrencyValue(value))}
              />
            </FieldRow>
          )}
        />
        <FieldRow confidence={extraction.transaction.specialTerms.confidence}>
          <TextareaInput label="Special Terms" {...register("specialTerms")} />
        </FieldRow>
        <Controller
          name="transactionType"
          control={control}
          render={({ field }) => (
            <DropdownInput
              label="Transaction Type"
              value={field.value}
              onValueChange={field.onChange}
              options={[
                { label: "Buyer Representation", value: "buyer" },
                { label: "Seller Listing", value: "seller" },
                { label: "Dual Agency", value: "dual" },
              ]}
            />
          )}
        />
        <Controller
          name="transactionStatus"
          control={control}
          render={({ field }) => (
            <DropdownInput
              label="Status"
              value={field.value ?? ""}
              onValueChange={field.onChange}
              options={[
                { label: "Prospect", value: "prospect" },
                { label: "Under Contract", value: "under_contract" },
                { label: "Inspection", value: "inspection" },
                { label: "Appraisal", value: "appraisal" },
                { label: "Financing", value: "financing" },
                { label: "Closing", value: "closing" },
                { label: "Closed", value: "closed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          )}
        />
        <Controller
          name="assignedUserId"
          control={control}
          render={({ field }) => (
            <DropdownInput
              label="Assigned Agent"
              value={field.value}
              onValueChange={field.onChange}
              error={errors.assignedUserId?.message}
              options={agents.map((agent) => ({ label: agent.name, value: agent.id }))}
            />
          )}
        />
      </Section>

      <Section title="Parties">
        <FieldRow confidence={extraction.parties.buyerNames.confidence}>
          <TextInput label="Buyer Name(s)" {...register("buyerNames")} />
        </FieldRow>
        <FieldRow confidence={extraction.parties.sellerNames.confidence}>
          <TextInput label="Seller Name(s)" {...register("sellerNames")} />
        </FieldRow>
        <FieldRow confidence={extraction.parties.listingAgent.confidence}>
          <TextInput label="Listing Agent" {...register("listingAgent")} />
        </FieldRow>
        <FieldRow confidence={extraction.parties.sellingAgent.confidence}>
          <TextInput label="Selling Agent" {...register("sellingAgent")} />
        </FieldRow>
        <FieldRow confidence={extraction.parties.listingBrokerage.confidence}>
          <TextInput label="Listing Brokerage" {...register("listingBrokerage")} />
        </FieldRow>
        <FieldRow confidence={extraction.parties.sellingBrokerage.confidence}>
          <TextInput label="Selling Brokerage" {...register("sellingBrokerage")} />
        </FieldRow>
      </Section>

      <Section title="Dates & Deadlines">
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerInput label="Inspection Deadline" {...register("inspectionDeadline")} />
          <DatePickerInput label="Financing Deadline" {...register("financingDeadline")} />
          <DatePickerInput label="Appraisal Deadline" {...register("appraisalDeadline")} />
          <DatePickerInput label="Earnest Money Due" {...register("earnestMoneyDueDate")} />
          <DatePickerInput label="Contingency Deadline" {...register("contingencyDeadline")} />
          <DatePickerInput label="Walkthrough Date" {...register("walkthroughDate")} />
        </div>
      </Section>

      <Section title="Money / EMD">
        <Controller
          name="earnestMoneyAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Earnest Money Amount"
              value={field.value?.toString() ?? ""}
              onChange={(value) => field.onChange(parseCurrencyValue(value))}
            />
          )}
        />
        <Controller
          name="earnestMoneyHeldBy"
          control={control}
          render={({ field }) => (
            <DropdownInput
              label="Earnest Money Held By"
              value={field.value}
              onValueChange={field.onChange}
              options={[
                { label: "Seller's Brokerage", value: "sellers_brokerage" },
                { label: "Buyer's Brokerage", value: "buyers_brokerage" },
                { label: "Other", value: "other" },
              ]}
            />
          )}
        />
        <TextInput label="Holder Name (if Other)" {...register("earnestMoneyHolderName")} />
        <Controller
          name="sellerConcessions"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Seller Concessions"
              value={field.value?.toString() ?? ""}
              onChange={(value) => field.onChange(parseCurrencyValue(value))}
            />
          )}
        />
        <Controller
          name="commission"
          control={control}
          render={({ field }) => (
            <FieldRow confidence={extraction.money.commission.confidence}>
              <CurrencyInput
                label="Commission"
                value={field.value?.toString() ?? ""}
                onChange={(value) => field.onChange(parseCurrencyValue(value))}
              />
            </FieldRow>
          )}
        />
      </Section>

      <Section title="Service Providers">
        <TextInput label="Lender" {...register("lender")} />
        <TextInput label="Title Company" {...register("titleCompany")} />
        <TextInput label="Closing Company" {...register("closingCompany")} />
        <TextInput label="Attorney" {...register("attorney")} />
        <TextInput label="Inspector" {...register("inspector")} />
      </Section>

      <Section title="Documents">
        {extraction.documents.length ? (
          <ul className="space-y-2">
            {extraction.documents.map((doc) => (
              <li
                key={doc.fileName}
                className="rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{doc.fileName}</p>
                  <StatusBadge
                    label={`${doc.confidenceScore}% confidence`}
                    variant={
                      doc.confidenceScore >= 80
                        ? "success"
                        : doc.confidenceScore >= 50
                          ? "warning"
                          : "default"
                    }
                  />
                </div>
                <p className="text-muted-foreground">
                  {doc.documentType.replaceAll("_", " ")} ·{" "}
                  {doc.summary ?? "No summary available"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Status: Parsed Successfully
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={typography.bodyMuted}>Uploaded files will be linked to the workspace.</p>
        )}
      </Section>
    </div>
  );
}
