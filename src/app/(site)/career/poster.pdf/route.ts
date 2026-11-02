import { buildCareersPoster } from '@/lib/poster/poster';

/**
 * The downloadable careers poster. Built from `src/data/careers.ts`, so it is
 * regenerated on every deploy — edit a role or title there and the poster
 * follows. `force-static` renders it once at build time instead of per request.
 */
export const dynamic = 'force-static';

export async function GET() {
  const pdf = await buildCareersPoster();
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ARNOBOT-Careers-Poster.pdf"',
    },
  });
}
