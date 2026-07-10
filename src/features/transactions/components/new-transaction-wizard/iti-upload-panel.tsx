"use client";

import { CheckCircle2, FileText, RotateCcw, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { StatusBadge } from "@/components/design-system/badges/status-badge";
import { SecondaryButton } from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import {
  ITI_EXTRACTION_FIELDS,
  ITI_SUPPORTED_DOCUMENTS,
} from "@/services/iti/prompts";
import {
  ITI_MAX_FILE_SIZE_BYTES,
  ITI_MAX_TOTAL_SIZE_BYTES,
} from "@/services/iti/constants";
import type { ItiDocumentType, ItiDocumentProcessingMethod, ItiProcessedFileResult } from "@/services/iti/types";
import { getItiPackageSummary } from "@/services/iti/upload-validation";
import { cn } from "@/lib/utils";

export type ItiFileStatus =
  | "waiting"
  | "uploading"
  | "uploaded"
  | "processing"
  | "fetching_document"
  | "sending_to_iti"
  | "analyzing_pdf"
  | "extracting_transaction_data"
  | "reading_embedded_text"
  | "ocr_required"
  | "running_ocr"
  | "analyzing_scanned_document"
  | "parsed_successfully"
  | "review_ready"
  | "review_suggested"
  | "unknown_document"
  | "failed";

export type ItiUploadFile = {
  id: string;
  file: File;
  status: ItiFileStatus;
  uploadProgress?: number;
  blobUrl?: string;
  blobPathname?: string;
  mimeType?: string;
  detectedDocumentType?: ItiDocumentType;
  confidenceScore?: number;
  processingMethod?: ItiDocumentProcessingMethod;
  pageCount?: number;
  warnings?: string[];
  error?: string;
};

const statusLabels: Record<ItiFileStatus, string> = {
  waiting: "Waiting",
  uploading: "Uploading",
  uploaded: "Uploaded",
  processing: "Processing",
  fetching_document: "Fetching Document",
  sending_to_iti: "Sending to ITI",
  analyzing_pdf: "Analyzing PDF",
  extracting_transaction_data: "Extracting Transaction Data",
  reading_embedded_text: "Reading Embedded Text",
  ocr_required: "OCR Required",
  running_ocr: "Running OCR",
  analyzing_scanned_document: "Analyzing Scanned Document",
  parsed_successfully: "Parsed Successfully",
  review_ready: "Review Ready",
  review_suggested: "Review Suggested",
  unknown_document: "Unknown Document",
  failed: "Failed",
};

const statusVariants: Record<
  ItiFileStatus,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  waiting: "default",
  uploading: "info",
  uploaded: "success",
  processing: "info",
  fetching_document: "info",
  sending_to_iti: "info",
  analyzing_pdf: "info",
  extracting_transaction_data: "info",
  reading_embedded_text: "info",
  ocr_required: "warning",
  running_ocr: "info",
  analyzing_scanned_document: "info",
  parsed_successfully: "success",
  review_ready: "success",
  review_suggested: "warning",
  unknown_document: "warning",
  failed: "danger",
};

function formatProcessingMethod(method?: ItiDocumentProcessingMethod) {
  if (!method) {
    return null;
  }

  if (method === "embedded_text") {
    return "embedded text";
  }

  if (method === "openai_file") {
    return "OpenAI PDF";
  }

  if (method === "openai_image") {
    return "OpenAI image";
  }

  if (method === "ocr") {
    return "OCR";
  }

  return "scanned analysis";
}

