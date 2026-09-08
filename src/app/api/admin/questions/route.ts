import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

type IncomingQuestion = {
  category?: string;
  difficulty?: string;
  question?: string;
  image?: string | null;
  options?: string[];
  correct?: number;
  active?: boolean;
};

function validate(q: IncomingQuestion): string | null {
  if (!q.question || q.question.trim().length < 5) return "Question text is too short.";
  if (!Array.isArray(q.options) || q.options.length !== 4) return "Exactly 4 options are required.";
  if (q.options.some((o) => !o || !String(o).trim())) return "All 4 options must be filled.";
  if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3)
    return "`correct` must be an index 0–3.";
  if (!q.category || !q.category.trim()) return "Category is required.";
  return null;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const rows = await sql`
    SELECT id, category, difficulty, question, image, options, correct, active
    FROM questions ORDER BY category, id
  `;
  const counts = await sql<{ category: string; n: string }[]>`
    SELECT category, COUNT(*)::text AS n FROM questions WHERE active = TRUE GROUP BY category
  `;
  return NextResponse.json({ questions: rows, byCategory: counts });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const body = await req.json().catch(() => null);

  // Bulk import: { bulk: [ {category, question, options, correct, ...}, ... ] }
  const items: IncomingQuestion[] = Array.isArray(body?.bulk)
    ? body.bulk
    : body
    ? [body]
    : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "No questions supplied." }, { status: 400 });
  }

  const errors: { index: number; error: string }[] = [];
  const valid: IncomingQuestion[] = [];
  items.forEach((q, i) => {
    const err = validate(q);
    if (err) errors.push({ index: i, error: err });
    else valid.push(q);
  });

  let inserted = 0;
  if (valid.length) {
    await sql.begin(async (tx) => {
      for (const q of valid) {
        await tx`
          INSERT INTO questions (category, difficulty, question, image, options, correct, active)
          VALUES (${q.category!.trim()}, ${(q.difficulty || "medium").trim()},
                  ${q.question!.trim()}, ${q.image?.trim() || null}, ${tx.json(q.options!)},
                  ${q.correct!}, ${q.active === false ? false : true})
        `;
      }
    });
    inserted = valid.length;
  }

  return NextResponse.json({ inserted, skipped: errors.length, errors });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Toggle-only update.
  if (typeof body.active === "boolean" && body.question === undefined) {
    await sql`UPDATE questions SET active = ${body.active} WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  await sql`
    UPDATE questions SET
      category = ${body.category.trim()},
      difficulty = ${(body.difficulty || "medium").trim()},
      question = ${body.question.trim()},
      image = ${body.image?.trim() || null},
      options = ${sql.json(body.options)},
      correct = ${body.correct},
      active = ${body.active === false ? false : true}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM questions WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
