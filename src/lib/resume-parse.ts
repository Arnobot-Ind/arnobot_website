/**
 * Resume parsing — extract text from PDF/DOCX, then pattern-match candidate
 * fields. Best-effort only: whatever isn't found is left for the candidate to
 * fill in the (always-editable) profile form.
 *
 * PDF text comes out as a mostly-flat blob (no reliable line breaks), so the
 * field heuristics below are written to work on a single normalized string.
 */

export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  address: string;
  place: string;
  birthYear: string; // strings for easy form binding
  gradYear: string;
  college: string;
  degree: string;
  cgpa: string;
  projects: string;
  textChars: number; // characters extracted (0 = couldn't read the file)
};

const EMPTY: ParsedResume = {
  name: "",
  email: "",
  phone: "",
  address: "",
  place: "",
  birthYear: "",
  gradYear: "",
  college: "",
  degree: "",
  cgpa: "",
  projects: "",
  textChars: 0,
};

export async function extractText(
  buf: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const lower = filename.toLowerCase();
  try {
    if (lower.endsWith(".pdf") || mime === "application/pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      return Array.isArray(text) ? text.join("\n") : text || "";
    }
    if (lower.endsWith(".docx") || mime.includes("wordprocessingml")) {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buf);
      const docXml = zip.file("word/document.xml");
      if (!docXml) return "";
      const xml = await docXml.async("string");
      return xmlToText(xml);
    }
  } catch {
    // Fall through to empty — candidate fills the form manually.
  }
  return "";
}

function xmlToText(xml: string): string {
  return decodeEntities(
    xml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
  );
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

const SECTION_WORDS =
  "experience|work experience|education|skills?|technical skills|projects?|certifications?|achievements?|awards?|hobbies|interests|references?|summary|objective|contact|personal details|languages?|publications?|profile";

export function parseResume(raw: string): ParsedResume {
  if (!raw || raw.trim().length < 10) return { ...EMPTY };
  const out: ParsedResume = { ...EMPTY, textChars: raw.length };
  const text = raw.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
  const blob = text.replace(/\n/g, " ");
  const thisYear = new Date().getFullYear();

  // email
  const email = blob.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (email) out.email = email[0].toLowerCase();

  // phone — 10+ digit run with common separators / country code
  const phone = blob.match(/(\+?\d[\d\s().-]{8,}\d)/);
  const phoneRaw = phone?.[1];
  if (phoneRaw && phoneRaw.replace(/\D/g, "").length >= 10) {
    out.phone = phoneRaw.replace(/[^\d+]/g, "");
  }

  // name — first line if it looks like a name (DOCX), else leading caps (PDF)
  const firstLine = text.split("\n")[0]?.trim() || "";
  if (isNameLike(firstLine)) {
    out.name = titleCase(firstLine);
  } else {
    const m = blob.match(/^\s*([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})/);
    const candidate = m?.[1];
    if (candidate && !/^(resume|curriculum vitae|cv|name)\b/i.test(candidate)) {
      out.name = titleCase(candidate);
    }
  }

  // years
  const years = [...blob.matchAll(/\b(19|20)\d{2}\b/g)]
    .map((m) => parseInt(m[0], 10))
    .filter((y) => y >= 1975 && y <= thisYear + 7);
  const gradCandidates = years.filter((y) => y <= thisYear + 6);
  if (gradCandidates.length) out.gradYear = String(Math.max(...gradCandidates));

  // birth year — near DOB / born markers
  const dob = blob.match(
    /(?:d\.?o\.?b\.?|date of birth|birth\s*date|born)[^\d]{0,14}(?:\d{1,2}[\/.\-]\d{1,2}[\/.\-])?((?:19|20)\d{2})/i
  );
  if (dob?.[1]) out.birthYear = dob[1];

  // address — labelled, captured up to and including a 6-digit PIN
  let addr = "";
  const labelled = blob.match(/address\s*[:\-]?\s*([^]{4,120}?\b\d{6}\b)/i);
  if (labelled?.[1]) addr = labelled[1];
  else {
    const pinCtx = blob.match(/([A-Za-z0-9][^]{4,80}?\b\d{6}\b)/);
    if (pinCtx?.[1]) addr = pinCtx[1];
  }
  // trim a trailing section word that may have been swept in
  addr = addr.replace(new RegExp(`\\s+(${SECTION_WORDS})\\b.*$`, "i"), "").trim();
  if (addr) out.address = addr;

  // place — comma-part just before the PIN code
  if (out.address) {
    const parts = out.address.split(",").map((s) => s.trim());
    const pinIdx = parts.findIndex((s) => /\b\d{6}\b/.test(s));
    const before = pinIdx > 0 ? parts[pinIdx - 1] : undefined;
    const atPin = pinIdx === 0 ? parts[0] : undefined;
    if (before) out.place = titleCase(before.replace(/\d+/g, "").trim());
    else if (atPin) out.place = titleCase(atPin.replace(/\b\d{6}\b/, "").trim());
  }

  // college — capitalized word immediately before University/Institute/College
  const col = blob.match(/\b([A-Z][A-Za-z.&']+)\s+(University|Institute|College)\b/);
  if (col) out.college = `${col[1]} ${col[2]}`;

  // degree — qualification + field, trimmed before the college name / marks words
  const deg = blob.match(
    /\b(B\.?\s?Tech|B\.?E\.?|Bachelor[a-z ]{0,18}|M\.?\s?Tech|M\.?E\.?|Diploma|B\.?\s?Sc|M\.?\s?Sc|MBA|BCA|MCA|Ph\.?D)\b[^,\n]{0,45}/i
  );
  if (deg) {
    let d = deg[0].trim();
    // cut at the college's leading word (e.g. "...Engineering Jadavpur University")
    if (col && col[1]) d = d.replace(new RegExp(`\\s+${escapeRegExp(col[1])}\\b.*$`, "i"), "");
    // cut at college / marks / next-field keywords that may have been swept in
    d = d
      .replace(
        /\s+(University|Institute|College|School|CGPA|GPA|SGPA|Graduated|Percentage|Marks)\b.*$/i,
        ""
      )
      .trim();
    out.degree = d;
  }

  // CGPA / marks
  const cgpa = blob.match(/\b(?:cgpa|gpa|sgpa)\b[^\d]{0,6}(\d{1,2}(?:\.\d{1,2})?)/i);
  if (cgpa?.[1]) out.cgpa = cgpa[1];
  else {
    const pct = blob.match(/\b(\d{2}(?:\.\d{1,2})?)\s*%/);
    if (pct?.[1]) out.cgpa = `${pct[1]}%`;
  }

  // projects — text between a "Projects" heading and the next section
  const proj = blob.match(
    new RegExp(
      `\\bprojects?\\b[:\\-\\s]*(.+?)(?=\\b(?:${SECTION_WORDS})\\b|$)`,
      "i"
    )
  );
  const projBody = proj?.[1]?.trim();
  if (projBody && projBody.length > 3) {
    out.projects = projBody.replace(/\s+/g, " ").slice(0, 700);
  }

  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isNameLike(line: string): boolean {
  if (!line || line.includes("@") || /\d/.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 4 && /^[A-Za-z.'\- ]+$/.test(line);
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .trim();
}
