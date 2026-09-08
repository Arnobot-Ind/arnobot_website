import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { readonly size?: number };

/**
 * The inline SVGs the PHP templates repeated across pages, de-duplicated.
 * All are decorative by default (`aria-hidden`) — the surrounding control
 * carries the accessible name.
 */
function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.56a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Icon>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Icon>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Icon>
  );
}

export function FactoryIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </Icon>
  );
}

export function CaretIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="dropdown-caret"
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M1 1L5.5 6L10 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Company page — Vision / Mission / Values.

   Drawn as one set: identical 24x24 box, identical stroke weight, each glyph
   optically centred and sized to the same visual area. The three replaced
   standalone SVG files that had been drawn in three different idioms — one
   stroke-based, one filled with varying opacity, one a mix — which is why they
   never read as siblings. Silhouettes are deliberately distinct (a circle, a
   vertical form and a pointed shield) so the three are told apart at a glance.
   -------------------------------------------------------------------------- */

/** Concentric target — the goal being aimed at. */
export function TargetIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </Icon>
  );
}

/** Rocket — the mission under way. */
export function RocketIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5c2.6 2.4 4 5.6 4 9v4H8v-4c0-3.4 1.4-6.6 4-9Z" />
      <circle cx="12" cy="9.5" r="1.9" />
      <path d="M8 12.5 5.5 15.2V19L8 17.4" />
      <path d="M16 12.5l2.5 2.7V19L16 17.4" />
      <path d="M10.4 19.2c.5 1.4 1.1 2.2 1.6 2.3.5-.1 1.1-.9 1.6-2.3" />
    </Icon>
  );
}

/** Lightbulb — an idea. Unused since `ShieldIdeaIcon` took the "IPs filed"
    slot on the company page; kept as part of the icon set rather than deleted. */
export function LightbulbIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 15v-.6c0-1-.5-1.9-1.3-2.6A6 6 0 1 1 16.3 11.8c-.8.7-1.3 1.6-1.3 2.6v.6" />
      <path d="M9 15h6" />
      <path d="M9.5 18h5" />
      <path d="M10.5 21h3" />
    </Icon>
  );
}

/** Trophy — an award on the record. */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3h10v6a5 5 0 0 1-10 0V3Z" />
      <path d="M7 5H4.5a.5.5 0 0 0-.5.5V7a3.5 3.5 0 0 0 3.5 3.5" />
      <path d="M17 5h2.5a.5.5 0 0 1 .5.5V7a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M12 14v4" />
      <path d="M8.5 21h7l-1-3h-5Z" />
    </Icon>
  );
}

/** Rover — a ground platform in profile: hull, two large wheels tucked under
    it, and a sensor head on a mast. */
export function RoverIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="9.5" width="19" height="5.5" rx="1.25" />
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="18" r="3" />
      <path d="M14.5 9.5V4.5" />
      <rect x="12" y="2" width="5" height="2.5" rx="0.6" />
      <path d="M6.5 9.5V7" />
    </Icon>
  );
}

/** Television — a set with its aerial up: media coverage, marking "Spotlight"
    on the company page's record band.
    `NewspaperIcon` held that slot first and reads fine alone, but not in that
    band — it sat two columns from `FileTextIcon`, and a ruled sheet beside a
    ruled sheet is one silhouette twice at 40px. A broadcast-wave mark was tried
    next and was too abstract; it read as a wireless signal rather than as
    media. This is the literal object, which is what the band needed.
    The aerials stop short of the box so the three strokes stay separate at
    40px; the band forces `stroke-width: 2` over the 1.75 set here. */
export function TelevisionIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="9" width="19" height="12" rx="2" />
      <path d="M9 9 5.5 4.5" />
      <path d="M15 9l3.5-4.5" />
    </Icon>
  );
}

/** A shield with an idea held inside it — an IP filing, which is protection
    bought for an invention rather than the invention itself. It marks "IPs
    filed" on the company page's record band.
    `LightbulbIcon` held that slot and said "idea", which is the thing before
    the filing, not the filing. A certificate seal was the other candidate and
    was passed over: it reads as "awarded", which is the trophy two columns
    along. The shield shares its silhouette with nothing else in the band.

    The bulb inside it is drawn to survive the band, which renders 24-unit
    glyphs at 40px and forces `stroke-width: 2` — a stroke landing over 3px
    wide, so any two lines closer than about 2 units merge. The first drawing
    outlined the glass, neck and base as one continuous contour and the whole
    thing closed up into a dot at that size. It is now three separate marks
    with clear air between them: the glass as a plain circle at the largest
    radius the shield will hold, then two short rules for the screw base. The
    rules are what keep it a bulb — with the circle alone the shield reads as
    a padlock. */
export function ShieldIdeaIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.4 4.6 5.3v6.1c0 4.3 3.1 7.5 7.4 8.9 4.3-1.4 7.4-4.6 7.4-8.9V5.3Z" />
      <circle cx="12" cy="9.9" r="3.1" />
      <path d="M10.6 14.2h2.8" />
      <path d="M11 16.3h2" />
    </Icon>
  );
}

/** Newspaper — a folded sheet with a column of type and the roll behind it:
    press coverage, as against the page of a publication `FileTextIcon` marks.
    Unused since `TelevisionIcon` took the Spotlight slot; kept as part of the
    icon set rather than deleted. */
export function NewspaperIcon(props: IconProps) {
  return (
    <Icon strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5h13a1 1 0 0 1 1 1v13H6a2 2 0 0 1-2-2Z" />
      <path d="M18 8.5h1.5A1.5 1.5 0 0 1 21 10v7a2 2 0 0 1-2 2h-1" />
      <path d="M7.5 8.5h6" />
      <path d="M7.5 12h6" />
      <path d="M7.5 15.5h4" />
    </Icon>
  );
}

/**
 * "Made in India" — ARNOBOT's own three-bar mark, the stack of skewed
 * parallelograms from the wordmark at public/assets/logos/logotm.png, set in
 * the national colours: saffron, the ground colour, and India green.
 *
 * It is deliberately NOT the Government of India "Make in India" lion, which
 * is a GoI mark carrying usage conditions, and deliberately not any reading of
 * the State Emblem, whose use is restricted by the State Emblem of India
 * (Prohibition of Improper Use) Act 2005. This one is the company's own
 * artwork, so it can ship without anybody's permission. See the note in
 * about/page.tsx where it is used.
 *
 * The middle bar takes `currentColor`, so the mark sits on a dark band or a
 * light one without a second version.
 */
export function MadeInIndiaMark({ size = 26, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(size * 22) / 30}
      viewBox="0 0 30 22"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path fill="#FF9933" d="M14 0h16l-6 6H8Z" />
      <path fill="currentColor" d="M10 8h16l-6 6H4Z" />
      <path fill="#138808" d="M6 16h16l-6 6H0Z" />
    </svg>
  );
}
