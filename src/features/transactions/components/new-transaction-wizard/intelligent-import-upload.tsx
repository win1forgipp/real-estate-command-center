"use client";

import { Camera, FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

type IntelligentImportUploadProps = {
  onExtract: (formData: FormData) => Promise<void>;
  isExtracting: boolean;
  errorMessage?: string | null;
};

export function IntelligentImportUpload({
  onExtract,
  isExtracting,
  errorMessage,
}: IntelligentImportUploadProps) {
  const purchaseInputRef = useRef<HTMLInputElement>(null);
  const supportingInputRef = useRef<HTMLInputElement>(null);
  const [purchaseFile, setPurchaseFile] = useState<File | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [useMock, setUseMock] = useState(false);

  const handleSubmit = async () => {
    if (!purchaseFile) {
      return;
    }

    const formData = new FormData();
    formData.append("purchaseAgreement", purchaseFile);
    supportingFiles.forEach((file) => {
      formData.append("supportingDocuments", file);
    });
    formData.append("useMock", useMock ? "true" : "false");
    await onExtract(formData);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <h3 className={typography.sectionTitle}>Purchase Agreement</h3>
        <p className={cn(typography.bodyMuted, "mt-2")}>
          Upload the main contract PDF. On mobile you can pick a file, scan a document, or
          choose from photos when supported.
        </p>
        <input
          ref={purchaseInputRef}
          type="file"
          accept="application/pdf,image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPurchaseFile(file ?? null);
          }}
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <SecondaryButton
            type="button"
            className="w-full sm:w-auto"
            onClick={() => purchaseInputRef.current?.click()}
          >
            <Upload className="size-4" />
            Choose PDF
          </SecondaryButton>
          <SecondaryButton
            type="button"
            className="w-full sm:w-auto"
            onClick={() => purchaseInputRef.current?.click()}
          >
            <Camera className="size-4" />
            Scan / Photo
          </SecondaryButton>
        </div>
        {purchaseFile ? (
          <p className={cn(typography.caption, "mt-3 flex items-center gap-2")}>
            <FileText className="size-4" />
            {purchaseFile.name}
            <button
              type="button"
              className="text-destructive"
              onClick={() => setPurchaseFile(null)}
              aria-label="Remove purchase agreement"
            >
              <X className="size-4" />
            </button>
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <h3 className={typography.sectionTitle}>Supporting Documents</h3>
        <p className={cn(typography.bodyMuted, "mt-2")}>
          Optional addenda, amendments, contingency removals, inspection responses, repair
          addenda, or closing documents.
        </p>
        <input
          ref={supportingInputRef}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setSupportingFiles((current) => [...current, ...files]);
          }}
        />
        <SecondaryButton
          type="button"
          className="mt-4 w-full sm:w-auto"
          onClick={() => supportingInputRef.current?.click()}
        >
          Add Supporting PDFs
        </SecondaryButton>
        {supportingFiles.length ? (
          <ul className="mt-3 space-y-2">
            {supportingFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className={cn(typography.caption, "flex items-center justify-between gap-2")}
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  className="text-destructive"
                  onClick={() =>
                    setSupportingFiles((current) =>
                      current.filter((entry) => entry !== file),
                    )
                  }
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={useMock}
          onChange={(event) => setUseMock(event.target.checked)}
        />
        Dev/test mode: use sample extraction (active vs archived based on filenames)
      </label>

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <PrimaryButton
        type="button"
        className="w-full sm:w-auto"
        disabled={!purchaseFile || isExtracting}
        onClick={handleSubmit}
      >
        {isExtracting ? "Extracting..." : "Extract with AI"}
      </PrimaryButton>
    </div>
  );
}
