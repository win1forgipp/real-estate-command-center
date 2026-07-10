import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import {
  deadlines,
  links,
  notes,
  tasks,
  transactions,
  users,
} from "@/db/schema";
import { getDb } from "@/db/client";
import type {
  DeadlineDto,
  LinkDto,
  NoteDto,
  TaskDto,
  TransactionDto,
  TransactionListItem,
  TransactionWorkspaceData,
  UserDto,
} from "@/features/transactions/types";
import {
  formatClientPlaceholder,
  formatDateValue,
  formatPropertyAddress,
  formatTransactionType,
} from "@/features/transactions/utils/format";
import {
  mapDbTransactionTypeToProgressType,
  mapTransactionToProgress,
} from "@/features/transactions/utils/progress-mapper";
import type { TransactionStatus } from "@/components/design-system/badges/transaction-status-badge";
import { activeTransactionsFilter } from "@/services/transactions/filters";

function toTransactionDto(
  transaction: typeof transactions.$inferSelect,
): TransactionDto {
  return {
    id: transaction.id,
    transactionType: transaction.transactionType,
    propertyAddress: transaction.propertyAddress,
    city: transaction.city,
    state: transaction.state,
    zip: transaction.zip,
    purchasePrice: transaction.purchasePrice,
    closingDate: transaction.closingDate,
    contractDate: transaction.contractDate,
    earnestMoneyReceived: transaction.earnestMoneyReceived,
    earnestMoneyHeldBy: transaction.earnestMoneyHeldBy,
    earnestMoneyHolderName: transaction.earnestMoneyHolderName,
    transactionStatus: transaction.transactionStatus as TransactionStatus,
    commissionExpected: transaction.commissionExpected,
    commissionReceived: transaction.commissionReceived,
    commissionPercentageBps: transaction.commissionPercentageBps,
    brokerageSplitBps: transaction.brokerageSplitBps,
    grossCommissionAmountCents: transaction.grossCommissionAmountCents,
    brokerageFeeAmountCents: transaction.brokerageFeeAmountCents,
    agentNetCommissionCents: transaction.agentNetCommissionCents,
    lenderName: transaction.lenderName,
    attorneyName: transaction.attorneyName,
    titleCompany: transaction.titleCompany,
  };
}

function toUserDto(user: typeof users.$inferSelect): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function toTaskDto(task: typeof tasks.$inferSelect): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    completed: task.completed,
    completedAt: task.completedAt,
  };
}

function toDeadlineDto(deadline: typeof deadlines.$inferSelect): DeadlineDto {
  return {
    id: deadline.id,
    title: deadline.title,
    deadlineType: deadline.deadlineType,
    dueDate: deadline.dueDate,
    status: deadline.status,
    completed: deadline.completed,
    notes: deadline.notes,
  };
}

function toNoteDto(note: typeof notes.$inferSelect): NoteDto {
  return {
    id: note.id,
    content: note.content,
    createdAt: note.createdAt,
  };
}

function toLinkDto(link: typeof links.$inferSelect): LinkDto {
  return {
    id: link.id,
    title: link.title,
    url: link.url,
    linkType: link.linkType,
  };
}

function getNextDeadlineLabel(
  transactionId: string,
  transactionDeadlines: { transactionId: string; title: string; dueDate: Date; completed: boolean }[],
) {
  const upcoming = transactionDeadlines
    .filter(
      (deadline) =>
        deadline.transactionId === transactionId && !deadline.completed,
    )
    .sort((left, right) => left.dueDate.getTime() - right.dueDate.getTime())[0];

  if (!upcoming) {
    return "—";
  }

  return `${upcoming.title} · ${formatDateValue(upcoming.dueDate)}`;
}

export async function getTransactionsList(): Promise<TransactionListItem[]> {
  const db = getDb();

  const [rows, allDeadlines] = await Promise.all([
    db
      .select({
        transaction: transactions,
        assignedUser: users,
      })
      .from(transactions)
      .where(activeTransactionsFilter())
      .leftJoin(users, eq(transactions.assignedUserId, users.id))
      .orderBy(desc(transactions.updatedAt)),
    db
      .select({
        transactionId: deadlines.transactionId,
        title: deadlines.title,
        dueDate: deadlines.dueDate,
        completed: deadlines.completed,
      })
      .from(deadlines)
      .orderBy(asc(deadlines.dueDate)),
  ]);

  return rows.map(({ transaction, assignedUser }) => ({
    id: transaction.id,
    propertyAddress: formatPropertyAddress(transaction),
    client: formatClientPlaceholder(transaction),
    transactionType: formatTransactionType(transaction),
    status: transaction.transactionStatus as TransactionStatus,
    contractDate: formatDateValue(transaction.contractDate),
    closingDate: formatDateValue(transaction.closingDate),
    nextDeadline: getNextDeadlineLabel(transaction.id, allDeadlines),
    assignedAgent: assignedUser?.name ?? "Unassigned",
    contractDateValue: transaction.contractDate,
    closingDateValue: transaction.closingDate,
  }));
}

export async function getTransactionWorkspace(
  id: string,
): Promise<TransactionWorkspaceData | null> {
  const db = getDb();

  const [transactionRow] = await db
    .select({
      transaction: transactions,
      assignedUser: users,
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.assignedUserId, users.id))
    .where(eq(transactions.id, id))
    .limit(1);

  if (!transactionRow) {
    return null;
  }

  const { transaction, assignedUser } = transactionRow;
  const transactionDto = toTransactionDto(transaction);

  const [taskRows, deadlineRows, noteRows, linkRows] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.transactionId, id))
      .orderBy(desc(tasks.dueDate)),
    db
      .select()
      .from(deadlines)
      .where(eq(deadlines.transactionId, id))
      .orderBy(asc(deadlines.dueDate)),
    db
      .select()
      .from(notes)
      .where(eq(notes.transactionId, id))
      .orderBy(desc(notes.createdAt)),
    db
      .select()
      .from(links)
      .where(eq(links.transactionId, id))
      .orderBy(desc(links.createdAt)),
  ]);

  return {
    transaction: transactionDto,
    assignedUser: assignedUser ? toUserDto(assignedUser) : null,
    tasks: taskRows.map(toTaskDto),
    deadlines: deadlineRows.map(toDeadlineDto),
    notes: noteRows.map(toNoteDto),
    links: linkRows.map(toLinkDto),
    progressType: mapDbTransactionTypeToProgressType(transactionDto.transactionType),
    progress: mapTransactionToProgress(transactionDto),
  };
}
