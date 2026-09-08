import { sql } from "./db";

export type QuizSettings = {
  questionsPerTest: number;
  passPercent: number;
  timeLimitMin: number;
};

const DEFAULTS: QuizSettings = {
  questionsPerTest: clampInt(process.env.QUIZ_QUESTIONS_PER_TEST, 20, 1, 100),
  passPercent: clampInt(process.env.QUIZ_PASS_PERCENT, 70, 1, 100),
  timeLimitMin: clampInt(process.env.QUIZ_TIME_LIMIT_MIN, 20, 0, 240),
};

function clampInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Reads settings, overlaying any admin-set DB values on top of env defaults. */
export async function getSettings(): Promise<QuizSettings> {
  const rows = await sql<{ key: string; value: string }[]>`
    SELECT key, value FROM settings
    WHERE key IN ('questionsPerTest', 'passPercent', 'timeLimitMin')
  `;
  const out: QuizSettings = { ...DEFAULTS };
  for (const { key, value } of rows) {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && key in out) {
      (out as unknown as Record<string, number>)[key] = n;
    }
  }
  return out;
}

export async function saveSettings(patch: Partial<QuizSettings>): Promise<void> {
  const entries = Object.entries(patch).filter(
    ([, v]) => typeof v === "number" && !Number.isNaN(v)
  );
  for (const [key, value] of entries) {
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${String(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}
