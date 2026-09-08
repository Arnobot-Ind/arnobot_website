import type { Route } from 'next';

/** Single source of truth for contact details and navigation. */
export const SITE = {
  name: 'ARNOBOT',
  tagline: 'ROBOTICS REDEFINED',
  title: 'ARNOBOT - Building Autonomous Systems for Industry',
  description:
    'Autonomous robotic platforms for defence, industrial inspection, maritime and critical infrastructure operations.',
  phone: '+91 9925512860',
  email: 'contact@arnobot.in',
  addressLines: ['G-2, Parul Apartments,', 'Satellite Road,', 'Ahmedabad – 380015,\u00A0India'],
  officeHours: 'Mon – Sat, 10 AM – 7 PM IST',
  /** Prefixed onto the address wherever it is displayed - see HQ_ADDRESS_LINES. */
  addressLabel: 'HQ',
  copyright: '© 2026 ARNOBOT. ALL RIGHTS RESERVED.',
} as const;

/**
 * The postal address as every page must display it — labelled HQ so it always
 * reads as the head office and never as a branch or site address.
 * `SITE.addressLines` stays the unlabelled address itself.
 */
export const HQ_ADDRESS_LINES: readonly [string, ...string[]] = [
  `${SITE.addressLabel}: ${SITE.addressLines[0]}`,
  ...SITE.addressLines.slice(1),
];

export interface NavLink {
  readonly href: Route;
  readonly label: string;
  /** Lower-case label used by the mobile drawer. */
  readonly mobileLabel: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '/technology', label: 'TECHNOLOGY', mobileLabel: 'Technology' },
  { href: '/about', label: 'COMPANY', mobileLabel: 'Company' },
  // Insights is unpublished while its articles are rewritten — see `@/lib/flags`.
  // { href: '/insights', label: 'INSIGHTS', mobileLabel: 'Insights' },
];

export const SECONDARY_NAV: readonly NavLink[] = [
  { href: '/career', label: 'CAREERS', mobileLabel: 'Careers' },
  { href: '/contact', label: 'CONTACT US', mobileLabel: 'Contact Us' },
];

export const PRODUCT_NAV: ReadonlyArray<{ readonly href: Route; readonly label: string }> = [
  { href: '/product?id=saibya', label: 'SAIBYA – UGV' },
  { href: '/product?id=nexus', label: 'NEXUS – Tactical' },
  { href: '/product?id=altius', label: 'ALTIUS – Climbing' },
  { href: '/product?id=atm', label: 'ATM – Any Terrain Machine' },
];

/** The footer's link columns, in render order. */
export const FOOTER_NAV: ReadonlyArray<{
  readonly heading: string;
  readonly links: ReadonlyArray<{ readonly href: Route; readonly label: string }>;
}> = [
  {
    heading: 'Products',
    links: [
      { href: '/product?id=saibya', label: 'SAIBYA' },
      { href: '/product?id=nexus', label: 'NEXUS' },
      { href: '/product?id=altius', label: 'ALTIUS' },
      { href: '/product?id=atm', label: 'ATM' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/technology', label: 'Technology' },
      { href: '/career', label: 'Careers' },
      // Unpublished with the rest of the section — see `@/lib/flags`.
      // { href: '/insights', label: 'Insights' },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-conditions', label: 'Terms and Condition' },
    ],
  },
];

/** Footer social profiles. `href` is where the icon links out to. */
export const SOCIAL_LINKS: ReadonlyArray<{
  readonly icon: string;
  readonly label: string;
  readonly href: string;
}> = [
  {
    icon: '/assets/icons/linkedin.png',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/arnobot/posts/?feedView=all',
  },
  { icon: '/assets/icons/instam.png', label: 'Instagram', href: 'https://www.instagram.com/robots_arnobot/' },
];
