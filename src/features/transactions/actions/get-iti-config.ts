"use server";

import { getItiSetupMessage, isItiConfigured } from "@/services/iti";
import {
  getBlobAccessMode,
  getBlobAuthMode,
  getBlobSetupMessage,
  isBlobConfigured,
} from "@/services/iti/blob-config";

export async function getItiConfigAction() {
  return {
    isConfigured: isItiConfigured(),
    setupMessage: getItiSetupMessage(),
    isBlobConfigured: isBlobConfigured(),
    blobAuthMode: getBlobAuthMode(),
    blobAccessMode: getBlobAccessMode(),
    blobSetupMessage: isBlobConfigured() ? undefined : getBlobSetupMessage(),
  };
}
