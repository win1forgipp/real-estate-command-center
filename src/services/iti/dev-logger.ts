import "server-only";

type ItiDevLogPayload = {
  fileCount: number;
  fileNames: string[];
  fileTypes: string[];
  fileSizes: number[];
  provider: "openai" | "mock";
  status: "started" | "stored" | "parsed" | "extracted" | "completed" | "failed";
  error?: string;
};

export function logItiDev(payload: ItiDevLogPayload) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[ITI]", {
    ...payload,
    totalBytes: payload.fileSizes.reduce((sum, size) => sum + size, 0),
  });
}
