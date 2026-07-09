import { notify } from "@/components/design-system/notifications/toast";

import { getAppAction, resolveActionId } from "@/lib/app-actions/registry";
import type { AppActionContext, AppActionId } from "@/lib/app-actions/types";

function warnUnknownAction(actionId: string) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[app-actions] Unknown action id requested: "${actionId}". Falling back to coming_soon.`,
    );
  }
}

function showPlaceholderToast(actionId: AppActionId) {
  const action = getAppAction(actionId);
  notify.info(
    action.toastTitle ?? `${action.label} is coming soon.`,
    action.toastDescription,
  );
}

export function executeAppAction(
  actionId: AppActionId,
  context: AppActionContext,
): void {
  const action = getAppAction(actionId);

  if (action.status === "disabled") {
    notify.warning(
      action.label,
      action.disabledReason ?? "This action is currently disabled.",
    );
    return;
  }

  if (action.status === "placeholder") {
    showPlaceholderToast(actionId);
    return;
  }

  switch (action.behavior) {
    case "route": {
      if (!action.route) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[app-actions] Implemented route action "${actionId}" is missing a route.`,
          );
        }
        showPlaceholderToast("coming_soon");
        return;
      }

      context.navigate(action.route);
      return;
    }
    case "callback": {
      const callback = context.callbacks?.[actionId];

      if (callback) {
        callback();
        return;
      }

      if (actionId === "open_command_palette" && context.openCommandPalette) {
        context.openCommandPalette();
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[app-actions] Callback action "${actionId}" has no handler in context.`,
        );
      }

      showPlaceholderToast("coming_soon");
      return;
    }
    case "modal":
    case "drawer": {
      const callback = context.callbacks?.[actionId];

      if (callback) {
        callback();
        return;
      }

      if (action.route) {
        context.navigate(action.route);
        return;
      }

      showPlaceholderToast("coming_soon");
      return;
    }
    case "toast": {
      showPlaceholderToast(actionId);
      return;
    }
    default: {
      showPlaceholderToast("coming_soon");
    }
  }
}

export function executeAppActionByLabel(
  labelOrId: string,
  context: AppActionContext,
): void {
  const actionId = resolveActionId(labelOrId);

  if (!actionId) {
    warnUnknownAction(labelOrId);
    executeAppAction("coming_soon", context);
    return;
  }

  executeAppAction(actionId, context);
}

export function createAppActionHandler(
  actionId: AppActionId,
  context: AppActionContext,
): () => void {
  return () => executeAppAction(actionId, context);
}

export function createAppActionHandlerByLabel(
  labelOrId: string,
  context: AppActionContext,
): () => void {
  return () => executeAppActionByLabel(labelOrId, context);
}
