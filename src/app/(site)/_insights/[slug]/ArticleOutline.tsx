'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/dom';
import styles from './article.module.css';

export interface OutlineItem {
  /** The `id` of the heading it points at. */
  readonly id: string;
  readonly label: string;
}

/**
 * The sticky "In this article" rail beside the reading column on wide
 * screens: one link per section, the one the reader is in lit in the accent.
 *
 * Which entry is current is worked out from scroll position rather than an
 * IntersectionObserver: the last heading that has passed under the docked
 * header is the section being read, which stays right however fast the page
 * is flicked and however tall a section is. The CSS hides the rail below
 * 1100px, so the listener costs nothing where it is not shown.
 */
export default function ArticleOutline({ items }: { readonly items: readonly OutlineItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let frame = 0;
    const update = (): void => {
      frame = 0;
      // The docked header plus the heading's own scroll margin.
      const line = 120;
      let current = headings[0]!.id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) current = heading.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = (): void => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav className={styles.outline} aria-label="In this article">
      <span className="micro-label">In this article</span>
      <ol className={styles.outlineList}>
        {items.map((item, index) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(styles.outlineLink, isActive && styles.outlineActive)}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className={styles.outlineIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
