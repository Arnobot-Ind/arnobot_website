'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cycles through `words` one at a time: the current word slides out to the
 * right while the next slides in from the left, and it keeps going. The line
 * is one word tall, so the block never changes height.
 *
 * With `typing`, each word is typed out character by character once it has
 * slid in — the same typewriter as `TypingAnimation` — and the cycle waits
 * for the block to scroll into view, so the first word is typed in front of
 * the reader rather than off screen. Readers who prefer reduced motion see
 * whole words swap without sliding (the global reduced-motion rule collapses
 * the animations).
 */
export default function WordRotate({
  words,
  className,
  interval = 2600,
  typing = false,
  typingSpeed = 38,
  typingDelay = 300,
  onChange,
}: {
  readonly words: readonly string[];
  readonly className?: string;
  /** Milliseconds each word stays — once fully typed, with `typing` — before
      the next one slides in. */
  readonly interval?: number;
  /** Type each word out as it arrives instead of showing it whole. */
  readonly typing?: boolean;
  /** Milliseconds per character, with `typing`. */
  readonly typingSpeed?: number;
  /** Milliseconds the cursor waits after sliding in before the first
      character, with `typing`. */
  readonly typingDelay?: number;
  /** Called with the index of the word that has just slid in. */
  readonly onChange?: (index: number) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null });
  /** Characters of the current word typed so far. Only read with `typing`. */
  const [count, setCount] = useState(0);
  /** Whether the cycle is running: at once, or on scrolling into view with `typing`. */
  const [started, setStarted] = useState(!typing);
  const indexRef = useRef(0);

  // Read through a ref so a caller's inline `onChange` cannot restart the
  // timers on every render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const advance = useCallback(() => {
    const previous = indexRef.current;
    const next = (previous + 1) % words.length;
    indexRef.current = next;
    setCount(0);
    setState({ index: next, previous });
    onChangeRef.current?.(next);
  }, [words]);

  // With `typing`, start once, when at least a quarter of the block is on
  // screen — the same trigger as `TypingAnimation`.
  useEffect(() => {
    if (!typing) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [typing]);

  // Plain rotation: a steady interval.
  useEffect(() => {
    if (typing || !started || words.length < 2) return;
    const timer = window.setInterval(advance, interval);
    return () => window.clearInterval(timer);
  }, [typing, started, words.length, interval, advance]);

  // Typed rotation: type the word that has just slid in, hold it, then move
  // on. Each word's chain starts here afresh when the index changes. Under
  // reduced motion the whole word lands on the first tick.
  useEffect(() => {
    if (!typing || !started) return;
    const word = words[state.index] ?? '';
    const atOnce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = 0;
    let i = 0;
    const tick = () => {
      i = atOnce ? word.length : i + 1;
      setCount(i);
      if (i < word.length) timer = window.setTimeout(tick, typingSpeed);
      else if (words.length > 1) timer = window.setTimeout(advance, interval);
    };
    timer = window.setTimeout(tick, atOnce ? 0 : typingDelay);
    return () => window.clearTimeout(timer);
  }, [typing, started, state.index, words, interval, typingSpeed, typingDelay, advance]);

  // The longest word, laid out invisibly in flow, gives the block its width
  // and height; the animated words are painted over it. Without it a
  // shrink-wrapped parent would collapse to zero width and the words would
  // hang off its edge instead of centring.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  const current = words[state.index] ?? '';
  const previous = state.previous !== null ? (words[state.previous] ?? '') : null;

  return (
    <span
      ref={ref}
      className={['word-rotate', typing ? 'is-typing' : '', className ?? ''].join(' ').trim()}
      style={{ position: 'relative', display: 'inline-block' }}
      aria-live="polite"
    >
      {/* Structural styles are inline so the words stack even before the
          stylesheet arrives; style.css adds the slide animations.

          `white-space` is deliberately NOT inline. It is declared on these
          same classes in style.css, and an inline copy would outrank the
          stylesheet — which is what stopped the longest value from wrapping on
          a 320px screen, where "Client-Centric Innovation" is wider than the
          viewport. Keep it in CSS so the narrow-screen rule can release it. */}
      <span className="word-rotate-sizer" style={{ visibility: 'hidden' }} aria-hidden="true">
        {longest}
      </span>
      {/* The live region announces each word whole and once; the animated
          copies below are decorative, so a word being typed is never read
          out letter by letter. */}
      <span className="sr-only">{current}</span>
      {previous !== null ? (
        <span
          className="word-rotate-word is-leaving"
          style={{ position: 'absolute', inset: 0 }}
          key={`out-${state.previous}-${state.index}`}
          aria-hidden="true"
          onAnimationEnd={() => setState((s) => ({ ...s, previous: null }))}
        >
          {typing ? <Typed word={previous} count={previous.length} /> : previous}
        </span>
      ) : null}
      <span
        className="word-rotate-word is-entering"
        style={{ position: 'absolute', inset: 0 }}
        key={`in-${state.index}`}
        aria-hidden="true"
      >
        {typing ? <Typed word={current} count={count} /> : current}
      </span>
    </span>
  );
}

/**
 * A word typed `count` characters in, laid over an invisible copy of the
 * whole word: the block holds its final width, and on a centred line the
 * letters land left to right from where the whole word will sit instead of
 * growing out from the middle. The cursor is the global `typing-cursor`.
 */
function Typed({ word, count }: { readonly word: string; readonly count: number }) {
  return (
    <span className="word-rotate-typed" style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ visibility: 'hidden' }}>{word}</span>
      <span className="typing-text" style={{ position: 'absolute', inset: 0, textAlign: 'left' }}>
        {word.slice(0, count)}
        <span className="typing-cursor" />
      </span>
    </span>
  );
}
