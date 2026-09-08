import { Disposer, queryAll } from '@/lib/dom';
import type { Cleanup } from '@/types';

/**
 * Applies `data-playback-rate` to the video that carries it.
 *
 * Playback rate is a property of the media element, not an attribute, so it
 * cannot be set in the server-rendered markup the way `muted` or `loop` can —
 * it has to be assigned once the element exists. This reads the number off the
 * markup so the page stays the place the speed is declared.
 *
 * Set on every `loadedmetadata` rather than once on mount: the browser resets
 * `playbackRate` to 1 whenever it loads a new source, and a looping video that
 * gets evicted from the media cache and reloaded would otherwise silently drop
 * back to normal speed partway down the page.
 */
export function videoRate(): Cleanup {
  const disposer = new Disposer();

  const videos = queryAll<HTMLVideoElement>('video[data-playback-rate]');
  if (videos.length === 0) return disposer.cleanup;

  for (const video of videos) {
    const rate = Number(video.dataset.playbackRate);
    // Guard the parse: a typo in the markup should leave the clip at its
    // natural speed, not throw or wind it to zero and look like a frozen frame.
    if (!Number.isFinite(rate) || rate <= 0) continue;

    const apply = () => {
      video.playbackRate = rate;
    };

    apply();
    disposer.on(video, 'loadedmetadata', apply);
  }

  return disposer.cleanup;
}
