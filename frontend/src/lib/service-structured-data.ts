import {
  getPathname,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  ORGANIZATION_ID,
  ORGANIZATION_NAME,
  SITE_URL,
} from '@/lib/site-config';

export type ServiceStructuredDataItem = {
  id:
    string;

  shortTitle:
    string;

  title:
    string;

  description:
    string;
};

function absoluteUrl(
  pathname:
    string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

export function createServicesStructuredData({
  locale,
  services,
}: {
  locale:
    AppLocale;

  services:
    ServiceStructuredDataItem[];
}) {
  const servicesPageUrl =
    absoluteUrl(
      getPathname({
        locale,

        href:
          '/services',
      }),
    );

  return {
    '@context':
      'https://schema.org',

    '@graph':
      services.map(
        service => {
          const serviceUrl =
            `${servicesPageUrl}#${service.id}`;

          return {
            '@type':
              'Service',

            '@id':
              `${serviceUrl}-schema`,

            name:
              service.title,

            serviceType:
              service.shortTitle,

            description:
              service.description,

            url:
              serviceUrl,

            provider: {
              '@type':
                'Organization',

              '@id':
                ORGANIZATION_ID,

              name:
                ORGANIZATION_NAME,
            },
          };
        },
      ),
  };
}