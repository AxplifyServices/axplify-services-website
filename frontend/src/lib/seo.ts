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
  SITE_URL,
  type PublicPageHref,
} from '@/lib/site-config';

function absoluteUrl(
  pathname: string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

export async function createPageMetadata(
  locale: AppLocale,
  namespace: string,
  href: PublicPageHref,
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
        (
          targetLocale,
        ) => [
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
      t('title'),

    description:
      t('description'),

    alternates: {
      canonical,

      languages:
        languageAlternates,
    },

    openGraph: {
      title:
        t('title'),

      description:
        t('description'),

      url:
        canonical,

      siteName:
        'Axplify Services',

      locale:
        locale === 'fr'
          ? 'fr_MA'
          : locale === 'ar'
            ? 'ar_MA'
            : 'en_US',

      type:
        'website',
    },
  };
}