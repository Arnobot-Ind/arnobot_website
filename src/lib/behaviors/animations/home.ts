import { gsap } from '@/lib/gsap';
import { queryAll } from '@/lib/dom';

const PLAY_ONCE = { toggleActions: 'play none none none' } as const;

/**
 * Hero entrance timeline plus scroll parallax.
 *
 * Also runs on the product pages, which reuse the `.hero` markup — that was true
 * of the original script too.
 */
function heroSection(): void {
  if (!document.querySelector('.hero')) return;

  const timeline = gsap.timeline();

  /* The hero's backdrop layer. It is an `<img class="hero-bg">` on the product
     pages and a `<video class="hero-video">` on the home page, so both are
     resolved here — and, like `.hero-play` below, resolved up front and skipped
     when nothing matches, because an empty selector is a GSAP console warning on
     every page load rather than a silent no-op. */
  const heroMedia = queryAll('.hero-bg, .hero-video');

  if (heroMedia.length > 0) {
    timeline.from(heroMedia, { scale: 1.12, duration: 1.8, ease: 'power3.out' });
  }
  /* The logo is deliberately NOT in this timeline. The glyph tile paints
     itself through CSS (interactions.css) and the reference bar's mark just
     sits; a GSAP `.from` here re-captured a mid-animation opacity on
     re-init and wedged the mark invisible. */
  /* Every hero's copy is server-rendered markup, which is what this whole
     layer is for — see the note at the head of src/lib/behaviors/index.ts. A
     hero whose copy is owned by a React client component cannot be animated
     from here: the tween applies its from-state, React commits the subtree
     around it, and the headline stays wedged at opacity 0 with no second
     chance. Keep it that way, or move the entrance into CSS on the element. */
  timeline.from('.hero-content .eyebrow', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' }, '-=0.8');
  timeline.from('.hero h1', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.6');

  /* The play affordance: the product hero's play glyph — which only renders
     for a product shipping no still, so it is absent whenever every product has
     one, and never on the home page. Resolved up front and skipped when nothing
     matches, because an empty selector is a GSAP console warning on every page
     load, not a silent no-op.

     `-=0.2` rather than the old `-=0.6`: this used to follow two tweens on
     `.hero-sub` and `.hero-actions`, markup the rebuild does not have. They
     matched nothing but still held their 0.4s of timeline, so removing them
     would have pulled this entrance that much earlier. It still lands at 1.0s. */
  const playTargets = queryAll('.hero-play');
  if (playTargets.length > 0) {
    // fromTo, not from: React's dev-mode double effect re-creates this timeline, and
    // a plain `from` would capture the half-scaled mid-flight value as its end state
    // and pin the trigger there for good.
    timeline.fromTo(
      playTargets,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.2',
    );
  }

  if (heroMedia.length > 0) {
    gsap.to(heroMedia, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  gsap.to('.hero-content', {
    yPercent: -12,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: true },
  });

  const playGlyph = document.querySelector('.hero-play');
  if (playGlyph) {
    gsap.to(playGlyph, {
      scale: 0.8,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 50%', scrub: true },
    });
  }
}

function aboutSection(): void {
  if (!document.querySelector('.about')) return;

  if (document.querySelector('.about-img')) {
    gsap.from('.about-img', {
      opacity: 0,
      scale: 0.92,
      y: 40,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.about', start: 'top 80%', ...PLAY_ONCE },
    });
  }

  gsap.from('.about-copy > *', {
    opacity: 0,
    x: 40,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.about', start: 'top 75%', ...PLAY_ONCE },
  });
}

function productsSection(): void {
  if (!document.querySelector('.products')) return;

  gsap.from('.product-head > *', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.products', start: 'top 80%', ...PLAY_ONCE },
  });

  gsap.from('.product-card-link', {
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.product-grid', start: 'top 85%', ...PLAY_ONCE },
  });
}

function environmentSection(): void {
  if (!document.querySelector('.environment')) return;

  gsap.from('.environment h2', {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.environment', start: 'top 75%', ...PLAY_ONCE },
  });

  gsap.to('.environment-bg', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.environment', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

function industriesSection(): void {
  if (!document.querySelector('.industries')) return;

  gsap.from('.industries-head > *', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.industries', start: 'top 80%', ...PLAY_ONCE },
  });

  gsap.from('.industry', {
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.industries', start: 'top 85%', ...PLAY_ONCE },
  });
}

function ctaSection(): void {
  if (!document.querySelector('.cta')) return;

  // fromTo, not from: a re-run of this module (React's dev double effect) would
  // let `from` capture the mid-flight scale as its end value and strand the
  // container at ~0.99, knocking it a few px off the section gutter.
  gsap.fromTo(
    '.cta-container',
    { opacity: 0, scale: 0.96, y: 30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.cta', start: 'top 85%', ...PLAY_ONCE },
    },
  );
}

export function homeAnimations(): void {
  heroSection();
  aboutSection();
  productsSection();
  environmentSection();
  industriesSection();
  ctaSection();
}
