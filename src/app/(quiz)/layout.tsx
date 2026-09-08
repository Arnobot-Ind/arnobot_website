import type { Metadata, Viewport } from 'next';
// Hiring-assistant global styles (Tailwind + light theme). Scoped to the
// (quiz) route group so Tailwind's preflight never touches the marketing site.
import '../quiz-globals.css';

export const metadata: Metadata = {
  title: 'ARNOBOT Screening Assistant',
  description:
    'Technical robotics screening for candidates applying to ARNOBOT Private Limited.',
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  // Re-creates the quiz app's <body> classes on a wrapper, since the shared
  // root layout owns <body>.
  return <div className="font-sans antialiased text-body">{children}</div>;
}
