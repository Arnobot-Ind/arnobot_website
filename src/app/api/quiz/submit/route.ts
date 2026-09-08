import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { grade } from "@/lib/quiz";
import type { SelectedMeta } from "@/lib/quiz";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const body = await req.json().catch(() => null);
    const token = body?.token as string | undefined;
    const answers = (body?.answers ?? {}) as Record<string, number>;

    const payload = token ? verifyToken<{ id: string; n: string }>(token) : null;
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const rows = await sql<
      {
        status: string;
        attempt_token: string | null;
        selected_qids: SelectedMeta[] | null;
      }[]
    >`
      SELECT status, attempt_token, selected_qids
      FROM applicants WHERE id = ${payload.id}
    `;
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }
    // Check completion first: once submitted we clear attempt_token, so this
    // gives a clear "already submitted" rather than a generic auth error.
    if (row.status === "completed") {
      return NextResponse.json(
        { error: "This attempt has already been submitted." },
        { status: 409 }
      );
    }
    if (row.attempt_token !== payload.n) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }
    if (!row.selected_qids || row.selected_qids.length === 0) {
      return NextResponse.json({ error: "No active attempt found." }, { status: 400 });
    }

    const settings = await getSettings();
    const result = grade(row.selected_qids, answers, settings.passPercent);

    await sql`
      UPDATE applicants SET
        status = 'completed',
        score = ${result.score},
        total = ${result.total},
        passed = ${result.passed},
        breakdown = ${sql.json(result.breakdown)},
        completed_at = now(),
        attempt_token = NULL
      WHERE id = ${payload.id}
    `;

    return NextResponse.json({
      score: result.score,
      total: result.total,
      percent: result.percent,
      passed: result.passed,
      passPercent: settings.passPercent,
      breakdown: result.breakdown,
    });
  } catch (err) {
    console.error("[quiz/submit]", err);
    return NextResponse.json(
      { error: "Something went wrong submitting the quiz." },
      { status: 500 }
    );
  }
}
