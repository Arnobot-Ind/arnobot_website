import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin, isErp } from "@/lib/admin-guard";
import { parseAttachments } from "@/lib/erp-mail";
import { sendMail } from "@/lib/email/transport";
import { renderLetter } from "@/lib/email/layout";
import { escapeHtml, nl2br } from "@/lib/validation";
import { STAGES } from "@/lib/hiring-stages";

export const runtime = "nodejs";

type Row = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  place: string | null;
  birth_year: number | null;
  grad_year: number | null;
  college: string | null;
  degree: string | null;
  cgpa: string | null;
  projects: string | null;
  role: string | null;
  resume_name: string | null;
  status: string;
  decision: string | null;
  stage: string | null;
  remarks: string | null;
  score: number | null;
  total: number | null;
  passed: boolean | null;
  breakdown: Record<string, { correct: number; total: number }> | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
};

export async function GET(req: NextRequest) {
  if (!isAdmin(req) && !isErp(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const url = new URL(req.url);
  // ?id= narrows to one applicant (the detail page); the shape stays the same.
  const oneId = url.searchParams.get("id");

  const rows = await sql<Row[]>`
    SELECT id, email, name, phone, address, place, birth_year, grad_year,
           college, degree, cgpa, projects, role, resume_name, status, decision, stage, remarks, score, total,
           passed, breakdown, started_at, completed_at, created_at
    FROM applicants
    ${oneId ? sql`WHERE id = ${oneId}` : sql``}
    ORDER BY created_at DESC
  `;

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "Name",
      "Email",
      "Phone",
      "Address",
      "Place",
      "Birth Year",
      "Grad Year",
      "College",
      "Degree",
      "CGPA/Marks",
      "Role",
      "Status",
      "Decision",
      "Stage",
      "Remarks",
      "Score",
      "Total",
      "Percent",
      "Passed",
      "Resume",
      "Started At",
      "Completed At",
    ];
    const lines = rows.map((r) => {
      const pct = r.score != null && r.total ? Math.round((r.score / r.total) * 100) : "";
      return [
        r.name,
        r.email,
        r.phone ?? "",
        r.address ?? "",
        r.place ?? "",
        r.birth_year ?? "",
        r.grad_year ?? "",
        r.college ?? "",
        r.degree ?? "",
        r.cgpa ?? "",
        r.role ?? "",
        r.status,
        r.decision ?? "pending",
        r.stage ?? "Applied",
        r.remarks ?? "",
        r.score ?? "",
        r.total ?? "",
        pct === "" ? "" : `${pct}%`,
        r.passed == null ? "" : r.passed ? "PASS" : "FAIL",
        r.resume_name ?? "",
        r.started_at ? new Date(r.started_at).toISOString() : "",
        r.completed_at ? new Date(r.completed_at).toISOString() : "",
      ]
        .map(csvCell)
        .join(",");
    });
    const csv = [header.join(","), ...lines].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="arnobot-applicants.csv"`,
      },
    });
  }

  const stats = {
    total: rows.length,
    completed: rows.filter((r) => r.status === "completed").length,
    passed: rows.filter((r) => r.passed === true).length,
  };

  return NextResponse.json({
    stats,
    applicants: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      phone: r.phone,
      address: r.address,
      place: r.place,
      birthYear: r.birth_year,
      gradYear: r.grad_year,
      college: r.college,
      degree: r.degree,
      cgpa: r.cgpa,
      projects: r.projects,
      role: r.role,
      resumeName: r.resume_name,
      status: r.status,
      decision: r.decision,
      stage: r.stage,
      remarks: r.remarks,
      score: r.score,
      total: r.total,
      percent: r.score != null && r.total ? Math.round((r.score / r.total) * 100) : null,
      passed: r.passed,
      breakdown: r.breakdown,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      createdAt: r.created_at,
    })),
  });
}

/** Partial update of the admin-owned fields: decision, stage, remarks. */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req) && !isErp(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const patch: { decision?: string | null; stage?: string | null; remarks?: string | null } = {};
  if ("decision" in body) {
    if (body.decision !== null && body.decision !== "accepted" && body.decision !== "rejected") {
      return NextResponse.json({ error: "decision must be accepted, rejected or null" }, { status: 400 });
    }
    patch.decision = body.decision;
  }
  if ("stage" in body) {
    if (body.stage !== null && !(STAGES as readonly string[]).includes(body.stage)) {
      return NextResponse.json({ error: `stage must be one of: ${STAGES.join(", ")}` }, { status: 400 });
    }
    patch.stage = body.stage;
  }
  if ("remarks" in body) {
    patch.remarks = body.remarks == null ? null : String(body.remarks).slice(0, 5000);
  }
  if (!id || Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "id and at least one of decision, stage, remarks required" }, { status: 400 });
  }
  await sql`UPDATE applicants SET ${sql(patch)} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

/** Emails a candidate from contact@arnobot.in. The address comes from the DB, never the client. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req) && !isErp(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const subject = String(body.subject || "").trim().slice(0, 200);
  const text = String(body.body || "").trim().slice(0, 10000);
  if (!id || !subject || !text) {
    return NextResponse.json({ error: "id, subject and body are required" }, { status: 400 });
  }
  let attachments: ReturnType<typeof parseAttachments>;
  try {
    attachments = parseAttachments(body.attachments);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
  const [a] = await sql<{ name: string; email: string }[]>`SELECT name, email FROM applicants WHERE id = ${id}`;
  if (!a) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  const html = renderLetter({ title: escapeHtml(subject), bodyHtml: nl2br(escapeHtml(text)) });
  let messageId: string | undefined;
  try {
    messageId = await sendMail({
      fromName: "ARNOBOT Hiring",
      to: { name: a.name, address: a.email },
      subject,
      text,
      html,
      attachments,
    });
  } catch (err) {
    console.error("[admin] candidate mail failed", err);
    return NextResponse.json({ error: "Mail could not be sent. Check the SMTP settings." }, { status: 502 });
  }
  // Logged only after a successful send, so the Emails tab never lists a mail that didn't go out.
  await sql`
    INSERT INTO applicant_emails (applicant_id, to_email, subject, body, html, message_id, attachment_names)
    VALUES (${id}, ${a.email}, ${subject}, ${text}, ${html}, ${messageId ?? null},
            ${sql.json(attachments.map((f) => f.filename))})
  `;
  return NextResponse.json({ ok: true, messageId: messageId ?? null });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const id = String(new URL(req.url).searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM applicants WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
