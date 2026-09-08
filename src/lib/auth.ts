import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";

/** Sign an arbitrary JSON payload into a tamper-proof `base64.sig` token. */
export function signToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T = Record<string, unknown>>(token: string): T | null {
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  // Constant-time compare.
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE = "arnobot_admin";

/** The value stored in the admin cookie: a signed marker. */
export function makeAdminCookie(): string {
  return signToken({ role: "admin", v: 1 });
}

export function isValidAdminCookie(value: string | undefined): boolean {
  if (!value) return false;
  const payload = verifyToken<{ role?: string }>(value);
  return payload?.role === "admin";
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Normalise an email for storage / dedupe. */
export function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** A short, URL-safe random id for applicant primary keys. */
export function randomId(): string {
  return crypto.randomBytes(12).toString("base64url");
}
