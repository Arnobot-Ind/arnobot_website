import crypto from "crypto";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "./auth";

/** Returns true if the request carries a valid admin session cookie. */
export function isAdmin(req: NextRequest): boolean {
  return isValidAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}

/**
 * Returns true if the request carries `Authorization: Bearer <ERP_API_TOKEN>`.
 * Accepted on the applicant routes only (list, update, email, resume, email log).
 * An unset or short token (under 32 characters) refuses every request.
 */
export function isErp(req: NextRequest): boolean {
  const token = process.env.ERP_API_TOKEN || "";
  if (token.length < 32) return false;
  // Hashing first makes the compare constant-time whatever the header's length.
  const hash = (s: string) => crypto.createHash("sha256").update(s).digest();
  return crypto.timingSafeEqual(hash(req.headers.get("authorization") || ""), hash(`Bearer ${token}`));
}
