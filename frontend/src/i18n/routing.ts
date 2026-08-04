import {
  defineRouting,
} from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'fr',
    'en',
    'ar',
  ],

  defaultLocale:
    'fr',

  localePrefix:
    'always',

  pathnames: {
    '/':
      '/',

    '/services': {
      fr:
        '/services',

      en:
        '/services',

      ar:
        '/الخدمات',
    },

    '/projects': {
      fr:
        '/nos-realisations',

      en:
        '/our-work',

      ar:
        '/أعمالنا',
    },

    '/products': {
      fr:
        '/produits',

      en:
        '/products',

      ar:
        '/المنتجات',
    },

    '/about': {
      fr:
        '/a-propos',

      en:
        '/about-us',

      ar:
        '/من-نحن',
    },

    '/about/work-process': {
      fr:
        '/a-propos/processus-de-travail',

      en:
        '/about-us/work-process',

      ar:
        '/من-نحن/منهجية-العمل',
    },

    '/insights': {
      fr:
        '/articles-actualites',

      en:
        '/articles-news',

      ar:
        '/المقالات-والأخبار',
    },

    '/insights/[slug]': {
      fr:
        '/articles-actualites/[slug]',

      en:
        '/articles-news/[slug]',

      ar:
        '/المقالات-والأخبار/[slug]',
    },

    '/faq': {
      fr:
        '/faq',

      en:
        '/faq',

      ar:
        '/الأسئلة-الشائعة',
    },

    '/contact': {
      fr:
        '/nous-contacter',

      en:
        '/contact-us',

      ar:
        '/اتصل-بنا',
    },

    '/assist': {
      fr:
        '/comment-pouvons-nous-vous-aider',

      en:
        '/how-can-we-assist-you',

      ar:
        '/كيف-يمكننا-مساعدتك',
    },
  },
});

export type AppLocale =
  (typeof routing.locales)[number];