import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Cta from '@/components/sections/Cta';
import {
  FileTextIcon,
  RocketIcon,
  ShieldIdeaIcon,
  TargetIcon,
  TelevisionIcon,
  TrophyIcon,
} from '@/components/ui/Icons';
import TypingAnimation from '@/components/ui/TypingAnimation';
import WordRotate from '@/components/ui/WordRotate';
import { cn } from '@/lib/dom';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'Company',
  description:
    'ARNOBOT is an emerging Indian robotics startup building intelligent unmanned ground vehicles for defence, industrial, maritime, and critical infrastructure applications.',
};

/* ---------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

/**
 * The record, in the company's own published figures. This band is the only
 * place the site states the awards, filings, press and publications. Each
 * figure is a bare number under a large tinted mark: the label is the only
 * line beneath it.
 *
 * These four, in this order, are the set the company asked for, and the
 * platform count that used to open the band is gone with them: the products
 * page already states it, and the band now reads as one thing — the outside
 * record — rather than a product count followed by three distinctions. Four
 * also keeps the row on the four columns `.stats` is built for.
 *
 * Treat the numbers as published copy, not decoration. They are the company's
 * claim to make, and they are stated here as given; the internal papers count
 * some of them differently.
 */
const RECORD: ReadonlyArray<{
  readonly icon: ReactNode;
  readonly value: string;
  readonly label: string;
}> = [
  {
    icon: <TrophyIcon />,
    value: '2',
    label: 'Awards',
  },
  {
    /* A filing is protection bought for an invention, so the mark is a shield
       holding an idea rather than the lightbulb that was here — the bulb said
       "idea", which is the thing before the filing. */
    icon: <ShieldIdeaIcon />,
    value: '4',
    label: 'IPs filed',
  },
  {
    /* Media coverage, so a television rather than a newspaper: the newspaper
       sat two columns from `FileTextIcon` and the two read as the same ruled
       sheet at 40px. */
    icon: <TelevisionIcon />,
    value: '1',
    label: 'Spotlight',
  },
  {
    icon: <FileTextIcon />,
    value: '2',
    label: 'Publications',
  },
];

/**
 * The stagger the four figures land on, so the band reads across as a set
 * rather than arriving as one block. `fade-up` and `d1`–`d3` are global.
 */
const STAT_DELAY: readonly string[] = ['', 'd1', 'd2', 'd3'];

/** The mission and the vision: one statement per screen, each typed out as
    it comes into view, held for three seconds, and typed again. */
const STATEMENTS: ReadonlyArray<{
  readonly id: string;
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
}> = [
  {
    id: 'mission',
    icon: <RocketIcon size={30} />,
    title: 'Our Mission',
    body: 'To make industrial maintenance safer, smarter, and more efficient through intelligent robotics.',
  },
  {
    id: 'vision',
    icon: <TargetIcon size={30} />,
    title: 'Our Vision',
    body: 'To become a global leader in robotics-driven asset lifecycle management.',
  },
];

/** The values, on a band of their own, one at a time at display scale, each
    typed out as it slides in. */
const VALUES = [
  'Engineering Excellence',
  'Safety First',
  'Client-Centric Innovation',
  'Data-Driven Decisions',
  'Made in India',
] as const;

/* ---------------------------------------------------------------------------
   Building blocks
   -------------------------------------------------------------------------- */

