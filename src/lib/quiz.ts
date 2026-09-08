import crypto from "crypto";
import { sql } from "./db";

export type ServedQuestion = {
  id: number;
  category: string;
  question: string;
  image: string | null;
  options: string[]; // already shuffled for display
};

// What we persist server-side per attempt so we can grade without trusting
// the client. `correct` is the index INTO THE SHUFFLED options we served.
export type SelectedMeta = { id: number; correct: number; category: string };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    // Both indices are in range by construction, but `noUncheckedIndexedAccess`
    // types every read as possibly-undefined, and a destructuring swap gives it
    // nowhere to narrow. The three-step swap through a local says the same
    // thing in a form the checker can follow.
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

type DbQuestion = {
  id: number;
  category: string;
  question: string;
  image: string | null;
  options: string[];
  correct: number;
};

/**
 * Pick `count` active questions, spread as evenly as possible across the
 * available categories, then shuffle each question's options. Returns the
 * client-safe payload plus the server-only answer key.
 *
 * When `skills` is given (a role's required categories), only questions in
 * those categories are drawn; otherwise the whole active bank is used.
 */
export async function buildQuiz(
  count: number,
  skills?: string[]
): Promise<{ served: ServedQuestion[]; key: SelectedMeta[] }> {
  const useSkills = Array.isArray(skills) && skills.length > 0;
  const rows = useSkills
    ? await sql<DbQuestion[]>`
        SELECT id, category, question, image, options, correct
        FROM questions
        WHERE active = TRUE AND category = ANY(${skills})
      `
    : await sql<DbQuestion[]>`
        SELECT id, category, question, image, options, correct
        FROM questions
        WHERE active = TRUE
      `;
  if (rows.length === 0) {
    throw new Error(
      useSkills
        ? "No active questions for the selected role's skills yet."
        : "No active questions in the bank."
    );
  }

  // Group by category, shuffle within each, then round-robin to balance.
  const byCat = new Map<string, DbQuestion[]>();
  for (const q of rows) {
    if (!byCat.has(q.category)) byCat.set(q.category, []);
    byCat.get(q.category)!.push(q);
  }
  const buckets = shuffle([...byCat.values()].map((qs) => shuffle(qs)));

  const picked: DbQuestion[] = [];
  let exhausted = false;
  while (picked.length < count && !exhausted) {
    exhausted = true;
    for (const bucket of buckets) {
      if (bucket.length) {
        picked.push(bucket.pop()!);
        exhausted = false;
        if (picked.length >= count) break;
      }
    }
  }

  const finalSet = shuffle(picked).slice(0, count);

  const served: ServedQuestion[] = [];
  const key: SelectedMeta[] = [];
  for (const q of finalSet) {
    const correctText = q.options[q.correct];
    // A `correct` index that points past the end of `options` is corrupt data —
    // an editor saved the question with fewer options than the answer key
    // expects. Serving it would put a question on the test that can never be
    // graded, so drop it rather than ship an unanswerable one.
    if (correctText === undefined) continue;
    const shuffledOptions = shuffle(q.options);
    const newCorrect = shuffledOptions.indexOf(correctText);
    served.push({
      id: q.id,
      category: q.category,
      question: q.question,
      image: q.image ?? null,
      options: shuffledOptions,
    });
    key.push({ id: q.id, correct: newCorrect, category: q.category });
  }
  return { served, key };
}

export type GradeResult = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  breakdown: Record<string, { correct: number; total: number }>;
};

/**
 * Grade the submitted answers (a map of questionId -> chosen option index)
 * against the stored answer key.
 */
export function grade(
  key: SelectedMeta[],
  answers: Record<string, number>,
  passPercent: number
): GradeResult {
  let score = 0;
  const breakdown: GradeResult["breakdown"] = {};
  for (const item of key) {
    const cat = item.category;
    if (!breakdown[cat]) breakdown[cat] = { correct: 0, total: 0 };
    breakdown[cat].total += 1;
    const chosen = answers[String(item.id)];
    if (typeof chosen === "number" && chosen === item.correct) {
      score += 1;
      breakdown[cat].correct += 1;
    }
  }
  const total = key.length;
  const percent = total ? Math.round((score / total) * 100) : 0;
  return { score, total, percent, passed: percent >= passPercent, breakdown };
}
