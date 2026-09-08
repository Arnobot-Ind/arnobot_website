import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getSettings, saveSettings } from "@/lib/settings";
import { isAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  return NextResponse.json(await getSettings());
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const body = await req.json().catch(() => null);
  const patch: Record<string, number> = {};
  for (const k of ["questionsPerTest", "passPercent", "timeLimitMin"] as const) {
    if (body && body[k] !== undefined) {
      const n = parseInt(String(body[k]), 10);
      if (!Number.isNaN(n)) patch[k] = n;
    }
  }
  // Basic sanity bounds.
  if (patch.questionsPerTest != null)
    patch.questionsPerTest = Math.min(100, Math.max(1, patch.questionsPerTest));
  if (patch.passPercent != null)
    patch.passPercent = Math.min(100, Math.max(1, patch.passPercent));
  if (patch.timeLimitMin != null)
    patch.timeLimitMin = Math.min(240, Math.max(0, patch.timeLimitMin));

  await saveSettings(patch);
  return NextResponse.json(await getSettings());
}