type ItiUploadPanelProps = {
  files: ItiUploadFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  setupError?: string | null;
  blobSetupError?: string | null;
  extractionError?: string | null;
  selectionError?: string | null;
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function ItiUploadPanel({
  files,
  onAddFiles,
  onRemoveFile,
  onRetryFile,
  setupError,
  blobSetupError,
  extractionError,
  selectionError,
}: ItiUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const packageSummary = getItiPackageSummary(
    files.map((file) => ({ size: file.file.size, status: file.status })),
  );

  const handleIncomingFiles = useCallback((incoming: File[]) => {
    if (incoming.length) {
      onAddFiles(incoming);
    }
  }, [onAddFiles]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <h3 className={typography.sectionTitle}>Intelligent Transaction Import</h3>
        <p className={cn(typography.bodyMuted, "mt-2")}>
          Upload your transaction documents and let ITI extract the key transaction details.
        </p>
        <p className={cn(typography.caption, "mt-3 font-medium text-foreground")}>
          Supported documents
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {ITI_SUPPORTED_DOCUMENTS.map((doc) => (
            <li key={doc} className={cn(typography.caption, "flex items-center gap-2")}>
              <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {blobSetupError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {blobSetupError}
        </p>
      ) : null}

      {setupError ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {setupError}
        </p>
      ) : null}

      {selectionError ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {selectionError}
        </p>
      ) : null}

      {extractionError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {extractionError}
        </p>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleIncomingFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/70 bg-card hover:border-primary/40",
        )}
      >
        <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className={cn(typography.body, "mt-3")}>
          Drag and drop PDFs or images here
        </p>
        <p className={cn(typography.caption, "mt-1")}>
          Up to {Math.floor(ITI_MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB per file,{" "}
          {Math.floor(ITI_MAX_TOTAL_SIZE_BYTES / (1024 * 1024))} MB total. JPEG and PNG photos
          are supported. HEIC/HEIF can be selected but must be converted to JPEG or PNG before
          ITI can analyze them.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(event) => {
            handleIncomingFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <SecondaryButton
            type="button"
            className="w-full sm:w-auto"
            onClick={() => inputRef.current?.click()}
          >
            Browse Files
          </SecondaryButton>
          <SecondaryButton
            type="button"
            className="w-full sm:w-auto"
            onClick={() => inputRef.current?.click()}
          >
            Add More Documents
          </SecondaryButton>
        </div>
      </div>

      {files.length ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {packageSummary.fileCount} file{packageSummary.fileCount === 1 ? "" : "s"} ·{" "}
              {formatBytes(packageSummary.totalSize)}
            </p>
            <p className={cn(typography.caption, "mt-1")}>
              {packageSummary.readyForIti
                ? "All files uploaded. Ready for ITI."
                : packageSummary.failedCount > 0
                  ? `${packageSummary.uploadedCount} uploaded, ${packageSummary.failedCount} failed`
                  : packageSummary.uploadingCount > 0
                    ? "Uploading files to secure storage..."
                    : "Waiting for uploads to complete"}
            </p>
          </div>

          <ul className="space-y-2">
            {files.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-border/70 bg-card px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.file.name}
                      </p>
                      <p className={cn(typography.caption, "truncate")}>
                        {formatBytes(entry.file.size)}
                        {entry.detectedDocumentType
                          ? ` · ${entry.detectedDocumentType.replaceAll("_", " ")}`
                          : null}
                        {entry.processingMethod
                          ? ` · ${formatProcessingMethod(entry.processingMethod)}`
                          : null}
                        {entry.pageCount != null ? ` · ${entry.pageCount} page(s)` : null}
                        {entry.confidenceScore != null
                          ? ` · ${entry.confidenceScore}% confidence`
                          : null}
                      </p>
                      {entry.warnings?.length ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.warnings.join(" ")}
                        </p>
                      ) : null}
                      {entry.error ? (
                        <p className="mt-1 text-xs text-destructive">{entry.error}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      label={statusLabels[entry.status]}
                      variant={statusVariants[entry.status]}
                    />
                    {entry.status === "failed" ? (
                      <button
                        type="button"
                        className="text-primary"
                        onClick={() => onRetryFile(entry.id)}
                        aria-label={`Retry upload for ${entry.file.name}`}
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="text-destructive"
                      onClick={() => onRemoveFile(entry.id)}
                      aria-label={`Remove ${entry.file.name}`}
                      disabled={entry.status === "uploading" || isItiFileExtracting(entry.status)}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                {entry.status === "uploading" ? (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${entry.uploadProgress ?? 0}%` }}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <h3 className={typography.sectionTitle}>What ITI extracts</h3>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {ITI_EXTRACTION_FIELDS.map((field) => (
            <li key={field} className={cn(typography.caption, "flex items-center gap-2")}>
              <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground" />
              {field}
            </li>
          ))}
        </ul>
        <p className={cn(typography.caption, "mt-3 text-muted-foreground")}>
          Files upload directly to Vercel Blob. Only document metadata is stored in Turso.
        </p>
      </div>
    </div>
  );
}

export function updateItiFileStatuses(
  files: ItiUploadFile[],
  status: ItiFileStatus,
  id?: string,
): ItiUploadFile[] {
  return files.map((file) =>
    !id || file.id === id ? { ...file, status, error: status === "failed" ? file.error : undefined } : file,
  );
}

export function applyItiProcessedFileResults(
  files: ItiUploadFile[],
  results: ItiProcessedFileResult[],
): ItiUploadFile[] {
  const resultByName = new Map(results.map((result) => [result.fileName, result]));

  return files.map((file) => {
    const result = resultByName.get(file.file.name);
    if (!result) {
      return file;
    }

    return {
      ...file,
      status: result.status,
      error: result.error,
      detectedDocumentType: result.documentType,
      confidenceScore: result.confidenceScore,
      processingMethod: result.processingMethod,
      pageCount: result.pageCount,
      warnings: result.warnings,
      blobUrl: result.blobUrl ?? file.blobUrl,
      blobPathname: result.blobPathname ?? file.blobPathname,
    };
  });
}

export function buildItiFileErrorMap(results?: ItiProcessedFileResult[]) {
  if (!results?.length) {
    return {};
  }

  return Object.fromEntries(
    results
      .filter((result) => result.error)
      .map((result) => [result.fileName, result.error as string]),
  );
}

export function isItiFileExtracting(status: ItiFileStatus) {
  return (
    status === "processing" ||
    status === "fetching_document" ||
    status === "sending_to_iti" ||
    status === "analyzing_pdf" ||
    status === "extracting_transaction_data" ||
    status === "reading_embedded_text" ||
    status === "ocr_required" ||
    status === "running_ocr" ||
    status === "analyzing_scanned_document"
  );
}

export function areItiFilesReadyForExtraction(files: ItiUploadFile[]) {
  return files.length > 0 && files.every((file) => file.status === "uploaded" && file.blobUrl);
}
