export type ItiFileValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function isItiSupportedFile(file: {
  name: string;
  type: string;
  size: number;
}): ItiFileValidationResult {
  if (file.size <= 0) {
    return { ok: false, error: "File is empty." };
  }

  const lowerName = file.name.toLowerCase();
  const isPdf =
    file.type === "application/pdf" ||
    lowerName.endsWith(".pdf");

  if (isPdf) {
    return { ok: true };
  }

  if (file.type.startsWith("image/")) {
    return { ok: true };
  }

  const typeLabel = file.type || "unknown type";
  return {
    ok: false,
    error: `Unsupported file type (${typeLabel}). Upload PDFs or images only.`,
  };
}

export function partitionItiFiles<T extends { name: string; type: string; size: number }>(
  files: T[],
) {
  const supported: T[] = [];
  const unsupported: Array<{ file: T; error: string }> = [];

  for (const file of files) {
    const validation = isItiSupportedFile(file);
    if (validation.ok) {
      supported.push(file);
    } else {
      unsupported.push({ file, error: validation.error });
    }
  }

  return { supported, unsupported };
}
