import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "partner"] })
    .notNull()
    .default("partner"),
  ...timestamps,
});

export const contacts = sqliteTable(
  "contacts",
  {
    id: id(),
    contactType: text("contact_type", {
      enum: [
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
      ],
    }).notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    ...timestamps,
  },
  (table) => [index("contacts_last_name_idx").on(table.lastName)],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: id(),
    transactionType: text("transaction_type", {
      enum: ["buyer", "seller", "dual"],
    }).notNull(),
    propertyAddress: text("property_address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zip: text("zip").notNull(),
    purchasePrice: integer("purchase_price"),
    closingDate: integer("closing_date", { mode: "timestamp" }),
    contractDate: integer("contract_date", { mode: "timestamp" }),
    earnestMoneyAmount: integer("earnest_money_amount"),
    earnestMoneyReceived: integer("earnest_money_received", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    transactionStatus: text("transaction_status", {
      enum: [
        "prospect",
        "under_contract",
        "inspection",
        "appraisal",
        "financing",
        "closing",
        "closed",
        "cancelled",
      ],
    })
      .notNull()
      .default("prospect"),
    listingSide: integer("listing_side", { mode: "boolean" })
      .notNull()
      .default(false),
    sellingSide: integer("selling_side", { mode: "boolean" })
      .notNull()
      .default(false),
    commissionExpected: integer("commission_expected"),
    commissionReceived: integer("commission_received"),
    lenderName: text("lender_name"),
    attorneyName: text("attorney_name"),
    titleCompany: text("title_company"),
    mlsNumber: text("mls_number"),
    assignedUserId: text("assigned_user_id").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    index("transactions_status_idx").on(table.transactionStatus),
    index("transactions_closing_date_idx").on(table.closingDate),
    index("transactions_property_address_idx").on(table.propertyAddress),
  ],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: id(),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority", {
      enum: ["low", "medium", "high", "urgent"],
    })
      .notNull()
      .default("medium"),
    dueDate: integer("due_date", { mode: "timestamp" }),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    assignedUserId: text("assigned_user_id").references(() => users.id),
    transactionId: text("transaction_id").references(() => transactions.id),
    contactId: text("contact_id").references(() => contacts.id),
    ...timestamps,
  },
  (table) => [index("tasks_due_date_idx").on(table.dueDate)],
);

export const deadlines = sqliteTable(
  "deadlines",
  {
    id: id(),
    title: text("title").notNull(),
    deadlineType: text("deadline_type", {
      enum: [
        "inspection",
        "financing",
        "appraisal",
        "closing",
        "earnest_money",
        "contingency",
        "walkthrough",
        "custom",
      ],
    }).notNull(),
    dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
    status: text("status", {
      enum: ["due_today", "due_soon", "overdue", "complete"],
    })
      .notNull()
      .default("due_soon"),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("deadlines_due_date_idx").on(table.dueDate)],
);

export const notes = sqliteTable("notes", {
  id: id(),
  content: text("content").notNull(),
  noteScope: text("note_scope", {
    enum: ["transaction", "contact", "general"],
  }).notNull(),
  transactionId: text("transaction_id").references(() => transactions.id),
  contactId: text("contact_id").references(() => contacts.id),
  authorUserId: text("author_user_id").references(() => users.id),
  ...timestamps,
});

export const links = sqliteTable("links", {
  id: id(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  linkType: text("link_type", {
    enum: [
      "google_drive",
      "mls",
      "dotloop",
      "skyslope",
      "dropbox",
      "website",
      "other",
    ],
  })
    .notNull()
    .default("other"),
  transactionId: text("transaction_id").references(() => transactions.id),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Deadline = typeof deadlines.$inferSelect;
export type NewDeadline = typeof deadlines.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export const schema = {
  users,
  contacts,
  transactions,
  tasks,
  deadlines,
  notes,
  links,
};
