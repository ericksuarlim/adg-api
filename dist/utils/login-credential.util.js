"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLoginCredential = normalizeLoginCredential;
/** Trim, Unicode NFC, strip zero-width chars (common copy/paste issue). */
function normalizeLoginCredential(raw) {
    if (raw == null || typeof raw !== "string") {
        return "";
    }
    return raw.normalize("NFC").trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
}
