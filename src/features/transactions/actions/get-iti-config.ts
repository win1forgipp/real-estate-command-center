"use server";

import { getItiSetupMessage, isItiConfigured } from "@/services/iti";

export async function getItiConfigAction() {
  return {
    isConfigured: isItiConfigured(),
    setupMessage: getItiSetupMessage(),
  };
}
