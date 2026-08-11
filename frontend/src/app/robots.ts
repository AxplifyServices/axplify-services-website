import type {
  MetadataRoute,
} from 'next';

import {
  SITE_URL,
} from '@/lib/site-config';

const PRIVATE_PATHS = [
  '/admin',
  '/api',

  '/fr/reviews/donner-mon-avis/',
  '/en/reviews/share-your-review/',
  '/ar/reviews/شارك-تجربتك/',
];

export default function robots():
MetadataRoute.Robots {
  return {
    rules: [
      /*
       * Règle générale pour les moteurs de recherche
       * et autres crawlers publics.
       */
      {
        userAgent:
          '*',

        allow:
          '/',

        disallow:
          PRIVATE_PATHS,
      },

      /*
       * ChatGPT Search.
       *
       * On autorise explicitement OAI-SearchBot
       * sur le contenu public afin qu'Axplify Services
       * puisse être découvert et cité dans les résultats
       * de recherche ChatGPT.
       *
       * Les zones privées restent exclues.
       */
      {
        userAgent:
          'OAI-SearchBot',

        allow:
          '/',

        disallow:
          PRIVATE_PATHS,
      },
    ],

    sitemap:
      `${SITE_URL.replace(
        /\/$/,
        '',
      )}/sitemap.xml`,

    host:
      SITE_URL,
  };
}