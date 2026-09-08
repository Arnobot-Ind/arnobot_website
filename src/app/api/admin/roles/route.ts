import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-guard";
import { listRoles, listCategories, createRole, updateRole, deleteRole } from "@/lib/roles";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const [roles, categories] = await Promise.all([listRoles(false), listCategories()]);
  return NextResponse.json({ roles, categories });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "Role name is required." }, { status: 400 });
  if (!Array.isArray(body?.skills) || body.skills.length === 0)
    return NextResponse.json({ error: "Pick at least one required skill." }, { status: 400 });
  const role = await createRole(name, body.skills);
  return NextResponse.json({ role });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const body = await req.json().catch(() => null);
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (body.name !== undefined && String(body.name).trim().length < 2)
    return NextResponse.json({ error: "Role name is required." }, { status: 400 });
  if (body.skills !== undefined && (!Array.isArray(body.skills) || body.skills.length === 0))
    return NextResponse.json({ error: "Pick at least one required skill." }, { status: 400 });
  const role = await updateRole(id, {
    name: body.name,
    skills: body.skills,
    active: body.active,
  });
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  return NextResponse.json({ role });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDb();
  const id = String(new URL(req.url).searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteRole(id);
  return NextResponse.json({ ok: true });
}
