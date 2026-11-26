const MAX_FILES = 2;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Validates the optional `attachments` of a candidate email: at most 2 PDFs
 * (a .pdf name and %PDF- bytes), 5 MB decoded in total. Throws an Error whose
 * message is safe to return as the 400 body.
 */
export function parseAttachments(raw: unknown): { filename: string; content: Buffer }[] {
  if (raw == null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_FILES) {
    throw new Error(`attachments must be a list of at most ${MAX_FILES} files`);
  }
  let total = 0;
  return raw.map((item: unknown) => {
    const { filename, contentBase64 } = (item ?? {}) as { filename?: unknown; contentBase64?: unknown };
    if (typeof filename !== "string" || !/\.pdf$/i.test(filename) || typeof contentBase64 !== "string") {
      throw new Error("each attachment needs a .pdf filename and contentBase64");
    }
    const content = Buffer.from(contentBase64, "base64");
    total += content.length;
    if (total > MAX_BYTES) throw new Error("attachments must total 5 MB or less");
    if (content.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new Error("each attachment must be a PDF file");
    }
    return { filename: filename.replace(/[^\w.-]+/g, "_"), content };
  });
}
