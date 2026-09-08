import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
// Pitch-deck styles (light theme, hand-written CSS). Scoped to the (pitch)
// route group so they never load on the marketing or hiring-assistant routes.
import '../pitch-globals.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});
const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's `%s | ARNOBOT` title template,
  // which would otherwise render "ARNOBOT — Robotics Redefined | ARNOBOT".
  title: { absolute: 'ARNOBOT — Robotics Redefined' },
  description:
    'ARNOBOT (Arnobot Private Limited) — unmanned ground, climbing and tactical robots for defence and hazardous industrial environments. Capability and investment overview.',
  icons: { icon: '/pitch/assets/arnobot-mark.png' },
  robots: { index: false, follow: false },
};

export default function PitchLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className={`pitch-root ${grotesk.variable} ${plex.variable} ${plexMono.variable}`}>
      {children}
    </div>
  );
}
