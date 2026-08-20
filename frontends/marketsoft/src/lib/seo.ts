import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

export function buildMetadata(
  locale: AppLocale,
  href: any,
  title: string,
  description: string,
): Metadata {
  const canonical = new URL(
    getPathname({ locale, href }),
    SITE_URL,
  ).toString();

  const languages = Object.fromEntries([
    ...routing.locales.map((language) => [
      language,
      new URL(
        getPathname({ locale: language, href }),
        SITE_URL,
      ).toString(),
    ]),
    [
      'x-default',
      new URL(
        getPathname({ locale: routing.defaultLocale, href }),
        SITE_URL,
      ).toString(),
    ],
  ]);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      images: ['/brand/marketsoft-logo-wordmark.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/brand/marketsoft-logo-wordmark.png'],
    },
  };
}
