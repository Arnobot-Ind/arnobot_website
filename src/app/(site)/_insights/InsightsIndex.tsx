'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { INSIGHT_CATEGORIES, INSIGHTS_BY_DATE, type InsightCategory, type InsightPost } from '@/data/insights';
import { cn } from '@/lib/dom';
import styles from './insights.module.css';

type Filter = 'All' | InsightCategory;

const articleHref = (slug: string) => `/insights/${slug}` as Route;

const FILTERS: readonly Filter[] = ['All', ...INSIGHT_CATEGORIES];

/**
 * Cards per archive page. Three is one row of the grid at desktop width, so a
 * page of the archive is exactly one screen: the head, a row of cards, the
 * pager.
 */
const PAGE_SIZE = 3;

/**
 * How many slots the pager draws before it starts eliding: the first and last
 * page, and a run of five around the current one.
 */
const PAGER_SLOTS = 7;

/** One slot of the pager — a page number, or an ellipsis standing in for a run of them. */
type PagerSlot = number | 'gap-start' | 'gap-end';

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * The page numbers to draw. Every page gets a button while they fit; past
 * that, the first and last stay put and the run slides with the current page,
 * so the reader can always jump to either end or step to a neighbour. Near an
 * edge the run extends instead of eliding, which keeps the row the same width
 * from page to page and stops the buttons shifting under the pointer.
 */
function pagerSlots(current: number, total: number): PagerSlot[] {
  if (total <= PAGER_SLOTS) return range(1, total);
  const run = PAGER_SLOTS - 2;
  if (current < run) return [...range(1, run), 'gap-end', total];
  if (current > total - run + 1) return [1, 'gap-start', ...range(total - run + 1, total)];
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', total];
}

/**
 * The one line under a title: when it was published. The global `meta-line`
 * with a single item, so it sits at the same size and colour as every other
 * meta line on the site.
 */
function Dateline({ post }: { readonly post: InsightPost }) {
  return (
    <div className="meta-line">
      <time dateTime={post.isoDate}>{post.date}</time>
    </div>
  );
}

/**
 * Every post has a page, so the whole card is the link to it. The card is
 * the picture, the title and the date, and nothing else — the brief and the
 * category are the article's to tell.
 */
function Card({ post }: { readonly post: InsightPost }) {
  return (
    <article className={styles.card}>
      <Link href={articleHref(post.slug)} className={styles.cardLink}>
        <span className={styles.cardMedia}>
          <img src={post.image} alt="" loading="lazy" />
        </span>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <Dateline post={post} />
      </Link>
    </article>
  );
}

/**
 * The two content screens under the hero. Both are rendered here rather than
 * in the page because one filter drives both: the newest of the selection
 * leads the first screen, the rest fill the second, a page at a time.
 *
 * Both sections stay mounted whatever the filter yields. The scroll reveal
 * observes `.reveal` sections once, at page load — a section that unmounted
 * and came back would never be marked visible, and its `fade-up` children
 * would stay hidden.
 */
