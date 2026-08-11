import type {
  MetadataRoute,
} from 'next';

import {
  getPathname,
} from '@/i18n/navigation';

import {
  routing,
} from '@/i18n/routing';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicPublications,
} from '@/lib/public-publications-api';

import {
  publicPageHrefs,
  SITE_URL,
} from '@/lib/site-config';

function absoluteUrl(
  pathname:
    string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

function buildStaticPages():
MetadataRoute.Sitemap {
  return publicPageHrefs.flatMap(
    href => {
      const languages =
        Object.fromEntries(
          routing.locales.map(
            locale => [
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
        locale => ({
          url:
            absoluteUrl(
              getPathname({
                locale,
                href,
              }),
            ),

          changeFrequency:
            href ===
            '/insights'
              ? 'weekly'
              : 'monthly',

          priority:
            href ===
            '/'
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

async function getAllPublicationsForLocale(
  locale:
    AppLocale,
) {
  const publications = [];

  let page =
    1;

  /*
   * On utilise une taille raisonnable et on parcourt
   * toutes les pages afin que le sitemap ne dépende
   * jamais du nombre total de publications.
   */
  const limit =
    50;

  while (
    true
  ) {
    const response =
      await getPublicPublications({
        locale,
        page,
        limit,
        includePastEvents:
          true,
      });

    publications.push(
      ...response.items,
    );

    if (
      page >=
      response.pagination.totalPages
    ) {
      break;
    }

    page +=
      1;
  }

  return publications;
}

async function buildPublicationPages():
Promise<
  MetadataRoute.Sitemap
> {
  const publicationEntries =
    await Promise.all(
      routing.locales.map(
        async locale => {
          const publications =
            await getAllPublicationsForLocale(
              locale,
            );

          return publications
            .filter(
              publication =>
                publication.seo.allowIndexing,
            )
            .map(
              publication => {
                const pathname =
                  getPathname({
                    locale,

                    href: {
                      pathname:
                        '/insights/[slug]',

                      params: {
                        slug:
                          publication.slug,
                      },
                    },
                  });

                return {
                  url:
                    absoluteUrl(
                      pathname,
                    ),

                  lastModified:
                    publication.updatedAt ||
                    publication.publishedAt ||
                    undefined,

                  changeFrequency:
                    'monthly' as const,

                  priority:
                    0.8,
                };
              },
            );
        },
      ),
    );

  return publicationEntries.flat();
}

export default async function sitemap():
Promise<
  MetadataRoute.Sitemap
> {
  const [
    staticPages,
    publicationPages,
  ] =
    await Promise.all([
      Promise.resolve(
        buildStaticPages(),
      ),

      buildPublicationPages(),
    ]);

  return [
    ...staticPages,
    ...publicationPages,
  ];
}