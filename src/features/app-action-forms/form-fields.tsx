"use client";

import { Controller } from "react-hook-form";

import { CurrencyInput } from "@/components/design-system/forms/currency-input";
import { DatePickerInput } from "@/components/design-system/forms/date-picker-input";
import { DropdownInput } from "@/components/design-system/forms/dropdown-input";
import { TextInput } from "@/components/design-system/forms/text-input";
import { TextareaInput } from "@/components/design-system/forms/textarea-input";
import { typography } from "@/lib/design-system/typography";
import type { FormOptionsData } from "@/features/app-action-forms/actions";
import { cn } from "@/lib/utils";

import type { FieldValues, UseFormReturn } from "react-hook-form";
import type {
  buyerFormSchema,
  commissionFormSchema,
  contactFormSchema,
  deadlineFormSchema,
  linkFormSchema,
  listingFormSchema,
  mileageFormSchema,
  preferencesFormSchema,
  showingFormSchema,
  taskFormSchema,
  templateFormSchema,
} from "./schemas";
import type { z } from "zod";

type BuyerValues = z.infer<typeof buyerFormSchema>;
type ListingValues = z.infer<typeof listingFormSchema>;
type ContactValues = z.infer<typeof contactFormSchema>;
type ShowingValues = z.infer<typeof showingFormSchema>;
type DeadlineValues = z.infer<typeof deadlineFormSchema>;
type TaskValues = z.infer<typeof taskFormSchema>;
type LinkValues = z.infer<typeof linkFormSchema>;
type TemplateValues = z.infer<typeof templateFormSchema>;
type CommissionValues = z.infer<typeof commissionFormSchema>;
type MileageValues = z.infer<typeof mileageFormSchema>;
type PreferencesValues = z.infer<typeof preferencesFormSchema>;

type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  options?: FormOptionsData;
};

export function BuyerFormFields({ form }: FormProps<BuyerValues>) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="First Name" {...register("firstName")} error={errors.firstName?.message} />
        <TextInput label="Last Name" {...register("lastName")} error={errors.lastName?.message} />
      </div>
      <TextInput label="Email" type="email" {...register("email")} />
      <TextInput label="Phone" {...register("phone")} />
      <TextareaInput label="Notes" {...register("notes")} />
    </div>
  );
}

export function ListingFormFields({ form }: FormProps<ListingValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <TextInput label="Property Address" {...register("propertyAddress")} error={errors.propertyAddress?.message} />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput label="City" {...register("city")} error={errors.city?.message} />
        <TextInput label="State" {...register("state")} maxLength={2} error={errors.state?.message} />
        <TextInput label="ZIP" {...register("zip")} error={errors.zip?.message} />
      </div>
      <TextInput label="Seller Name" {...register("sellerName")} error={errors.sellerName?.message} />
      <Controller
        name="listingStatus"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Listing Status"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.listingStatus?.message}
            options={[
              { label: "Coming Soon", value: "coming_soon" },
              { label: "Active", value: "active" },
              { label: "Under Contract", value: "under_contract" },
              { label: "Sold", value: "sold" },
              { label: "Withdrawn", value: "withdrawn" },
            ]}
          />
        )}
      />
    </div>
  );
}

export function ContactFormFields({ form }: FormProps<ContactValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <Controller
        name="contactType"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Contact Type"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.contactType?.message}
            options={[
              { label: "Buyer", value: "buyer" },
              { label: "Seller", value: "seller" },
              { label: "Agent", value: "agent" },
              { label: "Lender", value: "lender" },
              { label: "Attorney", value: "attorney" },
              { label: "Inspector", value: "inspector" },
              { label: "Contractor", value: "contractor" },
              { label: "Vendor", value: "vendor" },
              { label: "Title Company", value: "title_company" },
              { label: "Other", value: "other" },
            ]}
          />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="First Name" {...register("firstName")} error={errors.firstName?.message} />
        <TextInput label="Last Name" {...register("lastName")} error={errors.lastName?.message} />
      </div>
      <TextInput label="Company" {...register("company")} />
      <TextInput label="Email" type="email" {...register("email")} />
      <TextInput label="Phone" {...register("phone")} />
      <TextareaInput label="Notes" {...register("notes")} />
    </div>
  );
}

export function ShowingFormFields({ form, options }: FormProps<ShowingValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <TextInput label="Property Address" {...register("propertyAddress")} error={errors.propertyAddress?.message} />
      <Controller
        name="contactId"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Buyer / Contact"
            value={field.value}
            onValueChange={field.onChange}
            placeholder="Select a contact (optional)"
            options={options?.contacts ?? []}
          />
        )}
      />
      <TextInput label="Buyer name (if not in contacts)" {...register("buyerLabel")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePickerInput label="Date" {...register("showingDate")} error={errors.showingDate?.message} />
        <TextInput label="Time" type="time" {...register("showingTime")} />
      </div>
      <TextareaInput label="Notes" {...register("notes")} />
      <p className={typography.caption}>
        Showings are saved as tasks until the dedicated showings module is available.
      </p>
    </div>
  );
}

