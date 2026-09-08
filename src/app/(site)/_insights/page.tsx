import type { Metadata } from 'next';
import Cta from '@/components/sections/Cta';
import { cn } from '@/lib/dom';
import InsightsIndex from './InsightsIndex';
import styles from './insights.module.css';

export const metadata: Metadata = {
  title: 'Insights & Perspectives',
  description:
    'Engineering notes and field perspectives from the ARNOBOT team — autonomous robotics, industrial inspection and the systems behind them.',
};

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
 * This supersedes the old `/blog` index and the `/blog-details?id=` articles
 * behind it. Those routes are gone from the tree, and `next.config.ts` now
 * redirects both — and their `.php` ancestors — here, so the addresses the
 * site published before the change still land somewhere.
 */
export default function InsightsPage() {
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
