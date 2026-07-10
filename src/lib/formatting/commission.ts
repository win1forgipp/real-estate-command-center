export const DEFAULT_BROKERAGE_SPLIT_BPS = 3000;

export type CommissionCalculationInput = {
  salePriceDollars: number;
  commissionPercentageBps: number;
  brokerageSplitBps?: number;
};

export type CommissionCalculationResult = {
  commissionPercentageBps: number;
  brokerageSplitBps: number;
  grossCommissionAmountCents: number;
  brokerageFeeAmountCents: number;
  agentNetCommissionCents: number;
  grossCommissionDollars: number;
  brokerageFeeDollars: number;
  agentNetCommissionDollars: number;
};

function roundHalfUp(value: number): number {
  return Math.round(value);
}

export function percentToBps(percent: number): number {
  return roundHalfUp(percent * 100);
}

export function bpsToPercent(bps: number): number {
  return bps / 100;
}

export function formatPercentFromBps(
  bps: number | null | undefined,
  { decimals = 2 }: { decimals?: number } = {},
): string {
  if (bps == null) {
    return "";
  }

  const percent = bpsToPercent(bps);
  const formatted = percent.toFixed(decimals).replace(/\.?0+$/, "");
  return `${formatted}%`;
}

export function parsePercentInput(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function calculateCommissionAmounts(
  input: CommissionCalculationInput,
): CommissionCalculationResult {
  const brokerageSplitBps = input.brokerageSplitBps ?? DEFAULT_BROKERAGE_SPLIT_BPS;
  const salePriceCents = input.salePriceDollars * 100;
  const grossCommissionAmountCents = roundHalfUp(
    (salePriceCents * input.commissionPercentageBps) / 10_000,
  );
  const brokerageFeeAmountCents = roundHalfUp(
    (grossCommissionAmountCents * brokerageSplitBps) / 10_000,
  );
  const agentNetCommissionCents =
    grossCommissionAmountCents - brokerageFeeAmountCents;

  return {
    commissionPercentageBps: input.commissionPercentageBps,
    brokerageSplitBps,
    grossCommissionAmountCents,
    brokerageFeeAmountCents,
    agentNetCommissionCents,
    grossCommissionDollars: roundHalfUp(grossCommissionAmountCents / 100),
    brokerageFeeDollars: roundHalfUp(brokerageFeeAmountCents / 100),
    agentNetCommissionDollars: roundHalfUp(agentNetCommissionCents / 100),
  };
}

export function inferCommissionPercentageBpsFromLegacyExpected(
  salePriceDollars: number | null | undefined,
  commissionExpectedDollars: number | null | undefined,
): number | null {
  if (
    salePriceDollars == null ||
    salePriceDollars <= 0 ||
    commissionExpectedDollars == null ||
    commissionExpectedDollars <= 0
  ) {
    return null;
  }

  return roundHalfUp((commissionExpectedDollars * 10_000) / salePriceDollars);
}
