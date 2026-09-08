import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildQuiz } from "@/lib/quiz";
import { getRole } from "@/lib/roles";
import { isValidEmail, normEmail, signToken } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";

type Profile = {
  name?: string;
  phone?: string;
  address?: string;
  place?: string;
  birthYear?: string;
  gradYear?: string;
  college?: string;
  degree?: string;
  cgpa?: string;
  projects?: string;
};

function toYear(v: string | undefined): number | null {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 1900 && n <= 2100 ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const body = await req.json().catch(() => null);
    const email = normEmail(String(body?.email || ""));
    const profile = (body?.profile || {}) as Profile;
    const roleId = String(body?.roleId || "").trim();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    // Required profile fields (the four the resume form must end up with).
    const name = String(profile.name || "").trim();
    const address = String(profile.address || "").trim();
    const birthYear = toYear(profile.birthYear);
    const gradYear = toYear(profile.gradYear);
    const missing: string[] = [];
    if (name.length < 2) missing.push("name");
    if (address.length < 4) missing.push("address");
    if (!birthYear) missing.push("birthYear");
    if (!gradYear) missing.push("gradYear");
    if (missing.length) {
      return NextResponse.json(
        { error: "Please complete all required details.", missing },
        { status: 400 }
      );
    }

    const rows = await sql<{ id: string; status: string }[]>`
      SELECT id, status FROM applicants WHERE email = ${email}
    `;
    if (!rows.length) {
      return NextResponse.json(
        { error: "Please upload your resume before starting.", needResume: true },
        { status: 400 }
      );
    }
    // Retakes are allowed. The UPDATE below resets the previous attempt
    // (score/status/token) so a completed candidate can start fresh.

    // Resolve the chosen role (if any) to the skills its questions draw from.
    let skills: string[] | undefined;
    let roleName: string | null = null;
    if (roleId) {
      const role = await getRole(roleId);
      if (!role || !role.active) {
        return NextResponse.json(
          {
            error: "The selected role is no longer available. Please choose a role again.",
            roleGone: true,
          },
          { status: 400 }
        );
      }
      skills = role.skills;
      roleName = role.name;
    }

    const settings = await getSettings();
    const { served, key } = await buildQuiz(settings.questionsPerTest, skills);
    const nonce = crypto.randomBytes(8).toString("hex");

    await sql`
      UPDATE applicants SET
        name = ${name},
        phone = ${String(profile.phone || "").trim() || null},
        address = ${address},
        place = ${String(profile.place || "").trim() || null},
        birth_year = ${birthYear},
        grad_year = ${gradYear},
        college = ${String(profile.college || "").trim() || null},
        degree = ${String(profile.degree || "").trim() || null},
        cgpa = ${String(profile.cgpa || "").trim() || null},
        projects = ${String(profile.projects || "").trim() || null},
        profile = ${sql.json(profile as unknown as Record<string, string>)},
        role = ${roleName},
        status = 'in_progress',
        selected_qids = ${sql.json(key)},
        attempt_token = ${nonce},
        started_at = now(),
        score = NULL, total = NULL, passed = NULL, breakdown = NULL, completed_at = NULL
      WHERE email = ${email}
    `;

    // The UPDATE above matched this email, so the row exists; the check keeps
    // `noUncheckedIndexedAccess` happy and turns a silent undefined id — which
    // would mint a token nothing can verify — into an honest 500.
    const applicantId = rows[0]?.id;
    if (applicantId === undefined) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 500 });
    }
    const token = signToken({ id: applicantId, n: nonce });

    return NextResponse.json({
      token,
      timeLimitMin: settings.timeLimitMin,
      passPercent: settings.passPercent,
      total: served.length,
      questions: served, // includes optional `image`, never the correct answer
    });
  } catch (err) {
    console.error("[quiz/start]", err);
    return NextResponse.json(
      { error: "Something went wrong starting the assessment. Please try again." },
      { status: 500 }
    );
  }
}
