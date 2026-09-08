import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Route } from 'next';
import Cta from '@/components/sections/Cta';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { INSIGHTS_BY_DATE } from '@/data/insights';
import { cn } from '@/lib/dom';
import ArticleOutline, { type OutlineItem } from './ArticleOutline';
import styles from './article.module.css';

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

/** Every post is known at build time, so all of them can be prerendered. */
export function generateStaticParams(): Array<{ slug: string }> {
  return INSIGHTS_BY_DATE.map((post) => ({ slug: post.slug }));
}

/**
 * The post list is fixed, so anything outside it is a genuine 404.
 *
 * Without this, an unknown slug still renders — `notFound()` produces the
 * right page, but Next serves it from the prerender cache with a 200, which is
 * a soft 404: crawlers index a "not found" page as a real one.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = INSIGHTS_BY_DATE.find((entry) => entry.slug === slug);
  if (!post) return { title: 'Article not found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image], type: 'article' },
  };
}

/** The anchor each body section gets, so the outline and the URL can point at it. */
const sectionId = (index: number): string => `section-${index + 1}`;
const SUMMARY_ID = 'summary';

/**
 * /insights/[slug] — one article.
 *
 * The index and this page read the same `INSIGHTS_BY_DATE` list, so a post
 * cannot appear on one and be missing from the other, and "next" here means
 * the same thing as the order the index shows. An unknown slug is a 404 rather
 * than an empty page.
 *
 * The page opens on the post's own image, full screen behind the title and
 * the brief — the same composition as every other hero on the site — then
 * the numbered body with a sticky outline beside it on wide screens, the
 * takeaways, related posts and the pager.
 */
export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const index = INSIGHTS_BY_DATE.findIndex((entry) => entry.slug === slug);
  if (index === -1) notFound();

  const post = INSIGHTS_BY_DATE[index]!;
  // Wrap around so the ends of the list are not dead ends.
  const previous = INSIGHTS_BY_DATE[(index - 1 + INSIGHTS_BY_DATE.length) % INSIGHTS_BY_DATE.length]!;
  const next = INSIGHTS_BY_DATE[(index + 1) % INSIGHTS_BY_DATE.length]!;
  const related = INSIGHTS_BY_DATE.filter(
    (entry) => entry.category === post.category && entry.slug !== slug,
  ).slice(0, 3);

  const hrefFor = (s: string) => `/insights/${s}` as Route;

  const outline: OutlineItem[] = [
    ...post.body.map((section, i) => ({ id: sectionId(i), label: section.heading })),
    { id: SUMMARY_ID, label: 'In short' },
  ];

  return (
    <main className={styles.page}>
      {/* 1 — Hero. The post's image is the whole ground; the title and brief
          sit over it. `data-cinematic-hero` is what the header measures to
          decide when to dock, `data-header-theme` flips the bar's ink to
          white over the picture, and the global `on-dark` lifts the eyebrow
          and meta line to their light variants. */}
      <header
        className={cn('on-dark', 'section-screen', styles.hero, 'reveal')}
        data-cinematic-hero
        data-header-theme="dark"
      >
        <div className={styles.media} aria-hidden="true">
          {/* The first thing on the page and the largest: fetch it ahead of
              the related thumbnails further down. */}
          <img src={post.image} alt="" fetchPriority="high" />
          <div className={styles.scrim} />
        </div>

        <div className={styles.heroInner}>
          <div className="fade-up">
            <Link href={'/insights' as Route} className={cn('link-arrow', styles.back)}>
              <ArrowLeftIcon size={16} aria-hidden="true" />
              All insights
            </Link>

            <span className="eyebrow">{post.category}</span>
            <h1 className="hero-title">{post.title}</h1>
            <p className={cn('hero-lead', styles.heroLead)}>{post.excerpt}</p>

            <div className={cn('meta-line', styles.heroMeta)}>
              <time dateTime={post.isoDate}>{post.date}</time>
              <span>{post.readTime}</span>
            </div>

            <div className={styles.heroActions}>
              <a href="#article" className="btn btn-light">
                Read the article
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 2 — The article: a sticky outline beside the reading column on wide
          screens, numbered sections, then the takeaways. */}
      <div className={styles.article} id="article">
        <ArticleOutline items={outline} />

        <article className={styles.body}>
          {post.body.map((section, i) => (
            <section className={cn(styles.section, 'reveal')} key={section.heading}>
              <span className={cn('micro-label', styles.sectionIndex)} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className={styles.sectionHeading} id={sectionId(i)}>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, p) => (
                <p className={styles.sectionText} key={p}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <aside className={cn(styles.summary, 'reveal')} aria-labelledby={SUMMARY_ID}>
            <span className="eyebrow">Summary</span>
            <h2 className={styles.summaryHeading} id={SUMMARY_ID}>
              In short
            </h2>
            <ul className={styles.summaryList}>
              {post.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </aside>
        </article>
      </div>

      {/* 3 — More in the same category, on the index's card treatment. */}
      {related.length > 0 ? (
        <section className={cn('section-screen', 'is-wash', 'is-auto', styles.related, 'reveal')}>
          <div className={styles.relatedShell}>
            <div className="section-head is-centered">
              <span className="eyebrow">Keep reading</span>
              <h2 className="section-title is-editorial">More in {post.category}</h2>
              <p className="section-lead">Other {post.category.toLowerCase()} notes from the workshop and the field.</p>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((entry) => (
                <article className={styles.relatedCard} key={entry.slug}>
                  <Link href={hrefFor(entry.slug)} className={styles.relatedLink}>
                    <span className={styles.relatedMedia}>
                      <img src={entry.image} alt="" loading="lazy" />
                    </span>
                    <span className="meta-line">
                      <time dateTime={entry.isoDate}>{entry.date}</time>
                      <span>{entry.readTime}</span>
                    </span>
                    <span className={styles.relatedTitle}>{entry.title}</span>
                    <span className={styles.relatedExcerpt}>{entry.excerpt}</span>
                    <span className={cn('link-arrow', styles.relatedRead)}>
                      Read article
                      <span className="btn-arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav className={cn(styles.pager, 'reveal')} aria-label="More articles">
        <Link href={hrefFor(previous.slug)} className={styles.pagerLink}>
          <span className={styles.pagerLabel}>
            <ArrowLeftIcon size={15} aria-hidden="true" />
            Previous
          </span>
          <span className={styles.pagerTitle}>{previous.title}</span>
        </Link>
        <Link href={hrefFor(next.slug)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
          <span className={styles.pagerLabel}>
            Next
            <ArrowRightIcon size={15} aria-hidden="true" />
          </span>
          <span className={styles.pagerTitle}>{next.title}</span>
        </Link>
      </nav>

      <Cta />
    </main>
  );
}
