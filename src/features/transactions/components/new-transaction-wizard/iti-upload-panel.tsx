"use client";

import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { StatusBadge } from "@/components/design-system/badges/status-badge";
import { SecondaryButton } from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import {
  ITI_EXTRACTION_FIELDS,
  ITI_SUPPORTED_DOCUMENTS,
} from "@/services/iti/prompts";
import { cn } from "@/lib/utils";

export type ItiFileStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "parsed_successfully"
  | "review_suggested"
  | "unknown_document"
  | "failed";

export type ItiUploadFile = {
  id: string;
  file: File;
  status: ItiFileStatus;
};

const statusLabels: Record<ItiFileStatus, string> = {
  waiting: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  parsed_successfully: "Parsed Successfully",
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
  processing: "info",
  parsed_successfully: "success",
  review_suggested: "warning",
  unknown_document: "warning",
  failed: "danger",
};

type ItiUploadPanelProps = {
  files: ItiUploadFile[];
  onFilesChange: (files: ItiUploadFile[]) => void;
  setupError?: string | null;
  extractionError?: string | null;
};

function createUploadFile(file: File): ItiUploadFile {
  return {
    id: crypto.randomUUID(),
    file,
    status: "waiting",
  };
}

export function ItiUploadPanel({
  files,
  onFilesChange,
  setupError,
  extractionError,
}: ItiUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const accepted = incoming.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type.startsWith("image/") ||
          file.name.toLowerCase().endsWith(".pdf"),
      );
      if (!accepted.length) {
        return;
      }
      onFilesChange([...files, ...accepted.map(createUploadFile)]);
    },
    [files, onFilesChange],
  );

  const removeFile = (id: string) => {
    onFilesChange(files.filter((entry) => entry.id !== id));
  };

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

      {setupError ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          {setupError}
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
          addFiles(Array.from(event.dataTransfer.files));
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
          Mobile: use file picker or camera scan when supported
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
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
        <ul className="space-y-2">
          {files.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.file.name}
                  </p>
                  <p className={typography.caption}>
                    {(entry.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge
                  label={statusLabels[entry.status]}
                  variant={statusVariants[entry.status]}
                />
                <button
                  type="button"
                  className="text-destructive"
                  onClick={() => removeFile(entry.id)}
                  aria-label={`Remove ${entry.file.name}`}
                  disabled={entry.status === "uploading" || entry.status === "processing"}
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
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
          {/* TODO: Production file storage — migrate from local .data/uploads to Vercel Blob or S3-compatible storage. */}
          Document files are processed temporarily; only metadata is stored in Turso for v1.
        </p>
      </div>
    </div>
  );
}

export function updateItiFileStatuses(
  files: ItiUploadFile[],
  status: ItiFileStatus,
): ItiUploadFile[] {
  return files.map((file) => ({ ...file, status }));
}
