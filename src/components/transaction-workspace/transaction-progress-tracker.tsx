"use client";

import { AlertCircle, Check, type LucideIcon } from "lucide-react";

import { DateDisplay } from "@/components/design-system/displays/date-display";
import { typography } from "@/lib/design-system/typography";
import {
  getTransactionProgressDefinition,
  resolveProgressStages,
} from "@/lib/transaction-progress";
import type {
  ProgressStageInstance,
  ProgressStageState,
  TransactionTypeId,
} from "@/lib/transaction-progress/types";
import { cn } from "@/lib/utils";

const stageStateStyles: Record<
  ProgressStageState,
  {
    node: string;
    connector: string;
    label: string;
    statusLabel: string;
  }
> = {
  not_started: {
    node: "border-border bg-muted text-muted-foreground",
    connector: "bg-border",
    label: "text-muted-foreground",
    statusLabel: "Not Started",
  },
  active: {
    node: "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100",
    connector: "bg-sky-300",
    label: "text-sky-800",
    statusLabel: "Active",
  },
  completed: {
    node: "border-emerald-500 bg-emerald-50 text-emerald-700",
    connector: "bg-emerald-400",
    label: "text-emerald-800",
    statusLabel: "Completed",
  },
  attention_required: {
    node: "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-100",
    connector: "bg-red-300",
    label: "text-red-800",
    statusLabel: "Attention Required",
  },
};

type TransactionProgressTrackerProps = {
  transactionType: TransactionTypeId;
  progress: ProgressStageInstance[];
  className?: string;
  onStageClick?: (stageId: string) => void;
};

function getConnectorState(
  currentState: ProgressStageState,
  nextState?: ProgressStageState,
) {
  if (currentState === "completed") {
    return "completed";
  }

  if (
    currentState === "active" ||
    currentState === "attention_required" ||
    nextState === "active" ||
    nextState === "attention_required" ||
    nextState === "completed"
  ) {
    return "active";
  }

  return "not_started";
}

type ProgressStageItemProps = {
  label: string;
  description: string;
  state: ProgressStageState;
  completedAt?: string;
  icon: LucideIcon;
  showConnector?: boolean;
  connectorState?: ProgressStageState;
  compact?: boolean;
  onStageClick?: (stageId: string) => void;
  stageId: string;
};

function ProgressStageItem({
  label,
  description,
  state,
  completedAt,
  icon: Icon,
  showConnector = false,
  connectorState = "not_started",
  compact = false,
  onStageClick,
  stageId,
}: ProgressStageItemProps) {
  const styles = stageStateStyles[state];
  const connectorStyles = stageStateStyles[connectorState];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-start",
        compact ? "w-28 sm:w-32" : "min-w-0 flex-1",
      )}
    >
      <button
        type="button"
        className={cn(
          "group/stage relative z-10 flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        aria-label={`${label} · ${styles.statusLabel}`}
        onClick={() => onStageClick?.(stageId)}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full border-2 transition-colors",
            styles.node,
          )}
        >
          {state === "completed" ? (
            <Check className="size-5" aria-hidden="true" />
          ) : state === "attention_required" ? (
            <AlertCircle className="size-5" aria-hidden="true" />
          ) : (
            <Icon className="size-5" aria-hidden="true" />
          )}
        </span>

        <span className="flex w-full flex-col items-center gap-1">
          <span
            className={cn(
              typography.caption,
              "line-clamp-2 font-medium",
              styles.label,
            )}
          >
            {label}
          </span>
          {completedAt ? (
            <DateDisplay
              value={completedAt}
              className={cn(typography.caption, "text-[11px]")}
            />
          ) : (
            <span className={cn(typography.caption, "text-[11px]")}>
              {styles.statusLabel}
            </span>
          )}
        </span>

        <span className="pointer-events-none absolute top-0 left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg border border-border/70 bg-popover px-3 py-2 text-left shadow-lg group-hover/stage:block group-focus-visible/stage:block">
          <span className={cn(typography.label, "block")}>{label}</span>
          <span className={cn(typography.caption, "mt-1 block")}>
            {description}
          </span>
          <span className={cn(typography.caption, "mt-2 block font-medium")}>
            Status: {styles.statusLabel}
          </span>
          {completedAt ? (
            <span className={cn(typography.caption, "mt-1 block")}>
              Completed: <DateDisplay value={completedAt} />
            </span>
          ) : null}
        </span>
      </button>

      {showConnector ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-[1.375rem] left-[calc(50%+1.375rem)] h-0.5",
            compact ? "w-[calc(100%-2.75rem)]" : "right-[calc(-50%+1.375rem)]",
            connectorStyles.connector,
          )}
        />
      ) : null}
    </div>
  );
}

export function TransactionProgressTracker({
  transactionType,
  progress,
  className,
  onStageClick,
}: TransactionProgressTrackerProps) {
  const definition = getTransactionProgressDefinition(transactionType);
  const stages = resolveProgressStages(definition, progress);

  return (
    <section
      aria-label="Transaction progress tracker"
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:p-5",
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={typography.eyebrow}>Progress Tracker</p>
          <h3 className={typography.cardTitle}>{definition.label}</h3>
        </div>
        <p className={typography.caption}>
          {stages.filter((stage) => stage.state === "completed").length} of{" "}
          {stages.length} stages complete
        </p>
      </div>

      <div className="hidden md:block">
        <div className="flex items-start">
          {stages.map((stage, index) => {
            const nextStage = stages[index + 1];
            const connectorState = getConnectorState(
              stage.state,
              nextStage?.state,
            );

            return (
              <ProgressStageItem
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                description={stage.description}
                state={stage.state}
                completedAt={stage.completedAt}
                icon={stage.icon}
                showConnector={index < stages.length - 1}
                connectorState={connectorState}
                onStageClick={onStageClick}
              />
            );
          })}
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 md:hidden">
        <div className="flex min-w-max items-start gap-0 pr-4">
          {stages.map((stage, index) => {
            const nextStage = stages[index + 1];
            const connectorState = getConnectorState(
              stage.state,
              nextStage?.state,
            );

            return (
              <ProgressStageItem
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                description={stage.description}
                state={stage.state}
                completedAt={stage.completedAt}
                icon={stage.icon}
                showConnector={index < stages.length - 1}
                connectorState={connectorState}
                compact
                onStageClick={onStageClick}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
