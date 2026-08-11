import type {
  AppLocale,
} from '@/i18n/routing';

export const SERVICE_KEYS = [
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

export type ServiceKey =
  (typeof SERVICE_KEYS)[number];

type ServiceSlugMap =
  Record<
    AppLocale,
    string
  >;

type ServiceCatalogItem = {
  key:
    ServiceKey;

  slugs:
    ServiceSlugMap;
};

export const SERVICE_CATALOG:
  readonly ServiceCatalogItem[] =
  [
    {
      key:
        'digital',

      slugs: {
        fr:
          'developpement-web-mobile',

        en:
          'web-mobile-development',

        ar:
          'تطوير-الويب-والتطبيقات',
      },
    },

    {
      key:
        'automation',

      slugs: {
        fr:
          'automatisation-processus-metier',

        en:
          'business-process-automation',

        ar:
          'أتمتة-العمليات',
      },
    },

    {
      key:
        'data',

      slugs: {
        fr:
          'data-business-intelligence',

        en:
          'data-business-intelligence',

        ar:
          'البيانات-وذكاء-الأعمال',
      },
    },

    {
      key:
        'ai',

      slugs: {
        fr:
          'intelligence-artificielle',

        en:
          'artificial-intelligence',

        ar:
          'الذكاء-الاصطناعي',
      },
    },

    {
      key:
        'crm',

      slugs: {
        fr:
          'crm-performance-commerciale',

        en:
          'crm-sales-performance',

        ar:
          'إدارة-العملاء-والمبيعات',
      },
    },

    {
      key:
        'architecture',

      slugs: {
        fr:
          'architecture-logicielle-deploiement',

        en:
          'software-architecture-deployment',

        ar:
          'هندسة-البرمجيات-والنشر',
      },
    },

    {
      key:
        'analytics',

      slugs: {
        fr:
          'analytics-tracking',

        en:
          'analytics-tracking',

        ar:
          'التحليلات-والتتبع',
      },
    },

    {
      key:
        'leadGeneration',

      slugs: {
        fr:
          'generation-leads-closing',

        en:
          'lead-generation-closing',

        ar:
          'توليد-العملاء-المحتملين',
      },
    },

    {
      key:
        'marketingStrategy',

      slugs: {
        fr:
          'strategie-marketing-digitale',

        en:
          'digital-marketing-strategy',

        ar:
          'استراتيجية-التسويق-الرقمي',
      },
    },
  ] as const;

export function getServiceByKey(
  key:
    ServiceKey,
) {
  return SERVICE_CATALOG.find(
    service =>
      service.key ===
      key,
  );
}

export function getServiceBySlug(
  locale:
    AppLocale,

  slug:
    string,
) {
  return SERVICE_CATALOG.find(
    service =>
      service.slugs[
        locale
      ] ===
      slug,
  );
}

export function getServiceSlug(
  key:
    ServiceKey,

  locale:
    AppLocale,
) {
  return getServiceByKey(
    key,
  )?.slugs[
    locale
  ];
}