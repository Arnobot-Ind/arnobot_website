import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Cta from '@/components/sections/Cta';
import { INSIGHTS_LIVE } from '@/data/insights';
import { cn } from '@/lib/dom';
import InsightsIndex from './InsightsIndex';
import styles from './insights.module.css';

const METADATA: Metadata = {
  title: 'Insights & Perspectives',
  description:
    'Engineering notes and field perspectives from the ARNOBOT team — autonomous robotics, industrial inspection and the systems behind them.',
};

/** While held back the route answers as the 404, so it carries the 404's title too. */
export function generateMetadata(): Metadata {
  return INSIGHTS_LIVE ? METADATA : { title: 'Page not found' };
}

/** The still behind the hero — the team mid-build, since these are notes from the workshop. */
const HERO_IMAGE = '/assets/images/article-insights-index.webp';

/**
 * /insights — the article index.
 *
 * One idea per screen, the same rhythm as the technology, careers and company
 * pages: a full-screen hero, then the category filter with the lead article,
 * then the archive grid. The filter and paging are the only stateful parts,
 * so both content screens live in `InsightsIndex`; the page itself stays
 * server-rendered.
 *
 * Note there is an older `/blog` index still in the tree, reachable only by
 * URL. This supersedes it. Nothing links to it now except a route list in
 * Header.tsx, so it can be retired or redirected here once someone decides
 * what happens to the three articles behind /blog-details.
 */
export default function InsightsPage() {
  // Held back until the posts are signed off; see INSIGHTS_LIVE.
  if (!INSIGHTS_LIVE) notFound();

  return (
    <main className={styles.page}>
      {/* 1 — Hero. `data-header-theme="dark"` tells the header to draw in
          white over the footage, and the global `on-dark` lifts the eyebrow
          to match. */}
      <section
        className={cn('on-dark', 'section-screen', styles.hero, 'reveal')}
        id="insights-hero"
        data-cinematic-hero
        data-header-theme="dark"
      >
        <div className={styles.media} aria-hidden="true">
          <img src={HERO_IMAGE} alt="" />
          <div className={styles.scrim} />
        </div>
        <div className={styles.heroInner}>
          <div className="fade-up">
            <span className="eyebrow">ARNOBOT Insights</span>
            <h1 className={cn('hero-title', styles.heroTitle)}>Insights &amp; Perspectives</h1>
            <p className={cn('hero-lead', styles.heroLead)}>
              Notes from the workshop and the field — on autonomous robotics, industrial inspection, and the
              engineering decisions behind machines built to work where people should not have to.
            </p>
            <div className={styles.heroActions}>
              <a href="#latest" className="btn btn-light">
                Read the latest
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2 and 3 — the filter with the lead article, then the archive. */}
      <InsightsIndex />

      <Cta />
    </main>
  );
}
