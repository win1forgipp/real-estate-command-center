import "dotenv/config";

import { createDb } from "@/db/client";
import {
  contacts,
  deadlines,
  links,
  notes,
  tasks,
  transactions,
  users,
} from "@/db/schema";

async function seed() {
  const db = createDb();

  console.log("Seeding database...");

  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0) {
    console.log("Seed skipped: users already exist.");
    return;
  }

  const [tim, tater] = await db
    .insert(users)
    .values([
      {
        name: "Tim",
        email: "tim@example.com",
        role: "admin",
      },
      {
        name: "Tater",
        email: "tater@example.com",
        role: "partner",
      },
    ])
    .returning();

  const [buyerContact, lenderContact] = await db
    .insert(contacts)
    .values([
      {
        contactType: "buyer",
        firstName: "Johnson",
        lastName: "Family",
        email: "johnson@example.com",
        phone: "555-0100",
      },
      {
        contactType: "lender",
        firstName: "Sarah",
        lastName: "Mitchell",
        company: "Blue Ridge Lending",
        email: "smitchell@blueridgelending.com",
        phone: "555-0142",
      },
    ])
    .returning();

  const [transaction] = await db
    .insert(transactions)
    .values({
      transactionType: "buyer",
      propertyAddress: "142 Oak Lane",
      city: "Richmond",
      state: "VA",
      zip: "23220",
      purchasePrice: 425000,
      closingDate: new Date("2026-03-28"),
      contractDate: new Date("2026-02-15"),
      earnestMoneyAmount: 5000,
      earnestMoneyReceived: true,
      earnestMoneyHeldBy: "sellers_brokerage",
      transactionStatus: "under_contract",
      listingSide: false,
      sellingSide: true,
      commissionExpected: 12750,
      commissionReceived: 0,
      lenderName: "Blue Ridge Lending",
      attorneyName: "Taylor & Associates",
      titleCompany: "Commonwealth Title Group",
      mlsNumber: "MLS-142-OAK",
      assignedUserId: tim.id,
    })
    .returning();

  await db.insert(tasks).values([
    {
      title: "Send repair addendum",
      description: "Follow up on inspection response for 142 Oak Lane.",
      priority: "urgent",
      dueDate: new Date(),
      completed: false,
      transactionId: transaction.id,
      assignedUserId: tim.id,
    },
    {
      title: "Confirm showing feedback",
      description: "Collect buyer notes after the latest showing.",
      priority: "medium",
      dueDate: new Date(),
      completed: false,
      contactId: buyerContact.id,
      assignedUserId: tater.id,
    },
    {
      title: "Upload lender pre-approval",
      description: "Attach the latest pre-approval letter to the transaction file.",
      priority: "high",
      dueDate: new Date(),
      completed: true,
      completedAt: new Date(),
      transactionId: transaction.id,
      assignedUserId: tater.id,
    },
  ]);

  await db.insert(deadlines).values([
    {
      title: "Inspection deadline",
      deadlineType: "inspection",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "due_soon",
      completed: false,
      transactionId: transaction.id,
      notes: "Plain-language contract deadline for inspection response.",
    },
    {
      title: "Financing contingency",
      deadlineType: "financing",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "due_soon",
      completed: false,
      transactionId: transaction.id,
    },
    {
      title: "Earnest money due",
      deadlineType: "earnest_money",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "complete",
      completed: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      transactionId: transaction.id,
    },
  ]);

  await db.insert(notes).values([
    {
      content: "Buyer is motivated and flexible on closing timeline.",
      noteScope: "transaction",
      transactionId: transaction.id,
      authorUserId: tim.id,
    },
    {
      content: "Prefers ranch-style homes with a finished basement.",
      noteScope: "contact",
      contactId: buyerContact.id,
      authorUserId: tater.id,
    },
    {
      content: "Review commission pipeline before Friday meeting.",
      noteScope: "general",
      authorUserId: tim.id,
    },
    {
      content: `Lender contact ${lenderContact.firstName} ${lenderContact.lastName} confirmed docs received.`,
      noteScope: "transaction",
      transactionId: transaction.id,
      authorUserId: tater.id,
    },
  ]);

  await db.insert(links).values([
    {
      title: "Transaction Google Drive folder",
      url: "https://drive.google.com/example-transaction-folder",
      linkType: "google_drive",
      transactionId: transaction.id,
    },
    {
      title: "MLS listing sheet",
      url: "https://mls.example.com/listing/142-oak-lane",
      linkType: "mls",
      transactionId: transaction.id,
    },
    {
      title: "Dotloop workspace",
      url: "https://dotloop.example.com/workspaces/142-oak-lane",
      linkType: "dotloop",
      transactionId: transaction.id,
    },
    {
      title: "Brokerage resource page",
      url: "https://brokerage.example.com/resources",
      linkType: "website",
    },
  ]);

  console.log("Seed complete.");
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
