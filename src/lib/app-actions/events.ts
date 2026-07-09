import type { AppActionId } from "@/lib/app-actions/types";

const APP_ACTION_EVENT_PREFIX = "app-action:";

export function getAppActionEventName(actionId: AppActionId) {
  return `${APP_ACTION_EVENT_PREFIX}${actionId}`;
}

export function dispatchAppActionEvent(actionId: AppActionId) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(getAppActionEventName(actionId)));
}

export function subscribeToAppActionEvent(
  actionId: AppActionId,
  handler: () => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const eventName = getAppActionEventName(actionId);
  window.addEventListener(eventName, handler);

  return () => {
    window.removeEventListener(eventName, handler);
  };
}
