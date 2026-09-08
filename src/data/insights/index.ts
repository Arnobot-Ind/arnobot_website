/**
 * Posts for /insights and /insights/[slug].
 *
 * Every entry is grounded in something the site already publishes — the four
 * platforms and their stated specifications in `products.ts`, the control
 * stack and field-readiness claims on the technology page, the record,
 * principles and values on the company and careers pages, the sector notes in
 * `industries.ts`, and the award register behind `recognition.ts`. Nothing
 * here asserts a capability, figure, customer or result that does not already
 * appear elsewhere on the site; where an article argues, it argues from those
 * facts rather than adding new ones.
 *
 * What is still editorial: the titles, the framing, and the publication
 * dates. Those are expected to be rewritten — but they were written against
 * the real product line rather than invented, so replacing them is an edit
 * rather than a correction.
 *
 * Images come from the site's existing library, matched to the platform or
 * sector each post is about. The article page draws the image full-bleed
 * behind the title, so every entry should point at a photograph or a render
 * with enough ground in it to sit under a scrim.
 *
 * The posts live in one file per category — `technology.ts`, `industry.ts`,
 * `company.ts`, `engineering.ts` — which is how they are easiest to edit and
 * review. Adding an entry to any of them publishes an article; the route
 * prerenders from this list and rejects anything outside it.
 */

import { COMPANY } from './company';
import { ENGINEERING } from './engineering';
import { INDUSTRY } from './industry';
import { TECHNOLOGY } from './technology';
import type { InsightCategory, InsightDraft, InsightPost } from './types';

export type { ArticleSection, InsightCategory, InsightDraft, InsightPost } from './types';

/** Filter order on the index. "All" is added by the UI. */
export const INSIGHT_CATEGORIES: readonly InsightCategory[] = [
  'Technology',
  'Industry',
  'Company',
  'Engineering',
];

/** A reading pace for prose; the figure is a label, not a promise. */
const WORDS_PER_MINUTE = 200;

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

/** Derives the read time from everything the reader actually sees on the page. */
function withReadTime(draft: InsightDraft): InsightPost {
  const words =
    countWords(draft.excerpt) +
    draft.body.reduce(
      (total, section) => total + countWords(section.heading) + section.paragraphs.reduce((n, p) => n + countWords(p), 0),
      0,
    ) +
    draft.summary.reduce((n, line) => n + countWords(line), 0);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { ...draft, readTime: `${minutes} min read` };
}

/**
 * Grouped by category, in authoring order.
 *
 * This is NOT display order — use `INSIGHTS_BY_DATE` for anything the reader
 * sees, or the index would feature whichever post happens to be written first
 * rather than the newest one.
 */
export const INSIGHTS: readonly InsightPost[] = [...TECHNOLOGY, ...INDUSTRY, ...COMPANY, ...ENGINEERING].map(
  withReadTime,
);

/**
 * Display order: newest first.
 *
 * Derived rather than hand-maintained, so the index's featured slot and the
 * article pager cannot disagree about which post is newest or what "next"
 * means. Sorting on the ISO field keeps it a string comparison.
 */
export const INSIGHTS_BY_DATE: readonly InsightPost[] = [...INSIGHTS].sort((a, b) =>
  b.isoDate.localeCompare(a.isoDate),
);
