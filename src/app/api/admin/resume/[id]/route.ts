import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin, isErp } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req) && !isErp(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureDb();
  const { id } = await params;

  const rows = await sql<
    { resume_name: string | null; resume_mime: string | null; resume_data: Buffer | null }[]
  >`
    SELECT resume_name, resume_mime, resume_data FROM applicants WHERE id = ${id}
  `;
  const row = rows[0];
  if (!row || !row.resume_data) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const data = Buffer.isBuffer(row.resume_data)
    ? row.resume_data
    : Buffer.from(row.resume_data as unknown as Uint8Array);

  const filename = (row.resume_name || "resume").replace(/[^\w.\-]+/g, "_");
  // Only PDFs render inline (for the dashboard's viewer); anything else an
  // applicant uploaded is forced to download so it can't run on this origin.
  // Upload only accepts .pdf/.doc/.docx names; the stored MIME is browser-supplied, so key off the name.
  const isPdf = /\.pdf$/i.test(row.resume_name || "");
  const inline = isPdf && new URL(req.url).searchParams.has("inline");
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": isPdf ? "application/pdf" : row.resume_mime || "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Length": String(data.length),
    },
  });
}
