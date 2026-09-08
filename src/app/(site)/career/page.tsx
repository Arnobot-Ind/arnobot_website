import type { Metadata } from 'next';
import Link from 'next/link';
import { HIRING_PROCESS, type HiringStepIcon } from '@/data/careers';
import { ClockIcon, FactoryIcon, FileTextIcon, PhoneIcon, WrenchIcon } from '@/components/ui/Icons';
import { SITE } from '@/data/site';
import { cn } from '@/lib/dom';
import FacilityCarousel from './FacilityCarousel';
import styles from './career.module.css';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Build the robots that go where people shouldn’t — why the work matters, who you would work with, and the open roles in Ahmedabad.',
};

/* ---------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

/**
 * The team cards. Real names, real areas, and the one thing each person shipped
 * in the quarter — the section only works while that stays current, so refresh
 * `shipped` each quarter rather than letting a card go stale.
 */
const PEOPLE: ReadonlyArray<{ readonly name: string; readonly role: string; readonly shipped: string }> = [
  {
    name: 'Prijen Balar',
    role: 'Duct Cleaning & SAIBYA',
    shipped: 'The duct-cleaning system, with the SAIBYA platform work running alongside it.',
  },
  {
    name: 'Harshil Shah',
    role: 'Software & Website',
    shipped: 'Operator software for the duct-cleaning platform, and the rebuild of this site.',
  },
  {
    name: 'Noman Menon',
    role: 'Hardware & Documentation',
    shipped: 'Duct-cleaning hardware, and the documentation a customer runs the machine from.',
  },
];

/**
 * The four rooms of the Ahmedabad workshop — where the roles are based.
 * Every photograph is of the actual floor, not a stock lab.
 */
const ROOMS: ReadonlyArray<{ readonly image: string; readonly label: string; readonly note: string }> = [
  {
    image: '/assets/images/designassmbly.webp',
    label: 'Design & Assembly',
    note: 'Mechanical design, and the build and teardown of every platform.',
  },
  {
    image: '/assets/images/lab.webp',
    label: 'Electronics Lab',
    note: 'Boards, harnesses and the bench each sensor is brought up on.',
  },
  {
    image: '/assets/images/facility-prototyping.webp',
    label: 'Prototyping Lab',
    note: 'Fixtures, first articles and the parts that are still changing.',
  },
  {
    image: '/assets/images/facility-software.webp',
    label: 'Software Development',
    note: 'Autonomy, operator software and the report at the end of a mission.',
  },
];

/** The pictogram on each hiring-step card, by the key the data names. */
const STEP_ICONS: Record<HiringStepIcon, typeof FileTextIcon> = {
  form: FileTextIcon,
  call: PhoneIcon,
  build: WrenchIcon,
  visit: FactoryIcon,
};

/* ---------------------------------------------------------------------------
   Building blocks
   -------------------------------------------------------------------------- */

/**
 * Decorative media behind the hero and the pull stat, matching the treatment
 * on the technology page: looping footage (`video`, with a `poster` cut from
 * its own first frame) or a still (`image`), both with the same slow drift.
 * `scrim` is the gradient laid over it; the default is the hero's
 * left-weighted one.
 */