export function DeadlineFormFields({ form, options }: FormProps<DeadlineValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <Controller
        name="transactionId"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Transaction"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.transactionId?.message}
            placeholder="Select a transaction"
            options={options?.transactions ?? []}
          />
        )}
      />
      <Controller
        name="deadlineType"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Deadline Type"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.deadlineType?.message}
            options={[
              { label: "Inspection", value: "inspection" },
              { label: "Financing", value: "financing" },
              { label: "Appraisal", value: "appraisal" },
              { label: "Closing", value: "closing" },
              { label: "Earnest Money", value: "earnest_money" },
              { label: "Contingency", value: "contingency" },
              { label: "Walkthrough", value: "walkthrough" },
              { label: "Custom", value: "custom" },
            ]}
          />
        )}
      />
      <DatePickerInput label="Due Date" {...register("dueDate")} error={errors.dueDate?.message} />
      <TextareaInput label="Notes" {...register("notes")} />
    </div>
  );
}

export function TaskFormFields({ form, options }: FormProps<TaskValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <TextInput label="Title" {...register("title")} error={errors.title?.message} />
      <TextareaInput label="Description" {...register("description")} />
      <DatePickerInput label="Due Date" {...register("dueDate")} />
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Priority"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.priority?.message}
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
          />
        )}
      />
      <Controller
        name="transactionId"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Related Transaction"
            value={field.value}
            onValueChange={field.onChange}
            placeholder="Optional"
            options={options?.transactions ?? []}
          />
        )}
      />
    </div>
  );
}

export function LinkFormFields({ form, options }: FormProps<LinkValues>) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <TextInput label="Title" {...register("title")} error={errors.title?.message} />
      <TextInput label="URL" type="url" {...register("url")} error={errors.url?.message} />
      <Controller
        name="linkType"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Link Type"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.linkType?.message}
            options={[
              { label: "Google Drive", value: "google_drive" },
              { label: "MLS", value: "mls" },
              { label: "Dotloop", value: "dotloop" },
              { label: "SkySlope", value: "skyslope" },
              { label: "Dropbox", value: "dropbox" },
              { label: "Website", value: "website" },
              { label: "Other", value: "other" },
            ]}
          />
        )}
      />
      <Controller
        name="transactionId"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Related Transaction"
            value={field.value}
            onValueChange={field.onChange}
            placeholder="Optional"
            options={options?.transactions ?? []}
          />
        )}
      />
    </div>
  );
}

export function TemplateFormFields({ form }: FormProps<TemplateValues>) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <p className={cn(typography.bodyMuted)}>
        Templates are saved locally in your browser for now. Database persistence is pending.
      </p>
      <TextInput label="Template Title" {...register("title")} error={errors.title?.message} />
      <TextInput label="Category" {...register("category")} error={errors.category?.message} />
      <TextareaInput label="Body / Content" {...register("body")} error={errors.body?.message} />
    </div>
  );
}

export function CommissionFormFields({ form, options }: FormProps<CommissionValues>) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <Controller
        name="transactionId"
        control={control}
        render={({ field }) => (
          <DropdownInput
            label="Transaction"
            value={field.value}
            onValueChange={field.onChange}
            error={errors.transactionId?.message}
            placeholder="Select a transaction"
            options={options?.transactions ?? []}
          />
        )}
      />
      <Controller
        name="commissionExpected"
        control={control}
        render={({ field }) => (
          <CurrencyInput label="Expected Commission" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        name="commissionReceived"
        control={control}
        render={({ field }) => (
          <CurrencyInput label="Received Commission" value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  );
}

export function MileageFormFields({ form }: FormProps<MileageValues>) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <p className={cn(typography.bodyMuted)}>
        Mileage entries are saved locally in your browser for now. Database persistence is pending.
      </p>
      <DatePickerInput label="Date" {...register("tripDate")} error={errors.tripDate?.message} />
      <TextInput label="Start Location" {...register("startLocation")} error={errors.startLocation?.message} />
      <TextInput label="End Location" {...register("endLocation")} error={errors.endLocation?.message} />
      <TextInput label="Miles" inputMode="decimal" {...register("miles")} error={errors.miles?.message} />
      <TextInput label="Purpose" {...register("purpose")} error={errors.purpose?.message} />
    </div>
  );
}

export function PreferencesFormFields({ form }: FormProps<PreferencesValues>) {
  const { register } = form;

  return (
    <div className="space-y-4">
      <p className={cn(typography.bodyMuted)}>
        Preferences are preview-only for now. Account settings will sync once authentication is added.
      </p>
      <TextInput label="Display Name" {...register("displayName")} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("emailNotifications")} />
        Email notifications
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("dailyDigest")} />
        Daily digest
      </label>
    </div>
  );
}

export function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className={typography.label}>{title}</p>
      <p className={typography.bodyMuted}>{body}</p>
    </div>
  );
}
