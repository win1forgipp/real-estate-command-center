import type { ProgressStageInstance, TransactionTypeId } from "@/lib/transaction-progress/types";
import type { TransactionStatus } from "@/components/design-system/badges/transaction-status-badge";

export type TransactionDto = {
  id: string;
  transactionType: "buyer" | "seller" | "dual";
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  purchasePrice: number | null;
  closingDate: Date | null;
  contractDate: Date | null;
  earnestMoneyReceived: boolean;
  transactionStatus: TransactionStatus;
  commissionExpected: number | null;
  commissionReceived: number | null;
  lenderName: string | null;
  attorneyName: string | null;
  titleCompany: string | null;
};

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "partner";
};

export type TaskDto = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
};

export type DeadlineDto = {
  id: string;
  title: string;
  deadlineType: string;
  dueDate: Date;
  status: "due_today" | "due_soon" | "overdue" | "complete";
  completed: boolean;
  notes: string | null;
};

export type NoteDto = {
  id: string;
  content: string;
  createdAt: Date;
};

export type LinkDto = {
  id: string;
  title: string;
  url: string;
  linkType: string;
};

export type TransactionListItem = {
  id: string;
  propertyAddress: string;
  client: string;
  transactionType: string;
  status: TransactionStatus;
  contractDate: string;
  closingDate: string;
  nextDeadline: string;
  assignedAgent: string;
  contractDateValue: Date | null;
  closingDateValue: Date | null;
};

export type TransactionWorkspaceData = {
  transaction: TransactionDto;
  assignedUser: UserDto | null;
  tasks: TaskDto[];
  deadlines: DeadlineDto[];
  notes: NoteDto[];
  links: LinkDto[];
  progressType: TransactionTypeId;
  progress: ProgressStageInstance[];
};

export type WorkspaceTabId =
  | "overview"
  | "tasks"
  | "deadlines"
  | "contacts"
  | "documents"
  | "notes"
  | "timeline"
  | "commission"
  | "ai-assistant";
