import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isValidEmail, normEmail, randomId } from "@/lib/auth";
import { extractText, parseResume } from "@/lib/resume-parse";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

export async function POST(req: NextRequest) {
  try {
    await ensureDb();
    const form = await req.formData();
    const email = normEmail(String(form.get("email") || ""));
    const resume = form.get("resume");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json({ error: "Please choose your resume file." }, { status: 400 });
    }
    const lowerName = resume.name.toLowerCase();
    if (!ALLOWED_EXT.some((e) => lowerName.endsWith(e))) {
      return NextResponse.json({ error: "Resume must be a PDF, DOC or DOCX file." }, { status: 400 });
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: "Resume is too large (max 4 MB)." }, { status: 400 });
    }

    // Retakes are allowed: a returning candidate (even one who previously
    // completed) may re-upload and take the assessment again.
    const existing = await sql<{ id: string; status: string }[]>`
      SELECT id, status FROM applicants WHERE email = ${email}
    `;

    const buf = Buffer.from(await resume.arrayBuffer());
    const text = await extractText(buf, resume.name, resume.type || "");
    const parsed = parseResume(text);
    parsed.email = parsed.email || email;

    const fallbackName = parsed.name || email.split("@")[0] || email;
    const mime = resume.type || "application/octet-stream";

    if (existing.length) {
      await sql`
        UPDATE applicants SET
          name = ${fallbackName},
          resume_name = ${resume.name},
          resume_mime = ${mime},
          resume_data = ${buf},
          status = 'registered'
        WHERE email = ${email}
      `;
    } else {
      await sql`
        INSERT INTO applicants (id, email, name, resume_name, resume_mime, resume_data, status)
        VALUES (${randomId()}, ${email}, ${fallbackName}, ${resume.name}, ${mime}, ${buf}, 'registered')
      `;
    }

    return NextResponse.json({
      parsed,
      // Tell the UI which required fields the resume could NOT fill.
      missing: (["name", "address", "birthYear", "gradYear"] as const).filter(
        (k) => !String(parsed[k] || "").trim()
      ),
    });
  } catch (err) {
    console.error("[resume/parse]", err);
    return NextResponse.json(
      { error: "Could not process the resume. You can still fill the form manually." },
      { status: 500 }
    );
  }
}
