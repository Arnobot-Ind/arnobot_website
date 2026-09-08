/**
 * Switches for whole sections of the site.
 *
 * A section that is off keeps all of its pages, data and styles — the site
 * simply behaves as though it were never published.
 */

/**
 * `/insights` and the articles under it, off while the content is rewritten.
 *
 * A route only 404s with a real 404 status if it never matches: a page that
 * calls `notFound()` has already begun streaming its response as a 200, so it
 * renders the 404 but reports success — a soft 404, the same trap the article
 * route's `dynamicParams = false` avoids. So the section is unpublished by
 * moving it out of the routing tree rather than by branching inside it:
 *
 *   `src/app/(site)/_insights/` — the leading underscore makes it a private
 *   folder, which the App Router does not route. Every file is intact.
 *
 * This flag exists for the one place that cannot see that folder: the legacy
 * redirects in `next.config.ts`, which would otherwise send `/blog` and
 * `/press-release` to a 404.
 *
 * To publish the section again:
 *   1. rename `src/app/(site)/_insights` back to `insights`;
 *   2. set this to `true`, which re-points the legacy redirects;
 *   3. uncomment the two `/insights` links in `src/data/site.ts` — `typedRoutes`
 *      rejects the literal while no such route exists, which is why they are
 *      commented out rather than filtered at runtime.
 */
export const INSIGHTS_ENABLED = false;
