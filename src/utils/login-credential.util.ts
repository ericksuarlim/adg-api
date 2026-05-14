/** Trim, Unicode NFC, strip zero-width chars (common copy/paste issue). */
export function normalizeLoginCredential(raw: string | undefined | null): string {
  if (raw == null || typeof raw !== "string") {
    return "";
  }
  return raw.normalize("NFC").trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}
