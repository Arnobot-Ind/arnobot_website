import type { Metadata } from 'next';
import Link from 'next/link';
import Cta from '@/components/sections/Cta';
import ArchitectureDiagram from '@/components/sections/technology/ArchitectureDiagram';
import { cn } from '@/lib/dom';
import styles from './technology.module.css';

export const metadata: Metadata = {
  title: 'Technology',
  description:
    'Intelligent software, advanced GCS, and robust robotic ground vehicle platforms for extreme and mission-critical environments.',
};

/* ---------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

/* The four-layer architecture — its copy, wiring and motion — lives with the
   diagram in src/components/sections/technology/ArchitectureDiagram.tsx. */

/**
 * A card that opens with a photograph. The picture is the evidence for the
 * sentence under it — the sensor being described, the switch being described —
 * so each one carries real alt text rather than `alt=""`.
 */
type CardImage = { readonly image: string; readonly alt: string };

/** The onboard loop, in the order the robot runs it. One line each. */
const PERCEPTION_STEPS: ReadonlyArray<{ readonly name: string; readonly body: string } & CardImage> = [
  {
    name: 'Perceive',
    body: 'Laser, camera and inertial data fused on the robot. Detection runs onboard, not in the cloud.',
    image: '/assets/images/tech-loop-perceive.webp',
    alt: 'The sensor head on a Saibya mast in the field: a camera housing on each side, the radio antennas, and the amber warning beacon above them.',
  },
  {
    name: 'Localise',
    body: 'Centimetre-grade with a satellite fix. Its own map without one — underground, indoors, under steel.',
    image: '/assets/images/tech-loop-localise.webp',
    alt: 'The scanning laser bolted to the Saibya deck — the sensor the robot builds its own map from when there is no satellite fix.',
  },
  {
    name: 'Decide',
    body: 'Missions are an area, not a joystick input. It replans around obstacles and resumes the pass.',
    image: '/assets/images/tech-loop-decide.webp',
    alt: 'The ARNOBOT Ground Control Station with five waypoints placed across satellite imagery: a mission is handed over as ground to cover, not steered by hand.',
  },
];

/**
 * Robustness, in the same three-card rhythm as the loop above. These are
 * qualities rather than a sequence, so the small accent line carries a tag
 * instead of a step number.
 */
const RELIABILITY_POINTS: ReadonlyArray<
  { readonly tag: string; readonly name: string; readonly body: string } & CardImage
> = [
  {
    tag: 'BUILT',
    name: 'Sealed for the site',
    body: 'Enclosures, connectors and drivetrains specified for dust, water and washdown — so a shift in the mud, the rain or the dark is an ordinary day rather than an exception.',
    image: '/assets/images/tech-reliability-built.webp',
    alt: 'The Saibya drivetrain: solid field tyres on steel rims under a bolted, sealed chassis enclosure.',
  },
  {
    tag: 'SAFE',
    name: 'Faults stay local',
    body: 'Lose the link, the satellite fix or a sensor and the vehicle falls back to a safe state on its own. The reflex layer holds it there while the layers above recover.',
    image: '/assets/images/tech-reliability-safe.webp',
    alt: 'The vehicle control panel: the red emergency stop beside the battery isolator, the fuse bank and a charge gauge.',
  },
  {
    tag: 'FIELD',
    name: 'Serviceable where it works',
    body: 'Attachments come off with standard tooling, and the same core runs on every platform — so a crew trained on one robot can keep the whole fleet moving.',
    image: '/assets/images/tech-reliability-field-v2.webp',
    alt: 'An ARNOBOT engineer in a branded polo refitting a drive wheel to a UGV chassis on the bench, the battery pack open on the deck behind.',
  },
];


/* ---------------------------------------------------------------------------
   Building blocks
   -------------------------------------------------------------------------- */

/** A band shows either a looping clip or a still; never both. */
type BandSource =
  | { readonly video: string; readonly poster: string; readonly image?: undefined }
  | { readonly image: string; readonly video?: undefined; readonly poster?: undefined };

/**
 * Decorative background — a looping clip, or a still where a still says it
 * better. Every clip carries a `poster` cut from its own first frame, so the
 * band is already the right picture while the file is still arriving rather
 * than a black rectangle. `preload="metadata"` keeps the chapter markers from
 * pulling their full payload before the visitor scrolls to them; autoplay
 * fetches the rest when the element actually starts.
 *
 * `priority` is for the one band that is above the fold. The hero's still is
 * the page's largest paint, and an `img` deep in the markup is fetched at
 * default priority behind whatever the browser found first; the bands below it
 * stay lazy, since they are a scroll away.
 */
function BandMedia({
  video,
  image,
  poster,
  preload = 'metadata',
  priority = false,
}: BandSource & { readonly preload?: 'metadata' | 'auto'; readonly priority?: boolean }) {
  return (
    <div className={styles.media} aria-hidden="true">
      {image ? (
        <img
          src={image}
          alt=""
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <video autoPlay muted loop playsInline preload={preload} poster={poster}>
          <source src={video} type="video/mp4" />
        </video>
      )}
      <div className={styles.scrim} />
    </div>
  );
}

