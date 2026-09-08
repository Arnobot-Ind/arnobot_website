import { sql } from "./db";
import { randomId } from "./auth";

export type Role = {
  id: string;
  name: string;
  skills: string[]; // question categories this role draws from
  active: boolean;
};

type RoleRow = {
  id: string;
  name: string;
  skills: string[] | null;
  active: boolean;
};

function toRole(r: RoleRow): Role {
  return { id: r.id, name: r.name, skills: Array.isArray(r.skills) ? r.skills : [], active: r.active };
}

/** List roles. `activeOnly` limits to roles candidates can pick. */
export async function listRoles(activeOnly = false): Promise<Role[]> {
  const rows = activeOnly
    ? await sql<RoleRow[]>`SELECT id, name, skills, active FROM roles WHERE active = TRUE ORDER BY name`
    : await sql<RoleRow[]>`SELECT id, name, skills, active FROM roles ORDER BY name`;
  return rows.map(toRole);
}

export async function getRole(id: string): Promise<Role | null> {
  const rows = await sql<RoleRow[]>`SELECT id, name, skills, active FROM roles WHERE id = ${id}`;
  const row = rows[0];
  return row ? toRole(row) : null;
}

/** Distinct question categories that exist in the bank — the pickable skills. */
export async function listCategories(): Promise<string[]> {
  const rows = await sql<{ category: string }[]>`
    SELECT DISTINCT category FROM questions ORDER BY category
  `;
  return rows.map((r) => r.category);
}

function cleanSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))];
}

export async function createRole(name: string, skills: unknown): Promise<Role> {
  const id = randomId();
  const cleaned = cleanSkills(skills);
  const rows = await sql<RoleRow[]>`
    INSERT INTO roles (id, name, skills, active)
    VALUES (${id}, ${name.trim()}, ${sql.json(cleaned)}, TRUE)
    RETURNING id, name, skills, active
  `;
  const created = rows[0];
  // RETURNING on a successful INSERT always yields the row; if Postgres ever
  // hands back nothing, fail loudly rather than return a half-built Role.
  if (!created) throw new Error("Role insert returned no row");
  return toRole(created);
}

export async function updateRole(
  id: string,
  patch: { name?: string; skills?: unknown; active?: boolean }
): Promise<Role | null> {
  const current = await getRole(id);
  if (!current) return null;
  const name = patch.name !== undefined ? String(patch.name).trim() : current.name;
  const skills = patch.skills !== undefined ? cleanSkills(patch.skills) : current.skills;
  const active = patch.active !== undefined ? Boolean(patch.active) : current.active;
  const rows = await sql<RoleRow[]>`
    UPDATE roles SET name = ${name}, skills = ${sql.json(skills)}, active = ${active}
    WHERE id = ${id}
    RETURNING id, name, skills, active
  `;
  const updated = rows[0];
  return updated ? toRole(updated) : null;
}

export async function deleteRole(id: string): Promise<void> {
  await sql`DELETE FROM roles WHERE id = ${id}`;
}
