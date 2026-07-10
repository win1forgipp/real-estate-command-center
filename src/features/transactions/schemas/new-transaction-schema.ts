import { z } from "zod";

export {
  earnestMoneyHeldByOptions,
  getEarnestMoneyHeldByLabel,
  getTransactionTypeLabel,
  transactionTypeOptions,
} from "@/lib/labels/enums";

export const newTransactionFormSchema = z
  .object({
    transactionType: z.enum(["buyer", "seller", "dual"], {
      message: "Select a transaction type",
    }),
    propertyAddress: z.string().min(1, "Property address is required"),
    city: z.string().min(1, "City is required"),
    state: z
      .string()
      .min(2, "State is required")
      .max(2, "Use a 2-letter state code"),
    zip: z.string().min(5, "ZIP code is required"),
    buyerNames: z.string().optional(),
    sellerNames: z.string().optional(),
    assignedUserId: z.string().min(1, "Assigned agent is required"),
    purchasePrice: z.string().optional(),
    contractDate: z.string().optional(),
    closingDate: z.string().optional(),
    earnestMoneyAmount: z.string().optional(),
    earnestMoneyHeldBy: z
      .enum(["sellers_brokerage", "buyers_brokerage", "other"])
      .optional(),
    earnestMoneyHolderName: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (
      values.earnestMoneyHeldBy === "other" &&
      !values.earnestMoneyHolderName?.trim()
    ) {
      context.addIssue({
        code: "custom",
        message: "Holder name is required when Other is selected",
        path: ["earnestMoneyHolderName"],
      });
    }
  });

export type NewTransactionFormValues = z.infer<typeof newTransactionFormSchema>;

export const manualWizardStepFields: Record<
  number,
  (keyof NewTransactionFormValues)[]
> = {
  1: ["transactionType"],
  2: ["propertyAddress", "city", "state", "zip"],
  3: ["assignedUserId"],
  4: [],
};

export const createTransactionInputSchema = z
  .object({
    transactionType: z.enum(["buyer", "seller", "dual"]),
    propertyAddress: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(5),
    buyerNames: z.string().optional(),
    sellerNames: z.string().optional(),
    assignedUserId: z.string().min(1),
    purchasePrice: z.number().positive().optional(),
    contractDate: z.string().optional(),
    closingDate: z.string().optional(),
    earnestMoneyAmount: z.number().nonnegative().optional(),
    earnestMoneyHeldBy: z
      .enum(["sellers_brokerage", "buyers_brokerage", "other"])
      .optional(),
    earnestMoneyHolderName: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (
      values.earnestMoneyHeldBy === "other" &&
      !values.earnestMoneyHolderName?.trim()
    ) {
      context.addIssue({
        code: "custom",
        message: "Holder name is required when Other is selected",
        path: ["earnestMoneyHolderName"],
      });
    }
  });

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

export function parseCurrencyValue(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
}

export function formValuesToCreateInput(
  values: NewTransactionFormValues,
): CreateTransactionInput {
  return createTransactionInputSchema.parse({
    transactionType: values.transactionType,
    propertyAddress: values.propertyAddress.trim(),
    city: values.city.trim(),
    state: values.state.trim().toUpperCase(),
    zip: values.zip.trim(),
    buyerNames: values.buyerNames?.trim() || undefined,
    sellerNames: values.sellerNames?.trim() || undefined,
    assignedUserId: values.assignedUserId,
    purchasePrice: parseCurrencyValue(values.purchasePrice),
    contractDate: values.contractDate || undefined,
    closingDate: values.closingDate || undefined,
    earnestMoneyAmount: parseCurrencyValue(values.earnestMoneyAmount),
    earnestMoneyHeldBy: values.earnestMoneyHeldBy,
    earnestMoneyHolderName: values.earnestMoneyHolderName?.trim() || undefined,
  });
}
