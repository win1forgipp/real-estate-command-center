import {
  Banknote,
  Building2,
  ClipboardCheck,
  FileSignature,
  Hammer,
  KeyRound,
  Landmark,
  Map as MapIcon,
  Megaphone,
  Scale,
  ShieldCheck,
  Sprout,
  Tag,
  TrendingUp,
} from "lucide-react";

import type {
  ProgressStageInstance,
  ResolvedProgressStage,
  TransactionProgressDefinition,
  TransactionTypeId,
} from "@/lib/transaction-progress/types";

const residentialPurchaseStages: TransactionProgressDefinition = {
  transactionType: "residential_purchase",
  label: "Residential Purchase",
  stages: [
    {
      id: "contract_signed",
      label: "Contract Signed",
      icon: FileSignature,
      description: "Purchase agreement executed by buyer and seller.",
    },
    {
      id: "earnest_money_received",
      label: "Earnest Money Received",
      icon: Banknote,
      description: "Earnest money deposit confirmed and receipted.",
    },
    {
      id: "inspection_period",
      label: "Inspection Period",
      icon: ClipboardCheck,
      description: "Buyer inspection window is open or complete.",
    },
    {
      id: "repair_negotiation",
      label: "Repair Negotiation",
      icon: Hammer,
      description: "Repair requests and responses are being negotiated.",
    },
    {
      id: "appraisal",
      label: "Appraisal",
      icon: Scale,
      description: "Appraisal ordered, completed, or under review.",
    },
    {
      id: "financing_approved",
      label: "Financing Approved",
      icon: Landmark,
      description: "Loan approval or cash confirmation is in place.",
    },
    {
      id: "clear_to_close",
      label: "Clear to Close",
      icon: ShieldCheck,
      description: "All contingencies cleared and closing is scheduled.",
    },
    {
      id: "closing_complete",
      label: "Closing Complete",
      icon: KeyRound,
      description: "Closing finished and keys transferred.",
    },
  ],
};

const residentialListingStages: TransactionProgressDefinition = {
  transactionType: "residential_listing",
  label: "Residential Listing",
  stages: [
    {
      id: "listing_agreement_signed",
      label: "Listing Agreement Signed",
      icon: FileSignature,
      description: "Seller listing agreement is executed.",
    },
    {
      id: "pre_market_prep",
      label: "Pre-Market Prep",
      icon: Hammer,
      description: "Photos, staging, and listing prep are underway.",
    },
    {
      id: "active_on_market",
      label: "Active on Market",
      icon: Megaphone,
      description: "Property is live on MLS and marketing channels.",
    },
    {
      id: "offer_accepted",
      label: "Offer Accepted",
      icon: Tag,
      description: "Seller accepted a buyer offer.",
    },
    {
      id: "under_contract",
      label: "Under Contract",
      icon: ClipboardCheck,
      description: "Deal is under contract and moving toward closing.",
    },
    {
      id: "clear_to_close",
      label: "Clear to Close",
      icon: ShieldCheck,
      description: "Listing side contingencies are cleared.",
    },
    {
      id: "sold",
      label: "Sold",
      icon: KeyRound,
      description: "Listing closed successfully.",
    },
  ],
};

const commercialStages: TransactionProgressDefinition = {
  transactionType: "commercial",
  label: "Commercial",
  stages: [
    {
      id: "contract_executed",
      label: "Contract Executed",
      icon: FileSignature,
      description: "Commercial contract is fully executed.",
    },
    {
      id: "due_diligence",
      label: "Due Diligence",
      icon: Building2,
      description: "Environmental, financial, and legal review period.",
    },
    {
      id: "financing_commitment",
      label: "Financing Commitment",
      icon: Landmark,
      description: "Financing or capital stack is committed.",
    },
    {
      id: "clear_to_close",
      label: "Clear to Close",
      icon: ShieldCheck,
      description: "All commercial contingencies are satisfied.",
    },
    {
      id: "closing_complete",
      label: "Closing Complete",
      icon: KeyRound,
      description: "Commercial closing is complete.",
    },
  ],
};

const landStages: TransactionProgressDefinition = {
  transactionType: "land",
  label: "Land",
  stages: [
    {
      id: "contract_signed",
      label: "Contract Signed",
      icon: FileSignature,
      description: "Land purchase contract is signed.",
    },
    {
      id: "survey_title_review",
      label: "Survey & Title Review",
      icon: MapIcon,
      description: "Survey, easements, and title work are in progress.",
    },
    {
      id: "financing_approved",
      label: "Financing Approved",
      icon: Landmark,
      description: "Financing or cash terms are confirmed.",
    },
    {
      id: "clear_to_close",
      label: "Clear to Close",
      icon: ShieldCheck,
      description: "Land deal is clear to close.",
    },
    {
      id: "closing_complete",
      label: "Closing Complete",
      icon: KeyRound,
      description: "Land closing is complete.",
    },
  ],
};

const investmentStages: TransactionProgressDefinition = {
  transactionType: "investment",
  label: "Investment",
  stages: [
    {
      id: "contract_signed",
      label: "Contract Signed",
      icon: FileSignature,
      description: "Investment purchase contract is signed.",
    },
    {
      id: "inspection_due_diligence",
      label: "Inspection & Due Diligence",
      icon: TrendingUp,
      description: "Property condition and investment review underway.",
    },
    {
      id: "financing_approved",
      label: "Financing Approved",
      icon: Landmark,
      description: "Investment financing is approved or funded.",
    },
    {
      id: "clear_to_close",
      label: "Clear to Close",
      icon: ShieldCheck,
      description: "Investment deal is clear to close.",
    },
    {
      id: "closing_complete",
      label: "Closing Complete",
      icon: Sprout,
      description: "Investment closing is complete.",
    },
  ],
};

const progressDefinitions: Record<
  TransactionTypeId,
  TransactionProgressDefinition
> = {
  residential_purchase: residentialPurchaseStages,
  residential_listing: residentialListingStages,
  commercial: commercialStages,
  land: landStages,
  investment: investmentStages,
};

export function getTransactionProgressDefinition(
  transactionType: TransactionTypeId,
): TransactionProgressDefinition {
  return progressDefinitions[transactionType];
}

export function getAllTransactionProgressDefinitions() {
  return Object.values(progressDefinitions);
}

export function resolveProgressStages(
  definition: TransactionProgressDefinition,
  progress: ProgressStageInstance[],
): ResolvedProgressStage[] {
  const progressMap = new Map(progress.map((stage) => [stage.stageId, stage]));

  return definition.stages.map((stage) => {
    const instance = progressMap.get(stage.id);

    return {
      ...stage,
      state: instance?.state ?? "not_started",
      completedAt: instance?.completedAt,
    };
  });
}
