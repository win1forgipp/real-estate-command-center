import "server-only";

import { asc } from "drizzle-orm";

import { getDb } from "@/db/client";
import { contacts, transactions } from "@/db/schema";

export type FormSelectOption = {
  value: string;
  label: string;
};

export async function getTransactionOptions(): Promise<FormSelectOption[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: transactions.id,
      propertyAddress: transactions.propertyAddress,
      city: transactions.city,
      state: transactions.state,
    })
    .from(transactions)
    .orderBy(asc(transactions.propertyAddress));

  return rows.map((row) => ({
    value: row.id,
    label: `${row.propertyAddress}, ${row.city}, ${row.state}`,
  }));
}

export async function getContactOptions(): Promise<FormSelectOption[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      contactType: contacts.contactType,
    })
    .from(contacts)
    .orderBy(asc(contacts.lastName), asc(contacts.firstName));

  return rows.map((row) => ({
    value: row.id,
    label: `${row.firstName} ${row.lastName} (${row.contactType})`,
  }));
}
