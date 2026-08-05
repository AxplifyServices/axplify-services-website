import type {
  MetadataRoute,
} from 'next';

import {
  getPathname,
} from '@/i18n/navigation';

import {
  routing,
} from '@/i18n/routing';

import {
  publicPageHrefs,
  SITE_URL,
} from '@/lib/site-config';

function absoluteUrl(
  pathname: string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

export default function sitemap():
MetadataRoute.Sitemap {
  return publicPageHrefs.flatMap(
    (
      href,
    ) => {
      const languages =
        Object.fromEntries(
          routing.locales.map(
            (
              locale,
            ) => [
              locale,

              absoluteUrl(
                getPathname({
                  locale,
                  href,
                }),
              ),
            ],
          ),
        );

      return routing.locales.map(
        (
          locale,
        ) => ({
          url:
            absoluteUrl(
              getPathname({
                locale,
                href,
              }),
            ),

          lastModified:
            new Date(),

          changeFrequency:
            href ===
            '/insights'
              ? 'weekly'
              : 'monthly',

priority:
  href === '/'
    ? 1
    : 0.7,

          alternates: {
            languages,
          },
        }),
      );
    },
  );
}