import type {
  MetadataRoute,
} from 'next';

import {
  SITE_URL,
} from '@/lib/site-config';

export default function robots():
MetadataRoute.Robots {
  return {
    rules: {
      userAgent:
        '*',

      allow:
        '/',

disallow: [
  '/admin',
  '/api',

  '/fr/reviews/donner-mon-avis/',
  '/en/reviews/share-your-review/',
  '/ar/reviews/شارك-تجربتك/',
],
    },

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host:
      SITE_URL,
  };
}