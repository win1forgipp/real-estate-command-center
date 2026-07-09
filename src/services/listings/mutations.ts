import "server-only";

import { getDb } from "@/db/client";
import { contacts, notes, transactions } from "@/db/schema";

export type CreateListingInput = {
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  sellerName: string;
  listingStatus: "coming_soon" | "active" | "under_contract" | "sold" | "withdrawn";
};

const listingStatusToTransactionStatus = {
  coming_soon: "prospect",
  active: "prospect",
  under_contract: "under_contract",
  sold: "closed",
  withdrawn: "cancelled",
} as const;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "Seller";
  const lastName = parts.slice(1).join(" ") || "Listing";

  return { firstName, lastName };
}

export async function createListing(input: CreateListingInput) {
  const db = getDb();
  const { firstName, lastName } = splitName(input.sellerName);

  const [seller] = await db
    .insert(contacts)
    .values({
      contactType: "seller",
      firstName,
      lastName,
    })
    .returning();

  const [transaction] = await db
    .insert(transactions)
    .values({
      transactionType: "seller",
      propertyAddress: input.propertyAddress,
      city: input.city,
      state: input.state.toUpperCase(),
      zip: input.zip,
      transactionStatus: listingStatusToTransactionStatus[input.listingStatus],
      listingSide: true,
      sellingSide: false,
    })
    .returning();

  await db.insert(notes).values({
    content: `Listing created with status: ${input.listingStatus.replaceAll("_", " ")}.\nSeller: ${input.sellerName}`,
    noteScope: "transaction",
    transactionId: transaction.id,
  });

  return { seller, transaction };
}
