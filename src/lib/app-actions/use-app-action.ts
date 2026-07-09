"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import { dispatchAppActionEvent } from "@/lib/app-actions/events";
import {
  createAppActionHandler,
  executeAppAction,
  executeAppActionByLabel,
} from "@/lib/app-actions/handler";
import { getAppAction, NEW_TRANSACTION_LAUNCH_PATH } from "@/lib/app-actions/registry";
import type { AppActionContext, AppActionId } from "@/lib/app-actions/types";

function buildPageCallbacks(pathname: string) {
  const callbacks: Partial<Record<AppActionId, () => void>> = {};

  if (pathname === "/transactions") {
    callbacks.new_transaction = () => dispatchAppActionEvent("new_transaction");
  }

  return callbacks;
}

export function useAppActionContext(): AppActionContext {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  const navigate = useCallback(
    (href: string) => {
      if (href === NEW_TRANSACTION_LAUNCH_PATH && pathname === "/transactions") {
        dispatchAppActionEvent("new_transaction");
        return;
      }

      router.push(href);
    },
    [pathname, router],
  );

  const callbacks = useMemo(
    () => buildPageCallbacks(pathname),
    [pathname],
  );

  return useMemo(
    () => ({
      navigate,
      openCommandPalette: () => setCommandPaletteOpen(true),
      callbacks,
    }),
    [callbacks, navigate, setCommandPaletteOpen],
  );
}

export function useAppAction() {
  const context = useAppActionContext();

  const run = useCallback(
    (actionId: AppActionId) => {
      executeAppAction(actionId, context);
    },
    [context],
  );

  const runByLabel = useCallback(
    (labelOrId: string) => {
      executeAppActionByLabel(labelOrId, context);
    },
    [context],
  );

  const getHandler = useCallback(
    (actionId: AppActionId) => createAppActionHandler(actionId, context),
    [context],
  );

  const getActionProps = useCallback(
    (actionId: AppActionId) => {
      const action = getAppAction(actionId);

      return {
        actionId,
        label: action.label,
        onClick: createAppActionHandler(actionId, context),
        disabled: action.status === "disabled",
        disabledReason: action.disabledReason,
      };
    },
    [context],
  );

  return {
    context,
    run,
    runByLabel,
    getHandler,
    getActionProps,
  };
}
