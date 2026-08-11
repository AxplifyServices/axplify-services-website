import type {
  Metadata,
} from 'next';

import {
  getTranslations,
} from 'next-intl/server';

import {
  getPathname,
} from '@/i18n/navigation';

import {
  routing,
  type AppLocale,
} from '@/i18n/routing';

import {
  ORGANIZATION_NAME,
  SITE_URL,
  SOCIAL_IMAGE_URL,
  type PublicPageHref,
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

function getSocialLocale(
  locale:
    AppLocale,
) {
  switch (
    locale
  ) {
    case 'fr':
      return 'fr_FR';

    case 'ar':
      return 'ar_SA';

    case 'en':
    default:
      return 'en_US';
  }
}

function buildUrl({
  locale,
  href,
  page,
}: {
  locale:
    AppLocale;

  href:
    PublicPageHref;

  page?:
    number;
}) {
  const url =
    new URL(
      getPathname({
        locale,
        href,
      }),
      SITE_URL,
    );

  if (
    page &&
    page >
      1
  ) {
    url.searchParams.set(
      'page',
      String(
        page,
      ),
    );
  }

  return url.toString();
}

export async function createPageMetadata(
  locale:
    AppLocale,

  namespace:
    string,

  href:
    PublicPageHref,
): Promise<Metadata> {
  const t =
    await getTranslations({
      locale,

      namespace:
        `pages.${namespace}.seo`,
    });

  const languageAlternates =
    Object.fromEntries(
      routing.locales.map(
        targetLocale => [
          targetLocale,

          absoluteUrl(
            getPathname({
              locale:
                targetLocale,

              href,
            }),
          ),
        ],
      ),
    );

  const canonical =
    absoluteUrl(
      getPathname({
        locale,
        href,
      }),
    );

  return {
    title:
      t(
        'title',
      ),

    description:
      t(
        'description',
      ),

    alternates: {
      canonical,

      languages:
        languageAlternates,
    },

    openGraph: {
      title:
        t(
          'title',
        ),

      description:
        t(
          'description',
        ),

      url:
        canonical,

      siteName:
        ORGANIZATION_NAME,

      locale:
        getSocialLocale(
          locale,
        ),

      type:
        'website',

      images: [
        {
          url:
            SOCIAL_IMAGE_URL,

          width:
            1200,

          height:
            630,

          alt:
            ORGANIZATION_NAME,
        },
      ],
    },

    twitter: {
      card:
        'summary_large_image',

      title:
        t(
          'title',
        ),

      description:
        t(
          'description',
        ),

      images: [
        SOCIAL_IMAGE_URL,
      ],
    },
  };
}

export async function createPaginatedPageMetadata({
  locale,
  namespace,
  href,
  page,
  hasFilters = false,
}: {
  locale:
    AppLocale;

  namespace:
    string;

  href:
    PublicPageHref;

  page:
    number;

  hasFilters?:
    boolean;
}): Promise<Metadata> {
  const t =
    await getTranslations({
      locale,

      namespace:
        `pages.${namespace}.seo`,
    });

  /*
   * Les filtres et recherches sont utiles à l'utilisateur,
   * mais ne constituent pas des landing pages SEO distinctes.
   *
   * On les canonicalise donc vers la collection principale
   * et on empêche leur indexation.
   */
  const canonical =
    hasFilters
      ? buildUrl({
          locale,
          href,
        })
      : buildUrl({
          locale,
          href,
          page,
        });

  const languageAlternates =
    Object.fromEntries(
      routing.locales.map(
        targetLocale => [
          targetLocale,

          hasFilters
            ? buildUrl({
                locale:
                  targetLocale,

                href,
              })
            : buildUrl({
                locale:
                  targetLocale,

                href,

                page,
              }),
        ],
      ),
    );

  return {
    title:
      t(
        'title',
      ),

    description:
      t(
        'description',
      ),

    robots:
      hasFilters
        ? {
            index:
              false,

            follow:
              true,
          }
        : {
            index:
              true,

            follow:
              true,
          },

    alternates: {
      canonical,

      languages:
        languageAlternates,
    },

    openGraph: {
      title:
        t(
          'title',
        ),

      description:
        t(
          'description',
        ),

      url:
        canonical,

      siteName:
        ORGANIZATION_NAME,

      locale:
        getSocialLocale(
          locale,
        ),

      type:
        'website',

      images: [
        {
          url:
            SOCIAL_IMAGE_URL,

          width:
            1200,

          height:
            630,

          alt:
            ORGANIZATION_NAME,
        },
      ],
    },

    twitter: {
      card:
        'summary_large_image',

      title:
        t(
          'title',
        ),

      description:
        t(
          'description',
        ),

      images: [
        SOCIAL_IMAGE_URL,
      ],
    },
  };
}