import type { Metadata, Viewport } from 'next';
// The internal-tools design system. Shared with the hiring assistant rather
// than duplicated: both are Tailwind-designed apps that sit outside the
// marketing site's style.css, and both need Tailwind's preflight, which the
// root globals.css deliberately withholds from the public pages.
import '../quiz-globals.css';

export const metadata: Metadata = {
  title: { absolute: 'Repair Quotation — ARNOBOT' },
  description: 'Internal tool: build a branded ARNOBOT repair quotation and download it as a PDF.',
  // An internal pricing tool has no business in a search index.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export default function QuotationLayout({ children }: { readonly children: React.ReactNode }) {
  return <div className="font-sans antialiased text-body">{children}</div>;
}
