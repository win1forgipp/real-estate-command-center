import "server-only";

import { getDb } from "@/db/client";
import { tasks } from "@/db/schema";

export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "urgent";
  transactionId?: string;
  contactId?: string;
};

export async function createTask(input: CreateTaskInput) {
  const db = getDb();

  const [task] = await db
    .insert(tasks)
    .values({
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      priority: input.priority,
      transactionId: input.transactionId ?? null,
      contactId: input.contactId ?? null,
      completed: false,
    })
    .returning();

  return task;
}

export type CreateShowingInput = {
  propertyAddress: string;
  contactId?: string;
  buyerLabel?: string;
  showingDate: string;
  showingTime?: string;
  notes?: string;
};

export async function createShowingAsTask(input: CreateShowingInput) {
  const dueDate = input.showingTime
    ? new Date(`${input.showingDate}T${input.showingTime}`)
    : new Date(`${input.showingDate}T12:00:00`);

  const description = [
    input.buyerLabel ? `Buyer/Contact: ${input.buyerLabel}` : null,
    `Date: ${input.showingDate}`,
    input.showingTime ? `Time: ${input.showingTime}` : null,
    input.notes?.trim() ? `Notes: ${input.notes.trim()}` : null,
    "Stored as a task until showings module is available.",
  ]
    .filter(Boolean)
    .join("\n");

  return createTask({
    title: `Showing: ${input.propertyAddress}`,
    description,
    dueDate: dueDate.toISOString(),
    priority: "medium",
    contactId: input.contactId,
  });
}
