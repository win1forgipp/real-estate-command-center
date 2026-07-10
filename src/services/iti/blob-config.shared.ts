export type ItiBlobAccessMode = "public" | "private";

export type ItiBlobAuthMode = "oidc" | "token" | "none";

export function resolveBlobAccessMode(value?: string | null): ItiBlobAccessMode {
  const mode = value?.trim().toLowerCase();
  if (mode === "public" || mode === "private") {
    return mode;
  }
  return "private";
}

export function formatBlobSdkError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message || "Unknown Blob SDK error.",
    };
  }

  return {
    name: "UnknownError",
    message: "Unknown Blob SDK error.",
  };
}
