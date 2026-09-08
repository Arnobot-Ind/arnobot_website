import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isValidEmail, normEmail } from "@/lib/auth";

export const runtime = "nodejs";

/** Lightweight pre-check: is this email allowed to start a fresh attempt? */
export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const body = await req.json().catch(() => null);
    const email = normEmail(String(body?.email || ""));
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const rows = await sql<{ status: string }[]>`
      SELECT status FROM applicants WHERE email = ${email}
    `;
    const completed = rows[0]?.status === "completed";
    return NextResponse.json({ eligible: !completed, alreadyCompleted: completed });
  } catch (err) {
    console.error("[auth]", err);
    return NextResponse.json({ error: "Service unavailable." }, { status: 500 });
  }
}