/**
 * The hero band: a SAIBYA Max standing on open ground against a bright
 * treeline, mast up and beacon on, shot from ground level.
 *
 * Every constraint here is set by `.scrim` and `.media img` in the module CSS,
 * and a replacement frame has to satisfy all of them:
 *
 *  - `.scrim` washes 0.86 at the left edge down to 0 at the right, so the
 *    machine has to sit right of centre or it goes under the wash and
 *    disappears — the dark-on-dark failure the hero brief raised against the
 *    old `abt-hero.png`. This frame holds it from about 60% to 87%, inside the
 *    band `object-position: 68%` is aimed at.
 *  - The backing has to be bright, not a wall in shade, because the image runs
 *    at 0.9 opacity under that wash and a black machine needs something behind
 *    it to cut against. Here it is open sky and a sunlit treeline.
 *  - `.media img` runs the 24s `drift`, which at full scale crops about 7% off
 *    the left, 4% off the right and 6% off the top and bottom. The machine and
 *    its beacon are inside that on every edge.
 *
 * The previous frame met all three but was shot long, with the machine small
 * and the background thrown out of focus, so the band read as a snapshot
 * rather than as the opening statement of the company page. This one is from
 * the same field trial, closer and level with the ground.
 */
const HERO_BAND = '/assets/images/about-band-saibya-v2.webp';

