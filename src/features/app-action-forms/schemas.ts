import { z } from "zod";

export const buyerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const listingFormSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2).max(2),
  zip: z.string().min(5, "ZIP is required"),
  sellerName: z.string().min(1, "Seller name is required"),
  listingStatus: z.enum([
    "coming_soon",
    "active",
    "under_contract",
    "sold",
    "withdrawn",
  ]),
});

export const contactFormSchema = z.object({
  contactType: z.enum([
    "buyer",
    "seller",
    "agent",
    "lender",
    "attorney",
    "inspector",
    "contractor",
    "vendor",
    "title_company",
    "other",
  ]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const showingFormSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  contactId: z.string().optional(),
  buyerLabel: z.string().optional(),
  showingDate: z.string().min(1, "Date is required"),
  showingTime: z.string().optional(),
  notes: z.string().optional(),
});

export const deadlineFormSchema = z.object({
  transactionId: z.string().min(1, "Transaction is required"),
  deadlineType: z.enum([
    "inspection",
    "financing",
    "appraisal",
    "closing",
    "earnest_money",
    "contingency",
    "walkthrough",
    "custom",
  ]),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  transactionId: z.string().optional(),
});

export const linkFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Enter a valid URL"),
  linkType: z.enum([
    "google_drive",
    "mls",
    "dotloop",
    "skyslope",
    "dropbox",
    "website",
    "other",
  ]),
  transactionId: z.string().optional(),
});

export const templateFormSchema = z.object({
  title: z.string().min(1, "Template title is required"),
  category: z.string().min(1, "Category is required"),
  body: z.string().min(1, "Template content is required"),
});

export const commissionFormSchema = z.object({
  transactionId: z.string().min(1, "Transaction is required"),
  commissionExpected: z.string().optional(),
  commissionReceived: z.string().optional(),
});

export const mileageFormSchema = z.object({
  tripDate: z.string().min(1, "Date is required"),
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
  miles: z.string().min(1, "Miles are required"),
  purpose: z.string().min(1, "Purpose is required"),
});

export const preferencesFormSchema = z.object({
  displayName: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
});

export function parseCurrencyField(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
}
