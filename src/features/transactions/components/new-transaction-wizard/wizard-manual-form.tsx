"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { CurrencyDisplay } from "@/components/design-system/displays/currency-display";
import { DateDisplay } from "@/components/design-system/displays/date-display";
import { CurrencyInput } from "@/components/design-system/forms/currency-input";
import { DatePickerInput } from "@/components/design-system/forms/date-picker-input";
import { DropdownInput } from "@/components/design-system/forms/dropdown-input";
import { RadioInput } from "@/components/design-system/forms/radio-input";
import { TextInput } from "@/components/design-system/forms/text-input";
import { typography } from "@/lib/design-system/typography";
import {
  getEarnestMoneyHeldByLabel,
  getTransactionTypeLabel,
  earnestMoneyHeldByOptions,
  manualWizardStepFields,
  parseCurrencyValue,
  transactionTypeOptions,
  type NewTransactionFormValues,
} from "@/features/transactions/schemas/new-transaction-schema";
import type { UserDto } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

const manualStepLabels = [
  "Transaction Type",
  "Property Information",
  "People",
  "Deal Terms",
  "Review & Create",
];

type WizardManualFormProps = {
  step: number;
  form: UseFormReturn<NewTransactionFormValues>;
  agents: UserDto[];
};

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:justify-between">
      <dt className={typography.caption}>{label}</dt>
      <dd className={cn(typography.body, "sm:text-right")}>{value}</dd>
    </div>
  );
}

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="space-y-2">
      <p className={typography.caption}>
        Step {step} of {manualStepLabels.length} · {manualStepLabels[step - 1]}
      </p>
      <div className="flex gap-1">
        {manualStepLabels.map((_, index) => (
          <div
            key={manualStepLabels[index]}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function getManualStepFields(step: number) {
  return manualWizardStepFields[step] ?? [];
}

export function WizardManualForm({ step, form, agents }: WizardManualFormProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = form;
  const values = watch();

  if (step === 1) {
    return (
      <Controller
        name="transactionType"
        control={control}
        render={({ field }) => (
          <RadioInput
            label="Transaction Type"
            description="Choose the representation type for this deal."
            value={field.value}
            onValueChange={field.onChange}
            error={errors.transactionType?.message}
            options={[...transactionTypeOptions]}
          />
        )}
      />
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <TextInput
          label="Property Address"
          {...register("propertyAddress")}
          error={errors.propertyAddress?.message}
          placeholder="142 Oak Lane"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            label="City"
            {...register("city")}
            error={errors.city?.message}
            placeholder="Richmond"
          />
          <TextInput
            label="State"
            {...register("state")}
            error={errors.state?.message}
            placeholder="VA"
            maxLength={2}
          />
          <TextInput
            label="ZIP"
            {...register("zip")}
            error={errors.zip?.message}
            placeholder="23220"
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <TextInput
          label="Buyer Name(s)"
          {...register("buyerNames")}
          description="Optional for now. Contacts will link here in a future update."
          placeholder="Johnson Family"
        />
        <TextInput
          label="Seller Name(s)"
          {...register("sellerNames")}
          description="Optional for now."
          placeholder="Smith Family"
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
              placeholder="Select an agent"
              options={agents.map((agent) => ({
                label: agent.name,
                value: agent.id,
              }))}
            />
          )}
        />
      </div>
    );
  }

  if (step === 4) {
    const heldBy = watch("earnestMoneyHeldBy");

    return (
      <div className="space-y-4">
        <Controller
          name="purchasePrice"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Purchase Price"
              value={field.value}
              onChange={field.onChange}
              description="Optional"
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerInput
            label="Contract Date"
            {...register("contractDate")}
            description="Optional"
          />
          <DatePickerInput
            label="Closing Date"
            {...register("closingDate")}
            description="Optional"
          />
        </div>
        <Controller
          name="earnestMoneyAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Earnest Money Amount"
              value={field.value}
              onChange={field.onChange}
              description="Optional"
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
              placeholder="Select holder"
              description="Optional"
              options={[...earnestMoneyHeldByOptions]}
            />
          )}
        />
        {heldBy === "other" ? (
          <TextInput
            label="Holder Name"
            {...register("earnestMoneyHolderName")}
            error={errors.earnestMoneyHolderName?.message}
            placeholder="Enter holder name"
          />
        ) : null}
      </div>
    );
  }

  const assignedAgent =
    agents.find((agent) => agent.id === values.assignedUserId)?.name ?? "—";
  const purchasePrice = parseCurrencyValue(values.purchasePrice);
  const earnestMoney = parseCurrencyValue(values.earnestMoneyAmount);

  return (
    <dl className="rounded-xl border border-border/70 bg-muted/20 px-4">
      <ReviewRow
        label="Transaction Type"
        value={getTransactionTypeLabel(values.transactionType)}
      />
      <ReviewRow
        label="Property"
        value={`${values.propertyAddress}, ${values.city}, ${values.state} ${values.zip}`}
      />
      <ReviewRow label="Buyer" value={values.buyerNames?.trim() || "—"} />
      <ReviewRow label="Seller" value={values.sellerNames?.trim() || "—"} />
      <ReviewRow label="Assigned Agent" value={assignedAgent} />
      <ReviewRow
        label="Purchase Price"
        value={
          purchasePrice != null ? (
            <CurrencyDisplay amount={purchasePrice} />
          ) : (
            "—"
          )
        }
      />
      <ReviewRow
        label="Contract Date"
        value={
          values.contractDate ? (
            <DateDisplay value={new Date(`${values.contractDate}T12:00:00`)} />
          ) : (
            "—"
          )
        }
      />
      <ReviewRow
        label="Closing Date"
        value={
          values.closingDate ? (
            <DateDisplay value={new Date(`${values.closingDate}T12:00:00`)} />
          ) : (
            "—"
          )
        }
      />
      <ReviewRow
        label="Earnest Money"
        value={
          earnestMoney != null ? <CurrencyDisplay amount={earnestMoney} /> : "—"
        }
      />
      <ReviewRow
        label="Earnest Money Held By"
        value={getEarnestMoneyHeldByLabel(values.earnestMoneyHeldBy)}
      />
      {values.earnestMoneyHeldBy === "other" ? (
        <ReviewRow
          label="Holder Name"
          value={values.earnestMoneyHolderName?.trim() || "—"}
        />
      ) : null}
    </dl>
  );
}

export { manualStepLabels };
