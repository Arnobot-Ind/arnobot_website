import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/ui/Icons';
import { ROLE_COUNT, ROLE_GROUPS } from '@/data/careers';
import { HQ_ADDRESS_LINES, SITE } from '@/data/site';
import { cn } from '@/lib/dom';
import RolesList from './RolesList';
import styles from './open-positions.module.css';

export const metadata: Metadata = {
  title: 'Open Positions',
  description: `${ROLE_COUNT} open roles on the ARNOBOT engineering team in Ahmedabad — hardware, autonomy, research and commercial.`,
};

/** The still behind the hero — the assembly floor, the people the reader would join. */
const HERO_IMAGE = '/assets/images/designassmbly.webp';

/**
 * /career/open-positions — the application half of the careers section.
 *
 * The culture page (/career) makes the case and walks through the four
 * hiring steps; this page lists the roles behind one discipline filter. Every
 * Apply link hands off to /apply, the screening assistant that takes the
 * resume and the assessment in one pass.
 */
export default function OpenPositionsPage() {
  return (
    <main className={styles.page}>
      {/* 1 — Hero: a full screen over a still from the assembly floor, the
          same frame every other section page opens on. `data-header-theme`
          draws the header white over it; `data-cinematic-hero` is what the
          header measures to decide when to dock. */}
      <section
        className={cn('on-dark', 'section-screen', styles.hero, 'reveal')}
        id="open-positions-hero"
        data-cinematic-hero
        data-header-theme="dark"
      >
        <div className={styles.media} aria-hidden="true">
          <img src={HERO_IMAGE} alt="" />
          <div className={styles.scrim} />
        </div>
        <div className={styles.heroInner}>
          <div className="fade-up">
            <span className="eyebrow">Open roles</span>
            <h1 className={cn('hero-title', styles.heroTitle)}>{ROLE_COUNT} positions open</h1>
            <p className={cn('hero-lead', styles.heroLead)}>
              All based at the Ahmedabad workshop, where the robots are. Pick the one that fits and the assessment will
              take it from there.
            </p>
            <ul className={cn('meta-line', styles.heroMeta)}>
              <li>Ahmedabad, India</li>
              <li>Full-time and internships</li>
              <li>{ROLE_GROUPS.length} disciplines</li>
            </ul>
            <div className={styles.heroActions}>
              <a href="#roles" className="btn btn-light">
                See the roles
              </a>
              <Link href="/career" className="btn btn-outline">
                Why join {SITE.name}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — The roles, behind one discipline filter */}
      <section className="section-screen is-auto reveal" id="roles">
        <div className={cn(styles.roles, 'fade-up')}>
          <RolesList />

          <div className={styles.rolesFoot}>
            <p className={styles.rolesFootText}>
              <strong>Nothing here fits?</strong>
              Send an open application and tell us what you would build. We hire for the person more often than for the
              posting.
            </p>
            <a href="#apply" className="btn">
              Open application
            </a>
          </div>
        </div>
      </section>

      {/* 3 — Apply */}
      <section className="section-screen is-auto is-wash reveal" id="apply">
        <div className={styles.applyGrid}>
          <div className={cn(styles.applyAside, 'fade-up')}>
            <span className="eyebrow">Apply</span>
            <h2 className={cn('section-title is-editorial', styles.applyTitle)}>Start your application</h2>
            <p className={cn('section-lead', styles.applyBody)}>
              Pick a role from the list above, or tell us what you would build. Either way it reaches the same three
              people.
            </p>

            <div className={styles.applyInfo}>
              <div className={styles.applyInfoItem}>
                <PhoneIcon size={18} />
                <span>{SITE.phone}</span>
              </div>
              <div className={styles.applyInfoItem}>
                <MailIcon size={18} />
                <span>{SITE.email}</span>
              </div>
              <div className={styles.applyInfoItem}>
                <PinIcon size={18} />
                <span>
                  {HQ_ADDRESS_LINES.map((line, index) => (
                    <Fragment key={line}>
                      {index > 0 ? <br /> : null}
                      {line}
                    </Fragment>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Applications run through the screening assistant on /apply rather
              than a form here: it takes the resume, reads the details off it,
              and puts a short technical assessment in front of the candidate in
              one pass. What used to be a mail-out is now a row in the database
              the team reviews on /admin. */}
          <div className={cn(styles.formShell, 'fade-up', 'd1')}>
            <div className={styles.successPanel}>
              <div className={styles.successIcon}>
                <CheckCircleIcon size={56} strokeWidth="1.5" />
              </div>
              <h3 className={cn('section-title is-editorial', styles.successTitle)}>
                One application, start to finish
              </h3>
              <p className={cn('section-lead', styles.successBody)}>
                Upload your resume and {SITE.name} reads your details off it — you confirm them, pick the role you are
                going for, and take a short technical assessment in the same sitting. Around twenty minutes end to end.
              </p>
              <Link href="/apply" className="btn btn-accent">
                Start your application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
