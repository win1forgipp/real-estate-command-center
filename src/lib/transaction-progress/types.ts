import type { LucideIcon } from "lucide-react";

export type ProgressStageState =
  | "not_started"
  | "active"
  | "completed"
  | "attention_required";

export type TransactionTypeId =
  | "residential_purchase"
  | "residential_listing"
  | "commercial"
  | "land"
  | "investment";

export type ProgressStageDefinition = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export type TransactionProgressDefinition = {
  transactionType: TransactionTypeId;
  label: string;
  stages: ProgressStageDefinition[];
};

export type ProgressStageInstance = {
  stageId: string;
  state: ProgressStageState;
  completedAt?: string;
};

export type TransactionProgressSnapshot = {
  transactionId: string;
  transactionType: TransactionTypeId;
  stages: ProgressStageInstance[];
};

export type ResolvedProgressStage = ProgressStageDefinition & {
  state: ProgressStageState;
  completedAt?: string;
};
