import postgres from "postgres";
import { QUESTION_BANK } from "./questions";
import { OPEN_ROLES } from "../data/careers";



/**
 * Single shared Postgres client. Works with any Postgres provider via a
 * standard connection string (Vercel Postgres, Neon, Supabase, Railway, …).
 *
 * On Vercel Postgres the URL is injected as POSTGRES_URL; locally / elsewhere
 * we read DATABASE_URL. `prepare: false` keeps us compatible with transaction
 * poolers (PgBouncer) that several hosted providers put in front of Postgres.
 */
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

// `var` is required here: `declare global` needs the declarations to land on
// globalThis, which `let`/`const` do not do.
declare global {
  var __arnobot_sql: ReturnType<typeof postgres> | undefined;
  var __arnobot_init: Promise<void> | undefined;
}

export const sql =
  global.__arnobot_sql ??
  postgres(connectionString, {
    prepare: false,
    ssl: connectionString.includes("sslmode=require") ? "require" : undefined,
    idle_timeout: 20,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") global.__arnobot_sql = sql;

/**
 * Lazily create tables + seed the question bank on first use. The promise is
 * cached on the global object so concurrent requests share one init.
 */
export function ensureDb(): Promise<void> {
  if (!global.__arnobot_init) {
    global.__arnobot_init = initSchema().catch((err) => {
      // Reset so a later request can retry instead of caching the failure.
      global.__arnobot_init = undefined;
      throw err;
    });
  }
  return global.__arnobot_init;
}

async function initSchema(): Promise<void> {
  if (!connectionString) {
    throw new Error(
      "No database configured. Set DATABASE_URL (or POSTGRES_URL) — see .env.example."
    );
  }

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id           SERIAL PRIMARY KEY,
      category     TEXT NOT NULL,
      difficulty   TEXT NOT NULL DEFAULT 'medium',
      question     TEXT NOT NULL,
      image        TEXT,            -- optional diagram path/URL for visual questions
      options      JSONB NOT NULL,
      correct      INT  NOT NULL,
      active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Migration for pre-existing question tables.
  await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS image TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS applicants (
      id             TEXT PRIMARY KEY,
      email          TEXT UNIQUE NOT NULL,
      name           TEXT NOT NULL,
      phone          TEXT,
      address        TEXT,
      place          TEXT,
      birth_year     INT,
      grad_year      INT,
      college        TEXT,
      degree         TEXT,
      cgpa           TEXT,
      projects       TEXT,
      profile        JSONB,          -- full extracted/confirmed profile snapshot
      resume_name    TEXT,
      resume_mime    TEXT,
      resume_data    BYTEA,
      status         TEXT NOT NULL DEFAULT 'registered', -- registered | in_progress | completed
      selected_qids  JSONB,
      attempt_token  TEXT,
      score          INT,
      total          INT,
      passed         BOOLEAN,
      breakdown      JSONB,
      started_at     TIMESTAMPTZ,
      completed_at   TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Migrations for pre-existing applicant tables.
  for (const col of [
    "address TEXT",
    "place TEXT",
    "birth_year INT",
    "grad_year INT",
    "college TEXT",
    "degree TEXT",
    "cgpa TEXT",
    "projects TEXT",
    "profile JSONB",
    "role TEXT",
  ]) {
    await sql.unsafe(`ALTER TABLE applicants ADD COLUMN IF NOT EXISTS ${col}`);
  }

  // Roles: each names a job and the skills (question categories) it draws from.
  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      skills     JSONB NOT NULL DEFAULT '[]'::jsonb,
      active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Seed every bank category that has no questions yet (so new categories
  // reach an already-populated database without touching existing rows).
  const haveRows = await sql<{ category: string }[]>`SELECT DISTINCT category FROM questions`;
  const have = new Set(haveRows.map((r) => r.category));
  const missing = QUESTION_BANK.filter((q) => !have.has(q.category));
  if (missing.length > 0) {
    // One row at a time so `options` lands as a real jsonb ARRAY (sql.json).
    await sql.begin(async (tx) => {
      for (const q of missing) {
        await tx`
          INSERT INTO questions (category, difficulty, question, image, options, correct, active)
          VALUES (${q.category}, ${q.difficulty ?? "medium"}, ${q.question},
                  ${q.image ?? null}, ${tx.json(q.options)}, ${q.correct}, TRUE)
        `;
      }
    });
  }

  // Exam roles mirror the careers site (src/data/careers.ts) exactly: upsert
  // every open role by slug, and retire any role no longer listed there.
  const slugs = OPEN_ROLES.map((r) => r.slug);
  for (const r of OPEN_ROLES) {
    await sql`
      INSERT INTO roles (id, name, skills, active)
      VALUES (${r.slug}, ${`${r.title} – ${r.tags[1]}`}, ${sql.json([...r.skills])}, TRUE)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, skills = EXCLUDED.skills, active = TRUE
    `;
  }
  await sql`UPDATE roles SET active = FALSE WHERE id <> ALL(${slugs})`;
}
