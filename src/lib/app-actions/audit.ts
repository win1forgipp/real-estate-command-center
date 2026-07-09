import { getAllAppActions } from "@/lib/app-actions/registry";
import type { AppActionAuditEntry, AppActionId } from "@/lib/app-actions/types";

export function listAppActions(): AppActionAuditEntry[] {
  return getAllAppActions().map((action) => ({
    id: action.id,
    label: action.label,
    status: action.status,
    behavior: action.behavior,
    route: action.route,
    aliases: action.aliases ?? [],
    surfaces: action.surfaces ?? [],
  }));
}

export function getImplementedActions(): AppActionAuditEntry[] {
  return listAppActions().filter((action) => action.status === "implemented");
}

export function getPlaceholderActions(): AppActionAuditEntry[] {
  return listAppActions().filter((action) => action.status === "placeholder");
}

export function getDisabledActions(): AppActionAuditEntry[] {
  return listAppActions().filter((action) => action.status === "disabled");
}

export function getActionAuditReport(): {
  total: number;
  implemented: number;
  placeholder: number;
  disabled: number;
  actions: AppActionAuditEntry[];
} {
  const actions = listAppActions();

  return {
    total: actions.length,
    implemented: actions.filter((action) => action.status === "implemented")
      .length,
    placeholder: actions.filter((action) => action.status === "placeholder")
      .length,
    disabled: actions.filter((action) => action.status === "disabled").length,
    actions,
  };
}

export function printAppActionAudit(): void {
  const report = getActionAuditReport();

  console.group("[app-actions] Action audit");
  console.table(report.actions);
  console.info(
    `Implemented: ${report.implemented} · Placeholder: ${report.placeholder} · Disabled: ${report.disabled} · Total: ${report.total}`,
  );
  console.groupEnd();
}

export function assertActionIsImplemented(actionId: AppActionId): boolean {
  const action = listAppActions().find((entry) => entry.id === actionId);
  return action?.status === "implemented";
}

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as Window & { __appActionAudit?: typeof getActionAuditReport }).__appActionAudit =
    getActionAuditReport;
}
