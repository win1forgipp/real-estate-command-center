import "server-only";

import { getDb } from "@/db/client";
import { contacts, notes } from "@/db/schema";

export type CreateContactInput = {
  contactType:
    | "buyer"
    | "seller"
    | "agent"
    | "lender"
    | "attorney"
    | "inspector"
    | "contractor"
    | "vendor"
    | "title_company"
    | "other";
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export async function createContact(input: CreateContactInput) {
  const db = getDb();

  const [contact] = await db
    .insert(contacts)
    .values({
      contactType: input.contactType,
      firstName: input.firstName,
      lastName: input.lastName,
      company: input.company ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
    })
    .returning();

  if (input.notes?.trim()) {
    await db.insert(notes).values({
      content: input.notes.trim(),
      noteScope: "contact",
      contactId: contact.id,
    });
  }

  return contact;
}
