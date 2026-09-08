import type { NextConfig } from 'next';
import { INSIGHTS_ENABLED } from './src/lib/flags';

/**
 * Everything that used to be a blog or a press release points at `/insights`.
 * While that section is switched off it would be a redirect into a 404, so the
 * home page stands in until the flag goes back to `true`.
 */
const INSIGHTS_OR_HOME = INSIGHTS_ENABLED ? '/insights' : '/';

/**
 * Every page of the original PHP site was a flat `*.php` file at the web root.
 * Those URLs keep working so existing links and search results do not break.
 *
 * Pages the rebuild dropped — the splash, the blog, press releases, the media
 * kit and the standalone industries page — send the reader to the nearest
 * surviving page rather than a 404.
 */
const LEGACY_PHP_ROUTES: ReadonlyArray<readonly [php: string, destination: string]> = [
  ['/index.php', '/'],
  ['/home.php', '/'],
  ['/about.php', '/about'],
  ['/technology.php', '/technology'],
  ['/product.php', '/product'],
  ['/industries.php', '/#market'],
  ['/career.php', '/career'],
  ['/contact.php', '/contact'],
  ['/blog.php', INSIGHTS_OR_HOME],
  ['/blog-details.php', INSIGHTS_OR_HOME],
  ['/press-release.php', INSIGHTS_OR_HOME],
  ['/media-kit.php', '/about'],
  ['/privacy-policy.php', '/privacy-policy'],
  ['/terms-conditions.php', '/terms-conditions'],
  ['/terms.php', '/terms-conditions'],
];

/**
 * The clean URLs *this* site published before those same pages were dropped.
 *
 * The rebuild shipped `/blog`, `/blog-details`, `/industries`, `/media-kit`,
 * `/press-release` and `/intro` as real routes; a later commit deleted them and
 * repointed the `.php` sources above at the surviving pages, but left the clean
 * URLs unmapped. So `/blog.php` reached `/insights` while `/blog` — the address
 * anyone who used the site in the meantime actually has in a bookmark, a tab or
 * their history — hard-404ed.
 *
 * Same policy as above, same destinations: the nearest surviving page. The
 * three articles behind `/blog-details?id=1..3` (UGVs in extreme terrain,
 * magnetic climbing crawlers for tank and pipeline inspection, navigation
 * without GPS) are all covered by posts on `/insights`, so the index is the
 * honest landing point; the query is dropped, exactly as `/blog-details.php`
 * already dropped it.
 */
const DROPPED_ROUTES: ReadonlyArray<readonly [source: string, destination: string]> = [
  ['/intro', '/'],
  ['/industries', '/#market'],
  ['/blog', INSIGHTS_OR_HOME],
  ['/blog-details', INSIGHTS_OR_HOME],
  ['/press-release', INSIGHTS_OR_HOME],
  ['/media-kit', '/about'],
];

const LEGACY_ROUTES = [...LEGACY_PHP_ROUTES, ...DROPPED_ROUTES];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Several lockfiles exist above this folder; pin tracing to the project root.
  outputFileTracingRoot: import.meta.dirname,

  typedRoutes: true,

  async redirects() {
    return LEGACY_ROUTES.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
