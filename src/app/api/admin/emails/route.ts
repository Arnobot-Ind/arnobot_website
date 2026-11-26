import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin, isErp } from "@/lib/admin-guard";

export const runtime = "nodejs";

/**
 * ?applicant=<id>  → JSON list of emails sent to that applicant (newest first)
 * ?id=<n>          → that email's HTML, exactly as sent, for viewing in a tab
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req) && !isErp(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const url = new URL(req.url);

  const one = Number(url.searchParams.get("id"));
  if (Number.isInteger(one) && one > 0) {
    const [row] = await sql<{ html: string }[]>`SELECT html FROM applicant_emails WHERE id = ${one}`;
    if (!row) return NextResponse.json({ error: "Email not found" }, { status: 404 });
    return new NextResponse(row.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Our own template with escaped text; still, allow nothing but images and inline styles.
        "Content-Security-Policy": "default-src 'none'; img-src https: data:; style-src 'unsafe-inline'",
      },
    });
  }

  const applicant = url.searchParams.get("applicant");
  if (!applicant) return NextResponse.json({ error: "applicant or id required" }, { status: 400 });
  const rows = await sql<
    {
      id: number;
      to_email: string;
      subject: string;
      body: string;
      message_id: string | null;
      sent_at: Date;
      attachment_names: string[] | null;
    }[]
  >`
    SELECT id, to_email, subject, body, message_id, sent_at, attachment_names
    FROM applicant_emails WHERE applicant_id = ${applicant}
    ORDER BY sent_at DESC
  `;
  return NextResponse.json({
    emails: rows.map((r) => ({
      id: r.id,
      to: r.to_email,
      subject: r.subject,
      body: r.body,
      messageId: r.message_id,
      sentAt: r.sent_at,
      attachmentNames: r.attachment_names ?? [],
    })),
  });
}
