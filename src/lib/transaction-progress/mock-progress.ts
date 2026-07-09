import type {
  ProgressStageInstance,
  TransactionProgressSnapshot,
  TransactionTypeId,
} from "@/lib/transaction-progress/types";

export type MockTransactionWorkspace = {
  id: string;
  title: string;
  subtitle: string;
  transactionType: TransactionTypeId;
  progress: ProgressStageInstance[];
};

export const mockTransactionWorkspaces: MockTransactionWorkspace[] = [
  {
    id: "tx-oak-lane",
    title: "142 Oak Lane",
    subtitle: "Buyer transaction · Under contract · Residential purchase",
    transactionType: "residential_purchase",
    progress: [
      {
        stageId: "contract_signed",
        state: "completed",
        completedAt: "2026-06-18",
      },
      {
        stageId: "earnest_money_received",
        state: "completed",
        completedAt: "2026-06-20",
      },
      {
        stageId: "inspection_period",
        state: "attention_required",
      },
      {
        stageId: "repair_negotiation",
        state: "not_started",
      },
      {
        stageId: "appraisal",
        state: "not_started",
      },
      {
        stageId: "financing_approved",
        state: "not_started",
      },
      {
        stageId: "clear_to_close",
        state: "not_started",
      },
      {
        stageId: "closing_complete",
        state: "not_started",
      },
    ],
  },
  {
    id: "tx-pine-street",
    title: "88 Pine Street",
    subtitle: "Seller listing · Active on market · Residential listing",
    transactionType: "residential_listing",
    progress: [
      {
        stageId: "listing_agreement_signed",
        state: "completed",
        completedAt: "2026-05-02",
      },
      {
        stageId: "pre_market_prep",
        state: "completed",
        completedAt: "2026-05-15",
      },
      {
        stageId: "active_on_market",
        state: "active",
      },
      {
        stageId: "offer_accepted",
        state: "not_started",
      },
      {
        stageId: "under_contract",
        state: "not_started",
      },
      {
        stageId: "clear_to_close",
        state: "not_started",
      },
      {
        stageId: "sold",
        state: "not_started",
      },
    ],
  },
];

export function getMockTransactionWorkspace(id: string) {
  return mockTransactionWorkspaces.find((workspace) => workspace.id === id);
}

export function getMockTransactionProgressSnapshot(
  workspace: MockTransactionWorkspace,
): TransactionProgressSnapshot {
  return {
    transactionId: workspace.id,
    transactionType: workspace.transactionType,
    stages: workspace.progress,
  };
}
