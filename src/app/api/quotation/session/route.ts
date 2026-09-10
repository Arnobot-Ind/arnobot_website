import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminConfigured, isValidAdminCookie } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Cheap "am I signed in?" probe for the quotation desk.
 *
 * The hiring assistant's admin page infers this from a 401 on its data fetch,
 * but the quotation desk's only endpoint returns a PDF — probing it would mean
 * rendering a document just to read a status code.
 */
export async function GET() {
  const jar = await cookies();
  return NextResponse.json({
    authed: isValidAdminCookie(jar.get(ADMIN_COOKIE)?.value),
    configured: adminConfigured(),
  });
}