function BandMedia({
  video,
  image,
  poster,
  preload = 'metadata',
  scrim = styles.scrim,
}: {
  readonly video?: string;
  readonly image?: string;
  readonly poster?: string;
  readonly preload?: 'metadata' | 'auto';
  readonly scrim?: string;
}) {
  return (
    <div className={styles.media} aria-hidden="true">
      {image ? (
        <img src={image} alt="" loading="lazy" decoding="async" />
      ) : (
        <video autoPlay muted loop playsInline preload={preload} poster={poster}>
          <source src={video} type="video/mp4" />
        </video>
      )}
      <div className={scrim} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */

/**
 * /career — the case for working here, closing on how to apply. The roles
 * and the form live on /career/open-positions; every step here points there.
 */
export default function CareerPage() {
  return (
    <main className={styles.page}>
      {/* 1 — Hero */}
      <section
        className={cn('on-dark', 'section-screen', styles.hero, 'reveal')}
        id="career-hero"
        data-cinematic-hero
        data-header-theme="dark"
      >
        {/* An engineer running the robotic arm from the bench, the arm tracking
            her hand. Cut from the shoot's own footage, six seconds played
            forward then reversed onto itself, so the twelve-second loop never
            cuts — the same treatment the soldering clip it replaces used. That
            clip was a pair of hands and a board: true to the work but it could
            have been any electronics bench anywhere. This one has a person, an
            ARNOBOT machine responding to her, and the badge on the base, which
            is the thing a careers page is actually selling.

            It suits `.scrim` by luck of framing rather than by crop: the wash
            is heaviest at the left edge, where this frame has only bench and
            wall, and both the engineer and the arm sit right of the copy
            column. The poster is the loop's own first frame, which is what
            carries the band while the file arrives — so the clip stays on
            `preload="metadata"` rather than being pulled down whole ahead of
            the first paint. `careers-workshop.mp4` and its poster are left in
            place, unreferenced. */}
        <BandMedia
          video="/assets/videos/careers-robotic-arm.mp4"
          poster="/assets/images/careers-hero-arm-poster.webp"
        />
        <div className={styles.heroInner}>
          <div className="fade-up">
            <span className="eyebrow">Careers at {SITE.name}</span>
            <h1 className={cn('hero-title', styles.heroTitle)}>
              Build robots. Solve hard problems. Make an impact.
            </h1>
            <p className={cn('hero-lead', styles.heroLead)}>
              Join a hands-on robotics team building autonomous platforms for hazardous environments, critical
              infrastructure and defence.
            </p>
            <div className={styles.heroActions}>
              <Link href="/career/open-positions" className="btn btn-light">
                See open roles
              </Link>
              <Link href="/apply" className="btn btn-outline">
                Start your application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Facility: the rooms come before the argument now. The hero asks
          someone to come and build, and the first thing under it is the place
          they would build in — the four rooms, then why the work is worth
          doing. It also breaks the two dark full-bleed bands that used to run
          back to back into the page's alternation: dark hero, light rooms,
          dark band, light team, dark apply.

          The head sits in the middle like the light sections around it, then
          the four rooms as a framed carousel inside the measure, sliding one
          room to the next with only that room's name and note over its slide.
          `FacilityCarousel` owns the turn. */}
      <section className={cn('section-screen', 'is-wash', styles.facility, 'reveal')} id="facility">
        <div className={cn('section-head is-centered', styles.sectionHead, styles.facilityHead, 'fade-up')}>
          <span className="eyebrow">Facility</span>
          <h2 className="section-title is-editorial">Built in-house</h2>
          {/* One line, so the head takes as little of the screen as it can
              and the pictures take the rest. */}
          <p className="section-lead">Four rooms in Ahmedabad, where every platform is designed, built and tested.</p>
        </div>

        <div className={cn(styles.carouselReveal, 'fade-up', 'd1')}>
          <FacilityCarousel rooms={ROOMS} />
        </div>
      </section>

      {/* 3 — Why the work matters, told over a full-bleed frame from the
          ALTIUS ship-hull trial at the Alang recycling yard: the crawler
          working its way up the plate with the two operators stood on the
          ground below it, which is the section's sentence in one picture.
          The same composition as the hero and the technology page's chapter
          bands: one column at the gutter, eyebrow → title → lead, with the
          hull and the crew holding the clear right of the frame. Coming after
          the rooms, it reads as what the rooms are for. */}
      <section
        className={cn('on-dark', 'section-screen', styles.why, 'reveal')}
        id="career-why"
        data-header-theme="dark"
      >
        <BandMedia image="/assets/images/career/hull-trial.webp" scrim={styles.whyScrim} />
        <div className={styles.whyInner}>
          <div className="fade-up">
            <span className="eyebrow">Why it matters</span>
            <h2 className="hero-title">Some places are too dangerous for people.</h2>
            <p className={cn('hero-lead', styles.whyLead)}>
              Our robots go there instead: pressure vessels, ship hulls, live substations, confined spaces. Tested in
              the real world — dust, water, darkness and bad signal.
            </p>
          </div>
        </div>
      </section>

      {/* 4 — The people */}
      <section className="section-screen reveal" id="career-team">
        <div className={cn('section-head is-centered', styles.sectionHead, 'fade-up')}>
          <span className="eyebrow">Who you would work with</span>
          <h2 className="section-title is-editorial">Engineers, and what they last shipped</h2>
          <p className="section-lead">
            The team is small enough that everybody&apos;s work has a name attached to it. Here is the most recent
            quarter.
          </p>
        </div>
        <ul className={cn('card-grid', styles.grid3)}>
          {PEOPLE.map((person) => (
            <li className={cn('card-cell', styles.card)} key={person.name}>
              <h3 className={styles.personName}>{person.name}</h3>
              <span className={cn('micro-label', styles.personRole)}>{person.role}</span>
              <div className={styles.personShip}>
                <span className={cn('micro-label', styles.personShipLabel)}>Shipped this quarter</span>
                <p className={styles.personShipBody}>{person.shipped}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — How to apply: the four steps from the form to the offer, on the
          dark ground the page opened with, so it closes with the same weight.
          The first step carries the way in; the row under them, the way to
          the list. */}
      <section
        className={cn('on-dark', 'section-screen', styles.processSection, 'reveal')}
        id="how-to-apply"
        data-header-theme="dark"
      >
        <div className={cn('section-head is-centered', styles.sectionHead, 'fade-up')}>
          <span className="eyebrow">How to apply</span>
          <h2 className="section-title is-editorial">Four steps</h2>
          <p className="section-lead">
            The whole process, written down — so you know where you stand at every point in it.
          </p>
        </div>

        <ol className={styles.process}>
          {HIRING_PROCESS.map((step, index) => {
            const StepIcon = STEP_ICONS[step.icon];
            return (
              <li
                className={cn('fade-up', index > 0 && `d${index}`, styles.processStep, index === 0 && styles.isEntry)}
                key={step.name}
              >
                <div className={styles.processTop}>
                  <span className={cn('card-icon', styles.processIcon)}>
                    <StepIcon size={20} />
                  </span>
                </div>
                <h3 className={styles.processName}>
                  <span className={styles.processNum} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step.name}
                </h3>
                <p className={styles.processBody}>{step.body}</p>
                <p className={styles.processTakes}>
                  <ClockIcon size={15} />
                  {step.takes}
                </p>
                <p className={styles.processDetail}>{step.detail}</p>
                {index === 0 ? (
                  <Link href="/apply" className={cn('btn btn-light', styles.processCta)}>
                    Apply now{' '}
                    <span className="btn-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className={cn(styles.rolesCta, 'fade-up', 'd3')}>
          <Link href="/career/open-positions" className="btn btn-outline">
            See all open roles{' '}
            <span className="btn-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