/**
 * The full-bleed video marker that opens each part of the page. Text is held to
 * the left column so the right of the frame stays clear — that open third is
 * how the reader can tell there is video playing behind the words.
 */
function ChapterBand({
  label,
  title,
  body,
  id,
  ...source
}: BandSource & {
  readonly label: string;
  readonly title: string;
  readonly body?: string;
  readonly id?: string;
}) {
  return (
    <section className={cn('on-dark', styles.band, 'reveal')} id={id} data-header-theme="dark">
      <BandMedia {...source} />
      <div className={styles.bandInner}>
        <div className="fade-up">
          <span className="eyebrow">{label}</span>
          <h2 className="hero-title">{title}</h2>
          {body ? <p className={cn('hero-lead', styles.bandBody)}>{body}</p> : null}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */

export default function TechnologyPage() {
  return (
    <main className={styles.page}>
      {/* 1 — Hero */}
      <section
        className={cn('on-dark', styles.hero, 'reveal')}
        id="tech-hero"
        data-cinematic-hero
        data-header-theme="dark"
      >
        {/* A SAIBYA holding a scrub lot on its own — the machine at work, which
            is what the page goes on to explain, and nothing of how it is built.
            A still rather than the field loop: the clip's later segments cut in
            close enough to read hardware off the deck, and an earlier cut opened
            on a gloved hand in an opened wiring bay. What the platform carries
            inside is not the site's to publish, and a single frame cannot drift
            into showing it. The subject sits right of centre, past the copy
            column, where the scrim leaves the frame open; the slow drift on
            `.media img` keeps it from reading as a flat backdrop. */}
        <BandMedia image="/assets/images/tech-hero-field-poster.webp" priority />
        <div className={styles.heroInner}>
          <div className="fade-up">
            <span className="eyebrow">ARNOBOT Technology</span>
            <h1 className={cn('hero-title', styles.heroTitle)}>The autonomy platform for critical ground</h1>
            <p className="hero-lead">
              Intelligent software, advanced ground control, and robust robotic vehicle platforms for extreme and
              mission-critical environments.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — Statement */}
      <section className={cn('section-screen', styles.center, 'reveal')}>
        <div className={cn('fade-up', styles.statementInner)}>
          <div className={cn('section-head', 'is-centered', styles.sectionHead)}>
            <span className="eyebrow">Purpose-built platforms</span>
            <h2 className="section-title is-editorial">Specialized robots.</h2>
            <p className="section-lead">
              Purpose-built robotic platforms for different missions — from compact wireless robots to heavy-duty
              and vertical-climbing systems. Built with the flexibility to operate from RC to semi-autonomous to
              fully autonomous.
            </p>
          </div>
          <Link href="/product" className="btn">
            See how it works
          </Link>
        </div>
      </section>

      {/* Critical Areas, over the Alang yard trial: ALTIUS holding the face of a
          ship hull on its tether while the two operators work from the ground,
          which is the section's point — they are down there, the robot is up
          there, and neither has the other's view. Pairs with "under a steel
          hull" in the body copy. A still rather than a clip: the band already
          carries the slow drift, and the argument is the place, not the
          movement. Cropped so the crawler and the operators hold the right of
          the frame, past the copy column. */}
      <ChapterBand
        id="tech-areas"
        label="Built for critical missions"
        title="Critical Areas"
        body="Underground, inside a vessel, along a night perimeter, under a steel hull — the ground our robots work on takes away the satellite fix, the radio link and the operator's line of sight, usually all at once."
        image="/assets/images/tech-band.webp"
      />

      {/* Hardware & Software — the architecture stack */}
      <section className={cn('section-screen', 'reveal')} id="tech-architecture">
        <div className={cn('section-head', 'is-centered', 'fade-up', styles.sectionHead)}>
          <span className="eyebrow">Hardware meets intelligence</span>
          <h2 className="section-title is-editorial">Hardware &amp; Software</h2>
          <p className="section-lead">
            One four-layer core, from remote control to full autonomy. For a new environment we change the body,
            not the intelligence.
          </p>
        </div>

        {/* The diagram assembles itself node by node once the section is in
            view, so it does not ride the section's fade-up. It is the
            section's own flex item so it can take the height left between the
            head and the pull quote and scale itself to fit one screen. */}
        <ArchitectureDiagram />

        <p className={cn('fade-up', 'd2', styles.pullQuote)}>
          Emergency stop is wired to the reflexes, not the brain — so it works even when the autonomy computer is fully
          loaded.
        </p>
      </section>

      {/* Software Overview. The band runs the GCS itself behind the words —
          the live dashboard, a completed mission with its planned and actual
          path, and a waypoint route on satellite. Real captures, drifted and
          cross-faded, so the section names the software over a picture of it. */}
      <ChapterBand
        id="tech-software"
        label="Intelligence behind every mission"
        title="Software Overview"
        body="The software runs on our platform: the operator interface, where missions are planned and monitored; the autonomy engine, which executes missions on the robot with or without a live connection; and the mission record, which is retrieved when the robot reconnects to the operator system."
        video="/assets/videos/gcs-software.mp4"
        poster="/assets/images/gcs-software-poster.webp"
      />

      {/* The onboard loop — perceive, localise, decide. */}
      <section className={cn('section-screen', 'reveal')} id="tech-loop">
        <div className={cn('section-head', 'is-centered', 'fade-up', styles.sectionHead)}>
          <span className="eyebrow">How the robot thinks</span>
          <h2 className="section-title is-editorial">Perceive. Localise. Decide.</h2>
          <p className="section-lead">One loop, running onboard — with or without a link to the control room.</p>
        </div>
        {/* Each step opens on the thing it describes — the sensors, the
            scanner, the mission drawn on the map — so the loop is shown as
            well as named. */}
        <ol className={cn('card-grid', 'fade-up', 'd1', styles.steps)}>
          {PERCEPTION_STEPS.map((step, i) => (
            <li className={cn('card-cell', styles.step)} key={step.name}>
              <img
                className={styles.stepFigure}
                src={step.image}
                alt={step.alt}
                width={1120}
                height={630}
                loading="lazy"
                decoding="async"
              />
              <span className={cn('micro-label', styles.stepIndex)}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.name}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Analytics & Operations. Copy on the left, the GCS on a laptop on the
          right — the same split as the Origin section on About. The laptop is
          drawn in CSS rather than shot, so it stays sharp at every width and
          the screen carries our own software instead of a stock desk. */}
      <section className={cn('section-screen', 'reveal')} id="tech-analytics">
        <div className={styles.showcaseSplit}>
          <div className={cn(styles.showcaseCopy, 'fade-up')}>
            <span className="eyebrow">From data to mission impact</span>
            <h2 className="section-title is-editorial">Analytics &amp; Operations</h2>
            <p className="section-lead">
              Every pass comes back as data — the map, the route it actually drove, what it saw and when. Reviewed at
              a desk, long after the robot has left the site.
            </p>
          </div>
          {/* The screen runs the GCS itself: the live dashboard, then the
              Mission Reports view of a completed run with its planned route
              drawn against the path the robot actually drove — the section's
              sentence in two pictures. Both are real captures at the screen's
              own 1440x900, so the clip needs no crop. The poster is its own
              first frame, so the screen is already showing the dashboard
              before the file lands. */}
          <figure className={cn('fade-up', 'd1', styles.showcase)}>
            <div className={styles.laptop}>
              <div className={styles.laptopLid}>
                <span className={styles.laptopCam} aria-hidden="true" />
                <div className={styles.laptopScreen}>
                  {/* The capture runs at desk pace — real time for the operator,
                      but a slow read on a page nobody stops at. At 1.75x the
                      dashboard and the mission review both land inside the time
                      the section holds attention. `videoRate` applies it:
                      playbackRate is a property, not an attribute, so it cannot
                      be set from server-rendered markup alone. */}
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    data-playback-rate="1.75"
                    poster="/assets/images/gcs-laptop-poster.webp"
                    aria-label="The ARNOBOT Ground Control Station: the live mission dashboard, then a completed mission reviewed afterwards — distance covered, time taken, waypoints reached, and the planned route drawn against the path actually driven."
                  >
                    <source src="/assets/videos/gcs-laptop.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
              <div className={styles.laptopHinge} aria-hidden="true" />
              <div className={styles.laptopBase} aria-hidden="true" />
            </div>
          </figure>
        </div>
      </section>

      {/* Robust & Reliable — the same card rhythm as the loop above, on light
          ground, so the argument sits above the spec table rather than behind
          another full-screen video. */}
      <section className={cn('section-screen', 'reveal')} id="tech-reliability">
        <div className={cn('section-head', 'is-centered', 'fade-up', styles.sectionHead)}>
          <span className="eyebrow">Built tough. Built reliable.</span>
          <h2 className="section-title is-editorial">Robust &amp; Reliable</h2>
          <p className="section-lead">
            Hardware qualified for the ground it works on, and a control chain that keeps a fault local.
          </p>
        </div>
        {/* The same figure as the loop above, letterboxed: these three
            paragraphs are twice as long, and the section still has to land in
            one screen. Each is the hardware the sentence is about — the sealed
            drivetrain, the emergency stop, the service panel. */}
        <ul className={cn('card-grid', 'fade-up', 'd1', styles.steps, styles.stepsWide)}>
          {RELIABILITY_POINTS.map((point) => (
            <li className={cn('card-cell', styles.step)} key={point.name}>
              <img
                className={styles.stepFigure}
                src={point.image}
                alt={point.alt}
                width={1120}
                height={480}
                loading="lazy"
                decoding="async"
              />
              <span className={cn('micro-label', styles.stepIndex)}>{point.tag}</span>
              <h3>{point.name}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <Cta />
    </main>
  );
}
