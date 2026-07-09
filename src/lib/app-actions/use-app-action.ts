"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import {
  createAppActionHandler,
  executeAppAction,
  executeAppActionByLabel,
} from "@/lib/app-actions/handler";
import { getActionLabel, getAppAction } from "@/lib/app-actions/registry";
import type { AppActionContext, AppActionId } from "@/lib/app-actions/types";

export function useAppActionContext(): AppActionContext {
  const router = useRouter();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  return useMemo(
    () => ({
      navigate: (href: string) => router.push(href),
      openCommandPalette: () => setCommandPaletteOpen(true),
    }),
    [router, setCommandPaletteOpen],
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

  const getActionProps = useCallback((actionId: AppActionId) => {
    const action = getAppAction(actionId);

    return {
      actionId,
      label: action.label,
      onClick: createAppActionHandler(actionId, context),
      disabled: action.status === "disabled",
      disabledReason: action.disabledReason,
    };
  }, [context]);

  return {
    context,
    run,
    runByLabel,
    getHandler,
    getActionProps,
    getActionLabel,
  };
}
