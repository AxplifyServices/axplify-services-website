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

import type {
  PublicPublication,
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

function getPublicationUrl(
  locale:
    AppLocale,

  slug:
    string,
) {
  return absoluteUrl(
    getPathname({
      locale,

      href: {
        pathname:
          '/insights/[slug]',

        params: {
          slug,
        },
      },
    }),
  );
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

async function getAllPublications() {
  const publications:
    PublicPublication[] =
    [];

  let page =
    1;

  const limit =
    50;

  while (
    true
  ) {
    /*
     * Une seule langue suffit ici.
     *
     * L'API retourne toutes les publications publiées
     * et localizedVersions expose ensuite les traductions
     * réellement disponibles.
     */
    const response =
      await getPublicPublications({
        locale:
          'fr',

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

function buildPublicationEntries(
  publication:
    PublicPublication,
):
MetadataRoute.Sitemap {
  if (
    !publication.seo.allowIndexing
  ) {
    return [];
  }

  const languages:
    Record<
      string,
      string
    > =
    {};

  const frenchVersion =
    publication
      .localizedVersions
      .fr;

  if (
    frenchVersion
  ) {
    languages.fr =
      frenchVersion.canonicalUrl ??
      getPublicationUrl(
        'fr',
        frenchVersion.slug,
      );
  }

  const englishVersion =
    publication
      .localizedVersions
      .en;

  if (
    englishVersion
  ) {
    languages.en =
      englishVersion.canonicalUrl ??
      getPublicationUrl(
        'en',
        englishVersion.slug,
      );
  }

  const entries:
    MetadataRoute.Sitemap =
    [];

  if (
    frenchVersion
  ) {
    entries.push({
      url:
        languages.fr,

      lastModified:
        publication.updatedAt ||
        publication.publishedAt ||
        undefined,

      changeFrequency:
        'monthly',

      priority:
        0.8,

      alternates: {
        languages,
      },
    });
  }

  if (
    englishVersion
  ) {
    entries.push({
      url:
        languages.en,

      lastModified:
        publication.updatedAt ||
        publication.publishedAt ||
        undefined,

      changeFrequency:
        'monthly',

      priority:
        0.8,

      alternates: {
        languages,
      },
    });
  }

  return entries;
}

async function buildPublicationPages():
Promise<
  MetadataRoute.Sitemap
> {
  const publications =
    await getAllPublications();

  return publications.flatMap(
    buildPublicationEntries,
  );
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