import type { Metadata } from 'next';
import Link from 'next/link';
import SiteChrome from '@/components/layout/SiteChrome';
import StatusSection from '@/components/sections/StatusSection';
import ProductLink from '@/components/ui/ProductLink';

export const metadata: Metadata = { title: 'Page not found' };

/**
 * 404 for any unmatched URL. It renders inside the site chrome so a mistyped
 * address still lands somewhere navigable.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <StatusSection
        eyebrow="Error 404"
        title="We couldn't find that page"
        description="The page may have moved, or the link that brought you here may be out of date."
      >
        <Link href="/" className="btn btn-accent">
          Back to home
        </Link>
        <ProductLink href="/product" className="btn btn-outline">
          Explore products
        </ProductLink>
      </StatusSection>
    </SiteChrome>
  );
}
