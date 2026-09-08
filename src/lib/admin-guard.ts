import { NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "./auth";

/** Returns true if the request carries a valid admin session cookie. */
export function isAdmin(req: NextRequest): boolean {
  return isValidAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}
