import { NextRequest, NextResponse } from "next/server";
import { ensureDb, sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
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
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": row.resume_mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(data.length),
    },
  });
}
