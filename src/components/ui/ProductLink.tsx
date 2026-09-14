import Link from 'next/link';
import type { ComponentProps } from 'react';

/**
 * A link to `/product`, with or without an `?id=` query.
 *
 * Every product lives at `/product?id=<slug>`, and the router's automatic
 * prefetch of that route ignores the query: the shell it fetches ahead of a
 * click — the layouts plus the streamed `<title>` — is cached as though it were
 * the same for every `id`, so after a click the tab read whichever product had
 * been prefetched last (seen on the live site, 2026-09-08: home → NEXUS titled
 * SAIBYA, then ATM titled NEXUS). The page body was right, because that part
 * is always fetched with the query.
 *
 * Prefetching is off for these links instead. The click fetches the route with
 * its query, which the router does key by `id`, and the title follows the
 * product. Nothing is lost: the prefetch only ever carried the shared shell,
 * and the product itself was fetched on click anyway.
 */
export default function ProductLink(props: Omit<ComponentProps<typeof Link>, 'prefetch'>) {
  return <Link {...props} prefetch={false} />;
}
