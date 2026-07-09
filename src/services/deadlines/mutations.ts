import "server-only";

import { getDb } from "@/db/client";
import { deadlines } from "@/db/schema";

export type CreateDeadlineInput = {
  transactionId: string;
  deadlineType:
    | "inspection"
    | "financing"
    | "appraisal"
    | "closing"
    | "earnest_money"
    | "contingency"
    | "walkthrough"
    | "custom";
  dueDate: string;
  notes?: string;
};

const deadlineTypeTitles: Record<CreateDeadlineInput["deadlineType"], string> = {
  inspection: "Inspection deadline",
  financing: "Financing contingency",
  appraisal: "Appraisal deadline",
  closing: "Closing date",
  earnest_money: "Earnest money due",
  contingency: "Contingency deadline",
  walkthrough: "Final walkthrough",
  custom: "Custom deadline",
};

export async function createDeadline(input: CreateDeadlineInput) {
  const db = getDb();
  const dueDate = new Date(`${input.dueDate}T12:00:00`);

  const [deadline] = await db
    .insert(deadlines)
    .values({
      title: deadlineTypeTitles[input.deadlineType],
      deadlineType: input.deadlineType,
      dueDate,
      status: "due_soon",
      completed: false,
      transactionId: input.transactionId,
      notes: input.notes ?? null,
    })
    .returning();

  return deadline;
}
