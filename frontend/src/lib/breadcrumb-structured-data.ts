import {
  getPathname,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  SITE_URL,
  type PublicPageHref,
} from '@/lib/site-config';

type StaticBreadcrumbItem = {
  name:
    string;

  href:
    PublicPageHref;

  url?:
    never;
};

type DynamicBreadcrumbItem = {
  name:
    string;

  url:
    string;

  href?:
    never;
};

export type BreadcrumbItem =
  StaticBreadcrumbItem |
  DynamicBreadcrumbItem;

function absoluteUrl(
  pathname:
    string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

function resolveBreadcrumbUrl(
  locale:
    AppLocale,

  item:
    BreadcrumbItem,
) {
  if (
    'url' in item
  ) {
    return item.url;
  }

  return absoluteUrl(
    getPathname({
      locale,
      href:
        item.href,
    }),
  );
}

export function createBreadcrumbStructuredData({
  locale,
  items,
}: {
  locale:
    AppLocale;

  items:
    BreadcrumbItem[];
}) {
  return {
    '@context':
      'https://schema.org',

    '@type':
      'BreadcrumbList',

    itemListElement:
      items.map(
        (
          item,
          index,
        ) => ({
          '@type':
            'ListItem',

          position:
            index + 1,

          name:
            item.name,

          item:
            resolveBreadcrumbUrl(
              locale,
              item,
            ),
        }),
      ),
  };
}