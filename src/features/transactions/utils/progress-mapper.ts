import type { ProgressStageInstance } from "@/lib/transaction-progress/types";
import type { TransactionTypeId } from "@/lib/transaction-progress/types";
import { getTransactionProgressDefinition } from "@/lib/transaction-progress";
import type { TransactionDto } from "@/features/transactions/types";

export function mapDbTransactionTypeToProgressType(
  transactionType: TransactionDto["transactionType"],
): TransactionTypeId {
  if (transactionType === "seller") {
    return "residential_listing";
  }

  return "residential_purchase";
}

function getActiveStageIndex(transaction: TransactionDto, stageIds: readonly string[]) {
  if (transaction.transactionStatus === "closed") {
    return stageIds.length - 1;
  }

  if (transaction.transactionStatus === "cancelled") {
    return Math.min(2, stageIds.length - 1);
  }

  if (transaction.transactionStatus === "prospect") {
    return 0;
  }

  if (transaction.transactionStatus === "under_contract") {
    return transaction.earnestMoneyReceived ? 2 : 1;
  }

  const statusToPurchaseStage: Record<string, number> = {
    inspection: 2,
    appraisal: 4,
    financing: 5,
    closing: 6,
  };

  const statusToListingStage: Record<string, number> = {
    inspection: 4,
    appraisal: 4,
    financing: 4,
    closing: 5,
  };

  const mapping =
    stageIds[0] === "listing_agreement_signed"
      ? statusToListingStage
      : statusToPurchaseStage;

  return mapping[transaction.transactionStatus] ?? 1;
}

export function mapTransactionToProgress(
  transaction: TransactionDto,
): ProgressStageInstance[] {
  const progressType = mapDbTransactionTypeToProgressType(
    transaction.transactionType,
  );
  const definition = getTransactionProgressDefinition(progressType);
  const stageIds = definition.stages.map((stage) => stage.id);
  const activeIndex = getActiveStageIndex(transaction, stageIds);

  if (transaction.transactionStatus === "closed") {
    return definition.stages.map((stage) => ({
      stageId: stage.id,
      state: "completed",
      completedAt:
        stage.id === "closing_complete" || stage.id === "sold"
          ? transaction.closingDate?.toISOString().split("T")[0]
          : undefined,
    }));
  }

  return definition.stages.map((stage, index) => {
    if (transaction.transactionStatus === "cancelled") {
      if (index < activeIndex) {
        return { stageId: stage.id, state: "completed" };
      }

      if (index === activeIndex) {
        return { stageId: stage.id, state: "attention_required" };
      }

      return { stageId: stage.id, state: "not_started" };
    }

    if (index < activeIndex) {
      let completedAt: string | undefined;

      if (stage.id === "contract_signed" || stage.id === "listing_agreement_signed") {
        completedAt = transaction.contractDate?.toISOString().split("T")[0];
      }

      if (stage.id === "earnest_money_received" && transaction.earnestMoneyReceived) {
        completedAt = transaction.contractDate?.toISOString().split("T")[0];
      }

      return {
        stageId: stage.id,
        state: "completed",
        completedAt,
      };
    }

    if (index === activeIndex) {
      return { stageId: stage.id, state: "active" };
    }

    return { stageId: stage.id, state: "not_started" };
  });
}
