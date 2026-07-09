"use server";

import { revalidatePath } from "next/cache";

import { createContact, type CreateContactInput } from "@/services/contacts/mutations";
import { createDeadline, type CreateDeadlineInput } from "@/services/deadlines/mutations";
import {
  getContactOptions,
  getTransactionOptions,
  type FormSelectOption,
} from "@/services/forms/queries";
import { createLink, type CreateLinkInput } from "@/services/links/mutations";
import { createListing, type CreateListingInput } from "@/services/listings/mutations";
import {
  createShowingAsTask,
  createTask,
  type CreateShowingInput,
  type CreateTaskInput,
} from "@/services/tasks/mutations";
import {
  updateTransactionCommission,
  type UpdateCommissionInput,
} from "@/services/transactions/mutations";

export type FormOptionsData = {
  transactions: FormSelectOption[];
  contacts: FormSelectOption[];
};

export async function getFormOptionsAction(): Promise<FormOptionsData> {
  const [transactions, contacts] = await Promise.all([
    getTransactionOptions(),
    getContactOptions(),
  ]);

  return { transactions, contacts };
}

function revalidateCorePaths() {
  revalidatePath("/");
  revalidatePath("/buyers");
  revalidatePath("/sellers");
  revalidatePath("/contacts");
  revalidatePath("/showings");
  revalidatePath("/tasks");
  revalidatePath("/deadlines");
  revalidatePath("/documents");
  revalidatePath("/commissions");
  revalidatePath("/transactions");
}

export async function createBuyerAction(
  input: Omit<CreateContactInput, "contactType">,
) {
  const contact = await createContact({ ...input, contactType: "buyer" });
  revalidateCorePaths();
  return contact;
}

export async function createContactAction(input: CreateContactInput) {
  const contact = await createContact(input);
  revalidateCorePaths();
  return contact;
}

export async function createListingAction(input: CreateListingInput) {
  const result = await createListing(input);
  revalidateCorePaths();
  return result;
}

export async function createShowingAction(input: CreateShowingInput) {
  const task = await createShowingAsTask(input);
  revalidateCorePaths();
  return task;
}

export async function createDeadlineAction(input: CreateDeadlineInput) {
  const deadline = await createDeadline(input);
  revalidateCorePaths();
  return deadline;
}

export async function createTaskAction(input: CreateTaskInput) {
  const task = await createTask(input);
  revalidateCorePaths();
  return task;
}

export async function createLinkAction(input: CreateLinkInput) {
  const link = await createLink(input);
  revalidateCorePaths();
  return link;
}

export async function updateCommissionAction(input: UpdateCommissionInput) {
  const transaction = await updateTransactionCommission(input);
  revalidateCorePaths();
  return transaction;
}
