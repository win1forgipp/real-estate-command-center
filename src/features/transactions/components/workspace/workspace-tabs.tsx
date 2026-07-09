"use client";

import {
  CalendarClock,
  CheckSquare,
  Clock3,
  DollarSign,
  FileText,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DeadlineBadge } from "@/components/design-system/badges/deadline-badge";
import { PriorityBadge } from "@/components/design-system/badges/priority-badge";
import { CardGrid } from "@/components/design-system/layout/card-grid";
import { StatCard } from "@/components/design-system/cards/stat-card";
import { CurrencyDisplay } from "@/components/design-system/displays/currency-display";
import { DateDisplay } from "@/components/design-system/displays/date-display";
import { EmptyState } from "@/components/design-system/feedback/empty-state";
import { SectionHeader } from "@/components/design-system/layout/section-header";
import { typography } from "@/lib/design-system/typography";
import type { TransactionWorkspaceData, WorkspaceTabId } from "@/features/transactions/types";
import { formatDateValue } from "@/features/transactions/utils/format";
import { notifyComingSoon } from "@/lib/create-actions";
import { cn } from "@/lib/utils";

const workspaceTabs: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "deadlines", label: "Deadlines" },
  { id: "contacts", label: "Contacts" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Notes" },
  { id: "timeline", label: "Timeline" },
  { id: "commission", label: "Commission" },
  { id: "ai-assistant", label: "AI Assistant" },
];

type WorkspaceTabsProps = {
  workspace: TransactionWorkspaceData;
};

function OverviewTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  const openTasks = workspace.tasks.filter((task) => !task.completed);
  const upcomingDeadlines = workspace.deadlines
    .filter((deadline) => !deadline.completed)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <CardGrid>
        <StatCard
          icon={CalendarClock}
          title="Upcoming Deadlines"
          value={String(upcomingDeadlines.length)}
          description="Next contract dates to watch"
        />
        <StatCard
          icon={CheckSquare}
          title="Open Tasks"
          value={String(openTasks.length)}
          description="Still needs action"
        />
        <StatCard
          icon={FolderOpen}
          title="Documents"
          value={String(workspace.links.length)}
          description="Linked files and resources"
        />
        <StatCard
          icon={FileText}
          title="Notes"
          value={String(workspace.notes.length)}
          description="Transaction notes on file"
        />
      </CardGrid>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <SectionHeader title="Upcoming Deadlines" />
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length ? (
              upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3"
                >
                  <div>
                    <p className={typography.label}>{deadline.title}</p>
                    <p className={cn(typography.caption, "mt-1")}>
                      <DateDisplay value={deadline.dueDate} />
                    </p>
                  </div>
                  <DeadlineBadge status={deadline.status} />
                </div>
              ))
            ) : (
              <p className={typography.bodyMuted}>No upcoming deadlines.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <SectionHeader title="Open Tasks" />
          <div className="mt-4 space-y-3">
            {openTasks.length ? (
              openTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={typography.label}>{task.title}</p>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.dueDate ? (
                    <p className={cn(typography.caption, "mt-1")}>
                      Due <DateDisplay value={task.dueDate} />
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className={typography.bodyMuted}>No open tasks.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border/80 bg-card p-5 shadow-sm">
        <SectionHeader
          title="Recent Activity"
          description="Activity timeline events will appear here in a future milestone."
        />
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <SectionHeader title="Commission Snapshot" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className={typography.caption}>Expected Commission</p>
            <p className="mt-1 text-2xl font-semibold">
              {workspace.transaction.commissionExpected != null ? (
                <CurrencyDisplay amount={workspace.transaction.commissionExpected} />
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className={typography.caption}>Received Commission</p>
            <p className="mt-1 text-2xl font-semibold">
              {workspace.transaction.commissionReceived != null ? (
                <CurrencyDisplay amount={workspace.transaction.commissionReceived} />
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function TasksTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  if (!workspace.tasks.length) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks yet"
        description="Tasks linked to this transaction will appear here."
        actionLabel="Add Task"
        onAction={() => notifyComingSoon("Add Task")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {workspace.tasks.map((task) => (
        <article
          key={task.id}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={typography.label}>{task.title}</p>
              {task.description ? (
                <p className={cn(typography.bodyMuted, "mt-1")}>
                  {task.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={task.priority} />
              <span className={typography.caption}>
                {task.completed ? "Completed" : "Open"}
              </span>
            </div>
          </div>
          {task.dueDate ? (
            <p className={cn(typography.caption, "mt-3")}>
              Due <DateDisplay value={task.dueDate} />
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function DeadlinesTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  if (!workspace.deadlines.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No deadlines yet"
        description="Contract deadlines for this transaction will appear here."
        actionLabel="Add Deadline"
        onAction={() => notifyComingSoon("Add Deadline")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {workspace.deadlines.map((deadline) => (
        <article
          key={deadline.id}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={typography.label}>{deadline.title}</p>
              <p className={cn(typography.caption, "mt-1 capitalize")}>
                {deadline.deadlineType.replaceAll("_", " ")}
              </p>
            </div>
            <DeadlineBadge status={deadline.status} />
          </div>
          <p className={cn(typography.bodyMuted, "mt-3")}>
            Due {formatDateValue(deadline.dueDate)}
            {deadline.completed ? " · Complete" : ""}
          </p>
          {deadline.notes ? (
            <p className={cn(typography.bodyMuted, "mt-2")}>{deadline.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ContactsTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <SectionHeader title="Buyer" />
        <p className={cn(typography.bodyMuted, "mt-3")}>
          Not linked yet. Contact relationships will be added in a future
          milestone.
        </p>
      </section>
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <SectionHeader title="Seller" />
        <p className={cn(typography.bodyMuted, "mt-3")}>Not linked yet.</p>
      </section>
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <SectionHeader title="Transaction Contacts" />
        <dl className="mt-4 space-y-3">
          <div>
            <dt className={typography.caption}>Lender</dt>
            <dd className={typography.body}>
              {workspace.transaction.lenderName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className={typography.caption}>Attorney</dt>
            <dd className={typography.body}>
              {workspace.transaction.attorneyName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className={typography.caption}>Title Company</dt>
            <dd className={typography.body}>
              {workspace.transaction.titleCompany ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function DocumentsTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  if (!workspace.links.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Linked documents and resources for this transaction will appear here."
        actionLabel="Add Link"
        onAction={() => notifyComingSoon("Add Link")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {workspace.links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
        >
          <p className={typography.label}>{link.title}</p>
          <p className={cn(typography.caption, "mt-1 capitalize")}>
            {link.linkType.replaceAll("_", " ")}
          </p>
        </a>
      ))}
    </div>
  );
}

function NotesTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  if (!workspace.notes.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No notes yet"
        description="Transaction notes will appear here."
        actionLabel="Add Note"
        onAction={() => notifyComingSoon("Add Note")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {workspace.notes.map((note) => (
        <article
          key={note.id}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <p className={typography.body}>{note.content}</p>
          <p className={cn(typography.caption, "mt-3")}>
            Added <DateDisplay value={note.createdAt} />
          </p>
        </article>
      ))}
    </div>
  );
}

function TimelineTab() {
  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-card p-8 text-center shadow-sm">
      <Clock3 className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
      <h3 className={cn(typography.sectionTitle, "mt-4")}>Timeline coming soon</h3>
      <p className={cn(typography.bodyMuted, "mx-auto mt-2 max-w-2xl")}>
        This tab will show a chronological history of notes, tasks, status
        changes, and documents for this transaction.
      </p>
    </section>
  );
}

function CommissionTab({ workspace }: { workspace: TransactionWorkspaceData }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={DollarSign}
        title="Expected Commission"
        value={
          workspace.transaction.commissionExpected != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(workspace.transaction.commissionExpected)
            : "—"
        }
      />
      <StatCard
        icon={DollarSign}
        title="Received Commission"
        value={
          workspace.transaction.commissionReceived != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(workspace.transaction.commissionReceived)
            : "—"
        }
      />
      <StatCard
        icon={DollarSign}
        title="Net"
        value="—"
        description="Net commission calculations coming soon"
      />
    </div>
  );
}

function AiAssistantTab() {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h3 className={typography.sectionTitle}>AI Assistant</h3>
          <p className={cn(typography.bodyMuted, "mt-3 max-w-3xl")}>
            This workspace will eventually include an AI transaction assistant
            capable of summarizing the transaction, drafting documents,
            identifying missing information, and recommending next actions.
          </p>
        </div>
      </div>
    </section>
  );
}

export function WorkspaceTabs({ workspace }: WorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");

  const content = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab workspace={workspace} />;
      case "tasks":
        return <TasksTab workspace={workspace} />;
      case "deadlines":
        return <DeadlinesTab workspace={workspace} />;
      case "contacts":
        return <ContactsTab workspace={workspace} />;
      case "documents":
        return <DocumentsTab workspace={workspace} />;
      case "notes":
        return <NotesTab workspace={workspace} />;
      case "timeline":
        return <TimelineTab />;
      case "commission":
        return <CommissionTab workspace={workspace} />;
      case "ai-assistant":
        return <AiAssistantTab />;
      default:
        return null;
    }
  }, [activeTab, workspace]);

  return (
    <section className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-border/70 p-2">
        {workspaceTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5 md:p-6">{content}</div>
    </section>
  );
}
