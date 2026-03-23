import { NextResponse } from 'next/server';
import pool from '@/utils/db/pool';
import { getAllArtists } from '@/utils/artists';
import { slugify } from '@/utils/slugify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com';
  console.log(`[DEBUG_LOG] Custom Sitemap GET: Request received`);

  try {
    // Static routes
    const staticRoutes = [
      '',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    }));

    // Dynamic routes for composers and tracks
    console.log(`[DEBUG_LOG] Custom Sitemap: Fetching artists`);
    const artists = await getAllArtists();
    console.log(`[DEBUG_LOG] Custom Sitemap: Found ${artists.length} artists`);

    const artistRoutes = artists.map((artist) => ({
      url: `${baseUrl}/composers/${artist.slug}`,
      lastModified: artist.updated_at ? new Date(artist.updated_at).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const trackRoutes: any[] = [];
    for (const artist of artists) {
      const { rows: tracks } = await pool.query(
        'SELECT title, updated_at FROM tracks WHERE user_id = $1',
        [artist.id]
      );
      console.log(`[DEBUG_LOG] Custom Sitemap: Found ${tracks.length} tracks for artist ${artist.studio_name}`);

      tracks.forEach((track) => {
        trackRoutes.push({
          url: `${baseUrl}/composers/${artist.slug}/${slugify(track.title)}`,
          lastModified: track.updated_at ? new Date(track.updated_at).toISOString() : new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    }

    const allRoutes = [...staticRoutes, ...artistRoutes, ...trackRoutes];

    // Generate XML string
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    // Return response with aggressive cache-control
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Sitemap-Debug': new Date().toISOString(),
        'ETag': '',
        'Last-Modified': '',
      },
    });
  } catch (error: any) {
    console.error('[DEBUG_LOG] Error generating custom sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
