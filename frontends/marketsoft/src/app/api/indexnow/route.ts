import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site-config';
import { submitUrlsToIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/**
 * Déclenche une notification IndexNow (Bing, Yandex) pour toutes les URLs
 * du sitemap.xml courant.
 *
 * Protégé par un secret : appeler avec
 *   POST /api/indexnow?secret=<INDEXNOW_ADMIN_SECRET>
 *
 * Pensé pour être appelé manuellement après une mise en production, ou
 * automatiquement via un cron / webhook de déploiement.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.INDEXNOW_ADMIN_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sitemapUrl = new URL('/sitemap.xml', SITE_URL).toString();
  const sitemapResponse = await fetch(sitemapUrl, { cache: 'no-store' });

  if (!sitemapResponse.ok) {
    return NextResponse.json(
      { error: 'could not fetch sitemap.xml', status: sitemapResponse.status },
      { status: 502 },
    );
  }

  const xml = await sitemapResponse.text();
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);

  const result = await submitUrlsToIndexNow(urls);

  return NextResponse.json({ submittedCount: urls.length, indexNow: result });
}