export default function InsightsIndex() {
  const [filter, setFilter] = useState<Filter>('All');
  const [page, setPage] = useState(1);
  // Whether the reader has turned a page since the filter was last set. The
  // grid fades between pages, but not on first paint (the scroll reveal owns
  // that) and not on a filter change (the archive may still be below the fold,
  // hidden by the reveal, and an animation would flash it).
  const [turned, setTurned] = useState(false);

  const posts = useMemo(
    () =>
      filter === 'All' ? INSIGHTS_BY_DATE : INSIGHTS_BY_DATE.filter((post) => post.category === filter),
    [filter],
  );

  // The newest of whatever is selected leads the page; the rest fill the grid.
  const [featured, ...rest] = posts;
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const shown = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const choose = (next: Filter): void => {
    setFilter(next);
    // A new filter is a new list — its third page may not exist, and its
    // newest posts are only on the first.
    setPage(1);
    setTurned(false);
  };

  // The viewport stays where it is: the cards swap in place under the reader's
  // eye, the way the filter above swaps the lead. Scrolling the head back into
  // view on every turn was tried and felt like a jolt.
  const turnTo = (next: number): void => {
    if (next < 1 || next > pageCount || next === page) return;
    setPage(next);
    setTurned(true);
  };

  return (
    <>
      {/* 2 — The filter and the lead article */}
      <section className="section-screen reveal" id="latest">
        <div className={styles.shell}>
          <div className={cn('section-head is-centered', styles.sectionHead, 'fade-up')}>
            <span className="eyebrow">Latest</span>
            <h2 className="section-title is-editorial">Start with the newest</h2>
            <p className="section-lead">
              Pick a category, or read across all of them. The most recent article leads; the rest of the archive
              follows below.
            </p>
          </div>

          {/* Toggle buttons, not tabs. The ARIA tab pattern would promise
              arrow-key roving focus and a tabpanel for each control, and there
              is neither — `aria-pressed` says what these actually are. */}
          <div className="fade-up d1">
            <div className={styles.filters} role="group" aria-label="Filter insights by category">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={filter === option}
                  className={cn(styles.filter, option === filter && styles.filterActive)}
                  onClick={() => choose(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* The count is announced so filtering is not a silent change for
                anyone using a screen reader. */}
            <p className={styles.count} role="status">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              {filter === 'All' ? '' : ` in ${filter}`}
            </p>
          </div>

          {featured ? (
            <article className={cn(styles.featured, 'fade-up', 'd2')}>
              <Link href={articleHref(featured.slug)} className={styles.featuredLink}>
                <span className={styles.featuredMedia}>
                  <img src={featured.image} alt="" />
                </span>
                <span className={styles.featuredBody}>
                  <h3 className={styles.featuredTitle}>{featured.title}</h3>
                  <Dateline post={featured} />
                </span>
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      {/* 3 — The archive, three cards a page */}
      <section className="section-screen is-wash reveal" id="articles">
        <div className={styles.shell}>
          <div className={cn('section-head is-centered', styles.sectionHead, 'fade-up')}>
            <span className="eyebrow">Archive</span>
            <h2 className="section-title is-editorial">
              {filter === 'All' ? 'Everything else we have written' : `More in ${filter}`}
            </h2>
          </div>

          {shown.length > 0 ? (
            // Keyed on the page so a turn remounts the grid and the fade plays
            // again; a remount is the only way to restart a CSS animation.
            <div key={`${filter}-${page}`} className={cn(styles.grid, 'fade-up', 'd1', turned && styles.pageIn)}>
              {shown.map((post) => (
                <Card post={post} key={post.slug} />
              ))}
            </div>
          ) : (
            <p className={cn(styles.emptyNote, 'fade-up', 'd1')}>
              That is the only article in {filter} so far.
            </p>
          )}

          {/* The steppers at either end stay in the tab order (`aria-disabled`,
              not `disabled`), so focus does not fall off the page when the
              last step lands on one. The status line is read out on every
              turn; on a phone it also stands in for the numbers. */}
          {pageCount > 1 ? (
            <nav className={styles.pager} aria-label="Archive pages">
              <button
                type="button"
                className={cn('icon-btn', styles.pagerStep)}
                aria-label="Previous page"
                aria-disabled={page === 1}
                onClick={() => turnTo(page - 1)}
              >
                <ChevronLeftIcon size={20} />
              </button>

              <ol className={styles.pagerList}>
                {pagerSlots(page, pageCount).map((slot) =>
                  typeof slot === 'number' ? (
                    <li key={slot}>
                      <button
                        type="button"
                        className={styles.pagerPage}
                        aria-label={`Page ${slot}`}
                        aria-current={slot === page ? 'page' : undefined}
                        onClick={() => turnTo(slot)}
                      >
                        {slot}
                      </button>
                    </li>
                  ) : (
                    <li key={slot} className={styles.pagerGap} aria-hidden="true">
                      &hellip;
                    </li>
                  ),
                )}
              </ol>

              <p className={styles.pagerStatus} role="status">
                Page {page} of {pageCount}
              </p>

              <button
                type="button"
                className={cn('icon-btn', styles.pagerStep)}
                aria-label="Next page"
                aria-disabled={page === pageCount}
                onClick={() => turnTo(page + 1)}
              >
                <ChevronRightIcon size={20} />
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
