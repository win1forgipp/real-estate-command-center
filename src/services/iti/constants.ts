export const ITI_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const ITI_MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024;

export const ITI_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const ITI_ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".heic", ".heif"] as const;

export const ITI_BLOB_TEMP_PREFIX = "iti/temporary";