/** Decorative background behind the hero, under the scrim the copy sits on. */
function BandMedia({ image }: { readonly image: string }) {
  return (
    <div className={styles.media} aria-hidden="true">
      <img src={image} alt="" />
      <div className={styles.scrim} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */

/** Company page. */
export default function AboutPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section
        className={cn('on-dark', styles.hero, 'reveal')}
        id="about-hero"
        data-cinematic-hero
        data-header-theme="dark"
      >
        <BandMedia image={HERO_BAND} />
        <div className={styles.heroInner}>
          <div className="fade-up">
            <span className="eyebrow">About ARNOBOT</span>
            <h1 className="hero-title">
              Where innovation
              <br />
              meets automation
            </h1>
            <p className="hero-lead">
              An Indian robotics company building intelligent unmanned ground vehicles for defence, industrial,
              maritime and critical infrastructure work — the jobs that are still done by hand, in the places people
              should not have to go.
            </p>
            <div className={styles.heroActions}>
              <Link href="/product" className="btn btn-light">
                See the platforms
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="section-screen reveal" id="about-story">
        <div className={styles.inner}>
          <div className={styles.split}>
            <div className={cn(styles.splitCopy, 'fade-up')}>
              <span className="eyebrow">Origin</span>
              <h2 className="section-title is-editorial">From ideas to impact</h2>
              <p className="section-lead">
                ARNOBOT is an emerging Indian robotics startup building intelligent unmanned ground vehicles (UGVs) for
                defence, industrial, maritime and critical infrastructure applications. By combining AI, robotics and
                autonomous technologies, we are shaping the future of unmanned mobility with safer, smarter and more
                efficient robotic solutions.
              </p>
              <p className="section-lead">
                We did not start in a lab. We started on the ground our machines are meant to protect — on plant floors,
                at height, and on the steel our robots now climb — and that is still where every platform is proven
                before it ships.
              </p>
            </div>

            <figure className={cn(styles.figure, 'fade-up', 'd1')}>
              {/* The caption beneath names the photograph, so a matching alt
                  would have it announced twice. */}
              <img src="/assets/images/abt-full.jpg" alt="" />
              <figcaption className={cn('micro-label', styles.figureCaption)}>The team, mid-build</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Mission, then vision: one statement per screen, the wash alternating. */}
      {STATEMENTS.map((statement, index) => (
        <section
          className={cn('section-screen', index % 2 === 0 && 'is-wash', 'reveal')}
          id={statement.id}
          key={statement.id}
        >
          <div className={cn(styles.statement, 'fade-up')}>
            <span className={cn('card-icon', styles.statementIcon)}>{statement.icon}</span>
            <span className="eyebrow">{statement.title}</span>
            <h2 className="section-title is-editorial">
              <TypingAnimation text={statement.body} repeatDelay={3000} />
            </h2>
          </div>
        </section>
      ))}

      {/* Values. The same light wash the mission statement sits on, so the
          three statement screens — mission, vision, values — read as one run
          rather than the last one arriving as a dark band. `is-wash` is the
          global that paints it, and with the ground light the section no
          longer declares a dark header theme: the header probes what is under
          it and draws in ink by itself. */}
      <section className={cn('section-screen', 'is-wash', styles.valuesSection, 'reveal')} id="values">
        <div className={cn(styles.values, 'fade-up')}>
          <span className="eyebrow">Our Values</span>
          <p className="value-current is-display">
            <WordRotate words={VALUES} typing />
          </p>
          {/* The last value in the rotation is "Made in India", and it is the
              one the band should still be saying when the rotation has moved
              on — so the mark is a standing line under the rotator rather than
              anything hung off it. WordRotate keeps its own absolutely
              positioned words inside a sizer, so a sibling beneath it cannot
              disturb the cycle.

              This is the Government of India "Make in India" lion, taken
              unaltered from makeinindia.com. It carries its own wordmark
              knocked out of the lion's body, so the image is the whole lockup
              and no text sits beside it. It is dark line work, and now that the
              band is light it sits straight on the wash — the white chip it
              needed over the old dark ground is gone. It is never recoloured;
              a government mark is not ours to restyle.

              Usage of this mark is conditional on DPIIT permission — that is a
              business matter, not a technical one. */}
          <p className={cn('micro-label', styles.origin)}>
            <img
              className={styles.originMark}
              src="/assets/logos/make-in-india.png"
              alt="Make in India"
              width={122}
              height={57}
            />
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-screen reveal" id="leadership">
        <div className={styles.inner}>
          <div className={cn('section-head', styles.sectionHead, 'fade-up')}>
            <span className="eyebrow">Leadership</span>
            <h2 className="section-title is-editorial">A letter from the founder</h2>
          </div>

          <div className={styles.letter}>
            <div className={cn(styles.letterBody, 'fade-up')}>
              <p>
                I am hopeful that our mission will instill the importance of our vision to our current team, as well as
                attract new engineers and partners with shared ambition. Arnobot is a mission-focused robotics company,
                and clarity around our technological focus empowers our team to make the highest-impact decisions for
                long-term safety and industrial automation.
              </p>
              <p>
                If you share our commitment to building intelligent unmanned systems for extreme environments, please
                explore our <Link href="/career">careers</Link> and technological solutions.
              </p>
              <p className={styles.letterClosing}>
                With strong engineering conviction, there is the potential to redefine autonomous robotics.
              </p>
            </div>

            <div className={cn(styles.signatory, 'fade-up', 'd1')}>
              {/* The founder at the bench with the ARNOBOT arm and a UGV, from
                  the team shoot. It replaces a crop of an awards-stage
                  photograph, which put a wall of other companies' sponsor
                  logos and a stranger's arm behind the man signing the letter
                  — the same fault the hero brief raised about using an award
                  photo where a portrait belongs.

                  Native 4:3, so `object-position` on `.portrait` is a no-op
                  here and the frame lands as it was cropped; it comes back
                  only on short viewports, where the cap crops the picture and
                  26% holds the head. */}
              <img className={styles.portrait} src="/assets/images/founder-anmol-shah.webp" alt="Anmol Shah" />
              <div className={styles.signatoryMeta}>
                <img className={styles.signature} src="/assets/images/sign1.png" alt="Anmol Shah signature" />
                <h3 className={styles.signatoryName}>Anmol Shah</h3>
                <span className={cn('micro-label', styles.signatoryRole)}>Founder &amp; CEO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Record */}
      <section className="section-screen is-wash reveal" id="about-record">
        <div className={styles.inner}>
          <div className={cn('section-head', 'is-centered', styles.sectionHead, 'fade-up')}>
            <span className="eyebrow">Record</span>
            <h2 className="section-title is-editorial">What we have built so far</h2>
          </div>

          <ul className={styles.stats}>
            {RECORD.map((entry, index) => (
              <li className={cn(styles.stat, 'fade-up', STAT_DELAY[index])} key={entry.label}>
                <span className={cn('card-icon', styles.statIcon)}>{entry.icon}</span>
                <strong className="stat-value">{entry.value}</strong>
                <span className={cn('micro-label', styles.statLabel)}>{entry.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta />
    </main>
  );
}
