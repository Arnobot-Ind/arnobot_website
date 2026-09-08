import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { listRoles } from "@/lib/roles";

export const runtime = "nodejs";

/** Public: active roles a candidate can choose from (id, name, skills). */
export async function GET() {
  try {
    await ensureDb();
    const roles = await listRoles(true);
    return NextResponse.json({
      roles: roles.map((r) => ({ id: r.id, name: r.name, skills: r.skills })),
    });
  } catch (err) {
    console.error("[roles]", err);
    return NextResponse.json({ roles: [] });
  }
}
