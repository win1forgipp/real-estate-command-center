import {
  ITI_ALLOWED_EXTENSIONS,
  ITI_ALLOWED_MIME_TYPES,
  ITI_MAX_FILE_SIZE_BYTES,
  ITI_MAX_TOTAL_SIZE_BYTES,
} from "@/services/iti/constants";

export type ItiFileValidationResult =
  | { ok: true }
  | { ok: false; error: string };

function getExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex >= 0 ? lower.slice(dotIndex) : "";
}

function isHeicLike(file: { name: string; type: string }) {
  const extension = getExtension(file.name);
  return (
    extension === ".heic" ||
    extension === ".heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

export function isItiSupportedFile(file: {
  name: string;
  type: string;
  size: number;
}): ItiFileValidationResult {
  if (file.size <= 0) {
    return { ok: false, error: "File is empty." };
  }

  if (file.size > ITI_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File exceeds the ${Math.floor(ITI_MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB limit.`,
    };
  }

  const lowerName = file.name.toLowerCase();
  const extension = getExtension(lowerName);
  const mimeType = file.type.toLowerCase();

  const isPdf = mimeType === "application/pdf" || extension === ".pdf";
  if (isPdf) {
    return { ok: true };
  }

  const isJpeg =
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg" ||
    extension === ".jpg" ||
    extension === ".jpeg";
  if (isJpeg) {
    return { ok: true };
  }

  const isPng = mimeType === "image/png" || extension === ".png";
  if (isPng) {
    return { ok: true };
  }

  if (isHeicLike(file)) {
    return { ok: true };
  }

  if (
    ITI_ALLOWED_MIME_TYPES.includes(mimeType as (typeof ITI_ALLOWED_MIME_TYPES)[number]) ||
    ITI_ALLOWED_EXTENSIONS.includes(extension as (typeof ITI_ALLOWED_EXTENSIONS)[number])
  ) {
    return { ok: true };
  }

  const typeLabel = file.type || extension || "unknown type";
  return {
    ok: false,
    error: `Unsupported file type (${typeLabel}). Upload PDF, JPEG, PNG, or HEIC/HEIF only.`,
  };
}

export function validateItiSelection<T extends { name: string; type: string; size: number }>(
  incoming: T[],
  existing: T[] = [],
) {
  const errors: string[] = [];
  const supported: T[] = [];
  const unsupported: Array<{ file: T; error: string }> = [];

  const existingKeys = new Set(
    existing.map((file) => `${file.name}:${file.size}:${file.type}`),
  );

  let projectedTotal = existing.reduce((sum, file) => sum + file.size, 0);

  for (const file of incoming) {
    const duplicateKey = `${file.name}:${file.size}:${file.type}`;
    if (existingKeys.has(duplicateKey)) {
      errors.push(`${file.name} is already selected.`);
      continue;
    }

    const validation = isItiSupportedFile(file);
    if (!validation.ok) {
      unsupported.push({ file, error: validation.error });
      continue;
    }

    if (projectedTotal + file.size > ITI_MAX_TOTAL_SIZE_BYTES) {
      errors.push(
        `Adding ${file.name} would exceed the ${Math.floor(ITI_MAX_TOTAL_SIZE_BYTES / (1024 * 1024))} MB total upload limit.`,
      );
      continue;
    }

    projectedTotal += file.size;
    existingKeys.add(duplicateKey);
    supported.push(file);
  }

  return { supported, unsupported, errors };
}

export function partitionItiFiles<T extends { name: string; type: string; size: number }>(
  files: T[],
  existing: T[] = [],
) {
  return validateItiSelection(files, existing);
}

export function getItiPackageSummary(files: Array<{ size: number; status?: string }>) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const uploadedCount = files.filter((file) => file.status === "uploaded").length;
  const failedCount = files.filter((file) => file.status === "failed").length;
  const uploadingCount = files.filter((file) => file.status === "uploading").length;

  return {
    fileCount: files.length,
    totalSize,
    uploadedCount,
    failedCount,
    uploadingCount,
    allUploaded: files.length > 0 && uploadedCount === files.length,
    readyForIti: files.length > 0 && uploadedCount === files.length && failedCount === 0,
  };
}
