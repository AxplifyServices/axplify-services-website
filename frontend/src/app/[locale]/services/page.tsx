import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ServicesPageContent,
  type ServicePageItem,
} from '@/components/services/services-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  createPageMetadata,
} from '@/lib/seo';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;
};

const SERVICE_KEYS = [
  'digital',
  'automation',
  'data',
  'ai',
  'crm',
  'architecture',
  'analytics',
  'leadGeneration',
  'marketingStrategy',
] as const;

const METHOD_KEYS = [
  'diagnosis',
  'design',
  'deployment',
] as const;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'services',
    '/services',
  );
}

export default async function ServicesPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const t =
    await getTranslations({
      locale,

      namespace:
        'pages.services',
    });

  const services: ServicePageItem[] =
    SERVICE_KEYS.map(
      (
        key,
        index,
      ) => ({
        id:
          t(
            `items.${key}.id`,
          ),

        number:
          String(
            index + 1,
          ).padStart(
            2,
            '0',
          ),

        shortTitle:
          t(
            `items.${key}.shortTitle`,
          ),

        title:
          t(
            `items.${key}.title`,
          ),

        promise:
          t(
            `items.${key}.promise`,
          ),

        description:
          t(
            `items.${key}.description`,
          ),

        challengeTitle:
          t(
            'common.challengeTitle',
          ),

        challengeDescription:
          t(
            `items.${key}.challenge`,
          ),

        solutionsTitle:
          t(
            'common.solutionsTitle',
          ),

        solutions:
          t.raw(
            `items.${key}.solutions`,
          ) as string[],

        benefitsTitle:
          t(
            'common.benefitsTitle',
          ),

        benefits:
          t.raw(
            `items.${key}.benefits`,
          ) as string[],

        exampleLabel:
          t(
            'common.exampleLabel',
          ),

        example:
          t(
            `items.${key}.example`,
          ),
      }),
    );

  const methodItems =
    METHOD_KEYS.map(
      (
        key,
        index,
      ) => ({
        number:
          String(
            index + 1,
          ).padStart(
            2,
            '0',
          ),

        title:
          t(
            `method.items.${key}.title`,
          ),

        description:
          t(
            `method.items.${key}.description`,
          ),
      }),
    );

  return (
    <ServicesPageContent
      hero={{
        eyebrow:
          t(
            'hero.eyebrow',
          ),

        title:
          t(
            'hero.title',
          ),

        introduction:
          t(
            'hero.introduction',
          ),

        description:
          t(
            'hero.description',
          ),

        navigationCta:
          t(
            'hero.navigationCta',
          ),
      }}
      navigation={{
        label:
          t(
            'navigation.label',
          ),

        title:
          t(
            'navigation.title',
          ),

        openLabel:
          t(
            'navigation.openLabel',
          ),

        closeLabel:
          t(
            'navigation.closeLabel',
          ),
      }}
      services={
        services
      }
      method={{
        eyebrow:
          t(
            'method.eyebrow',
          ),

        title:
          t(
            'method.title',
          ),

        description:
          t(
            'method.description',
          ),

        items:
          methodItems,
      }}
      finalCta={{
        eyebrow:
          t(
            'finalCta.eyebrow',
          ),

        title:
          t(
            'finalCta.title',
          ),

        description:
          t(
            'finalCta.description',
          ),

        secondaryCta:
          t(
            'finalCta.secondaryCta',
          ),
      }}
    />
  );
}