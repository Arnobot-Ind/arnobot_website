import type { Cleanup } from '@/types';
import { revealOnScroll } from './revealOnScroll';
import { industrySlider } from './industrySlider';
import { marquees } from './marquee';
import { pageAnimations } from './animations';
import { closingViewport } from './closingViewport';
import { legalToc } from './legalToc';
import { videoRate } from './videoRate';

/**
 * Behaviours that operate on server-rendered markup rather than React state.
 * Each guards on the elements it needs, so the set is safe to run on every route.
 */
const BEHAVIORS: ReadonlyArray<() => Cleanup> = [
  revealOnScroll,
  pageAnimations,
  industrySlider,
  marquees,
  closingViewport,
  legalToc,
  videoRate,
];

/** Starts every behaviour and returns a single teardown for all of them. */
export function startSiteBehaviors(): Cleanup {
  const cleanups = BEHAVIORS.map((start) => start());

  return () => {
    for (const cleanup of cleanups.reverse()) {
      try {
        cleanup();
      } catch {
        // A failing teardown must not stop the rest from running.
      }
    }
  };
}
