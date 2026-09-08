import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin-guard";

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
  score: number | null;
  total: number | null;
  passed: boolean | null;
  breakdown: Record<string, { correct: number; total: number }> | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
};

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();

  const rows = await sql<Row[]>`
    SELECT id, email, name, phone, address, place, birth_year, grad_year,
           college, degree, cgpa, projects, role, resume_name, status, score, total,
           passed, breakdown, started_at, completed_at, created_at
    FROM applicants
    ORDER BY created_at DESC
  `;

  const url = new URL(req.url);
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
      "Score",
      "Total",
      "Percent",
      "Passed",
      "Resume",
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
        r.score ?? "",
        r.total ?? "",
        pct === "" ? "" : `${pct}%`,
        r.passed == null ? "" : r.passed ? "PASS" : "FAIL",
        r.resume_name ?? "",
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
