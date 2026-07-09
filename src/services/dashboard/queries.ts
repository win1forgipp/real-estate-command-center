import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";

import { contacts, deadlines, tasks, transactions } from "@/db/schema";
import { getDb } from "@/db/client";
import type { StatusVariant } from "@/components/dashboard/status-badge";
import type { DashboardCardData } from "@/lib/mock-data";
import { activeTransactionsFilter } from "@/services/transactions/filters";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}

function transactionStatusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function transactionStatusVariant(status: string): StatusVariant {
  if (status === "closed") {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  if (status === "under_contract" || status === "closing") {
    return "info";
  }

  return "default";
}

function deadlineStatusVariant(status: string): StatusVariant {
  if (status === "overdue") {
    return "danger";
  }

  if (status === "due_today") {
    return "warning";
  }

  return "default";
}

export async function getDashboardOverviewCards(): Promise<DashboardCardData[]> {
  const db = getDb();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();
  const weekFromNow = new Date(todayStart);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const [
    activeTransactionRows,
    upcomingDeadlineRows,
    tasksDueTodayRows,
    closingsThisMonthRows,
    commissionRows,
    listingRows,
    buyerLeadRows,
    overdueTaskRows,
    overdueDeadlineRows,
  ] = await Promise.all([
    db
      .select({
        id: transactions.id,
        propertyAddress: transactions.propertyAddress,
        city: transactions.city,
        state: transactions.state,
        transactionType: transactions.transactionType,
        transactionStatus: transactions.transactionStatus,
      })
      .from(transactions)
      .where(activeTransactionsFilter())
      .orderBy(desc(transactions.updatedAt))
      .limit(3),
    db
      .select({
        id: deadlines.id,
        title: deadlines.title,
        dueDate: deadlines.dueDate,
        status: deadlines.status,
        propertyAddress: transactions.propertyAddress,
      })
      .from(deadlines)
      .innerJoin(transactions, eq(deadlines.transactionId, transactions.id))
      .where(
        and(
          eq(deadlines.completed, false),
          gte(deadlines.dueDate, todayStart),
          lte(deadlines.dueDate, weekFromNow),
        ),
      )
      .orderBy(asc(deadlines.dueDate))
      .limit(3),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        propertyAddress: transactions.propertyAddress,
      })
      .from(tasks)
      .leftJoin(transactions, eq(tasks.transactionId, transactions.id))
      .where(
        and(
          eq(tasks.completed, false),
          gte(tasks.dueDate, todayStart),
          lte(tasks.dueDate, todayEnd),
        ),
      )
      .orderBy(asc(tasks.dueDate))
      .limit(3),
    db
      .select({
        id: transactions.id,
        propertyAddress: transactions.propertyAddress,
        closingDate: transactions.closingDate,
        transactionStatus: transactions.transactionStatus,
      })
      .from(transactions)
      .where(
        and(
          activeTransactionsFilter(),
          isNotNull(transactions.closingDate),
          gte(transactions.closingDate, monthStart),
          lte(transactions.closingDate, monthEnd),
        ),
      )
      .orderBy(asc(transactions.closingDate))
      .limit(3),
    db
      .select({
        id: transactions.id,
        propertyAddress: transactions.propertyAddress,
        commissionExpected: transactions.commissionExpected,
      })
      .from(transactions)
      .where(
        and(activeTransactionsFilter(), isNotNull(transactions.commissionExpected)),
      )
      .orderBy(desc(transactions.commissionExpected))
      .limit(3),
    db
      .select({
        id: transactions.id,
        propertyAddress: transactions.propertyAddress,
        transactionStatus: transactions.transactionStatus,
      })
      .from(transactions)
      .where(and(activeTransactionsFilter(), eq(transactions.listingSide, true)))
      .orderBy(desc(transactions.updatedAt))
      .limit(3),
    db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        company: contacts.company,
      })
      .from(contacts)
      .where(eq(contacts.contactType, "buyer"))
      .orderBy(desc(contacts.updatedAt))
      .limit(3),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        propertyAddress: transactions.propertyAddress,
      })
      .from(tasks)
      .leftJoin(transactions, eq(tasks.transactionId, transactions.id))
      .where(and(eq(tasks.completed, false), lt(tasks.dueDate, todayStart)))
      .orderBy(asc(tasks.dueDate))
      .limit(3),
    db
      .select({
        id: deadlines.id,
        title: deadlines.title,
        propertyAddress: transactions.propertyAddress,
      })
      .from(deadlines)
      .innerJoin(transactions, eq(deadlines.transactionId, transactions.id))
      .where(and(eq(deadlines.completed, false), lt(deadlines.dueDate, todayStart)))
      .orderBy(asc(deadlines.dueDate))
      .limit(3),
  ]);

  const [
    activeTransactionCount,
    upcomingDeadlineCount,
    tasksDueTodayCount,
    closingsThisMonthCount,
    commissionTotal,
    activeListingCount,
    buyerLeadCount,
    overdueTaskCount,
    overdueDeadlineCount,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(transactions)
      .where(activeTransactionsFilter())
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(deadlines)
      .where(
        and(
          eq(deadlines.completed, false),
          gte(deadlines.dueDate, todayStart),
          lte(deadlines.dueDate, weekFromNow),
        ),
      )
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.completed, false),
          gte(tasks.dueDate, todayStart),
          lte(tasks.dueDate, todayEnd),
        ),
      )
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(transactions)
      .where(
        and(
          activeTransactionsFilter(),
          isNotNull(transactions.closingDate),
          gte(transactions.closingDate, monthStart),
          lte(transactions.closingDate, monthEnd),
        ),
      )
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({
        total: sql<number>`coalesce(sum(${transactions.commissionExpected}), 0)`,
      })
      .from(transactions)
      .where(
        and(activeTransactionsFilter(), isNotNull(transactions.commissionExpected)),
      )
      .then((rows) => rows[0]?.total ?? 0),
    db
      .select({ value: count() })
      .from(transactions)
      .where(and(activeTransactionsFilter(), eq(transactions.listingSide, true)))
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(contacts)
      .where(eq(contacts.contactType, "buyer"))
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.completed, false), lt(tasks.dueDate, todayStart)))
      .then((rows) => rows[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(deadlines)
      .where(and(eq(deadlines.completed, false), lt(deadlines.dueDate, todayStart)))
      .then((rows) => rows[0]?.value ?? 0),
  ]);

  const attentionCount = overdueTaskCount + overdueDeadlineCount;
  const attentionItems = [
    ...overdueTaskRows.map((task) => ({
      label: task.title,
      detail: task.propertyAddress ?? "General task",
      status: "danger" as const,
      statusLabel: "Overdue",
      href: task.propertyAddress ? "/tasks" : "/tasks",
    })),
    ...overdueDeadlineRows.map((deadline) => ({
      label: deadline.title,
      detail: deadline.propertyAddress,
      status: "danger" as const,
      statusLabel: "Overdue",
      href: "/deadlines",
    })),
  ].slice(0, 3);

  return [
    {
      id: "active-transactions",
      icon: "transactions",
      title: "Active Transactions",
      value: String(activeTransactionCount),
      description:
        activeTransactionCount === 0
          ? "No active deals yet"
          : "Excludes closed and cancelled deals",
      status: activeTransactionCount > 0 ? "info" : "default",
      statusLabel: activeTransactionCount > 0 ? "In progress" : undefined,
      href: "/transactions",
      items: activeTransactionRows.map((row) => ({
        label: row.propertyAddress,
        detail: `${row.transactionType} · ${transactionStatusLabel(row.transactionStatus)}`,
        href: `/transactions/${row.id}`,
      })),
    },
    {
      id: "upcoming-deadlines",
      icon: "deadlines",
      title: "Upcoming Deadlines",
      value: String(upcomingDeadlineCount),
      description: "Next 7 days",
      status: upcomingDeadlineCount > 0 ? "warning" : "default",
      statusLabel: upcomingDeadlineCount > 0 ? "Due soon" : undefined,
      href: "/deadlines",
      items: upcomingDeadlineRows.map((row) => ({
        label: row.title,
        detail: `${row.propertyAddress} · ${formatShortDate(row.dueDate)}`,
        status: deadlineStatusVariant(row.status),
        statusLabel: transactionStatusLabel(row.status),
        href: "/deadlines",
      })),
    },
    {
      id: "tasks-due-today",
      icon: "tasks",
      title: "Tasks Due Today",
      value: String(tasksDueTodayCount),
      description: "Needs action today",
      status: tasksDueTodayCount > 0 ? "danger" : "default",
      statusLabel: tasksDueTodayCount > 0 ? "Due today" : undefined,
      href: "/tasks",
      items: tasksDueTodayRows.map((row) => ({
        label: row.title,
        detail: row.propertyAddress ?? "General task",
        href: "/tasks",
      })),
    },
    {
      id: "closings-this-month",
      icon: "closings",
      title: "Closings This Month",
      value: String(closingsThisMonthCount),
      description: "Scheduled closings",
      status: closingsThisMonthCount > 0 ? "success" : "default",
      statusLabel: closingsThisMonthCount > 0 ? "On track" : undefined,
      href: "/transactions",
      items: closingsThisMonthRows.map((row) => ({
        label: row.propertyAddress,
        detail: row.closingDate
          ? `Closing ${formatShortDate(row.closingDate)}`
          : "Closing date pending",
        status: transactionStatusVariant(row.transactionStatus),
        statusLabel: transactionStatusLabel(row.transactionStatus),
        href: `/transactions/${row.id}`,
      })),
    },
    {
      id: "commission-pipeline",
      icon: "commissions",
      title: "Commission Pipeline",
      value: formatCurrency(commissionTotal),
      description: "Expected before fees",
      status: commissionTotal > 0 ? "info" : "default",
      statusLabel: commissionTotal > 0 ? "Pipeline" : undefined,
      href: "/commissions",
      items: commissionRows.map((row) => ({
        label: row.propertyAddress,
        detail:
          row.commissionExpected != null
            ? `${formatCurrency(row.commissionExpected)} expected`
            : "—",
        href: `/transactions/${row.id}`,
      })),
    },
    {
      id: "active-listings",
      icon: "listings",
      title: "Active Listings",
      value: String(activeListingCount),
      description: "Currently on market",
      status: activeListingCount > 0 ? "default" : undefined,
      statusLabel: activeListingCount > 0 ? "Live" : undefined,
      href: "/sellers",
      items: listingRows.map((row) => ({
        label: row.propertyAddress,
        detail: transactionStatusLabel(row.transactionStatus),
        href: `/transactions/${row.id}`,
      })),
    },
    {
      id: "buyer-leads",
      icon: "buyers",
      title: "Buyer Leads",
      value: String(buyerLeadCount),
      description: "Active buyer clients",
      status: buyerLeadCount > 0 ? "info" : "default",
      statusLabel: buyerLeadCount > 0 ? "Active" : undefined,
      href: "/buyers",
      items: buyerLeadRows.map((row) => ({
        label: `${row.firstName} ${row.lastName}`,
        detail: row.company ?? "Buyer contact",
        href: "/buyers",
      })),
    },
    {
      id: "needs-attention",
      icon: "attention",
      title: "Needs Attention",
      value: String(attentionCount),
      description: "Overdue tasks and deadlines",
      status: attentionCount > 0 ? "danger" : "default",
      statusLabel: attentionCount > 0 ? "Action needed" : undefined,
      href: "/tasks",
      items: attentionItems,
    },
  ];
}
