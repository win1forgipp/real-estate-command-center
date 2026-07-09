import { notify } from "@/components/design-system/notifications/toast";

const ACTION_LABEL_ALIASES: Record<string, string> = {
  "Add Transaction": "New Transaction",
};

const NAVIGATION_ACTIONS: Record<string, string> = {
  "View Deadlines": "/deadlines",
};

export const NEW_TRANSACTION_LAUNCH_PATH = "/transactions?new=1";

export function normalizeActionLabel(label: string): string {
  return ACTION_LABEL_ALIASES[label] ?? label;
}

export function isNewTransactionAction(label: string): boolean {
  return normalizeActionLabel(label) === "New Transaction";
}

export function getComingSoonMessage(label: string): string {
  return `${normalizeActionLabel(label)} is coming soon.`;
}

export function notifyComingSoon(label: string, description?: string): void {
  notify.info(getComingSoonMessage(label), description);
}

export type NavigateFn = (href: string) => void;

export function getActionClickHandler(
  label: string,
  navigate?: NavigateFn,
  override?: () => void,
): () => void {
  if (override) {
    return override;
  }

  if (isNewTransactionAction(label) && navigate) {
    return () => navigate(NEW_TRANSACTION_LAUNCH_PATH);
  }

  const destination = NAVIGATION_ACTIONS[label];
  if (destination && navigate) {
    return () => navigate(destination);
  }

  return () => notifyComingSoon(label);
}
