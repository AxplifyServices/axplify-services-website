import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/platform': { fr: '/plateforme', en: '/platform', ar: '/المنصة' },
    '/packages': { fr: '/packages', en: '/packages', ar: '/الباقات' },
    '/packages/[packageSlug]': {
      fr: '/packages/[packageSlug]',
      en: '/packages/[packageSlug]',
      ar: '/الباقات/[packageSlug]'
    },
    '/benefits': { fr: '/avantages-resultats', en: '/benefits-results', ar: '/المزايا-والنتائج' },
    '/compare': { fr: '/comparer', en: '/compare', ar: '/مقارنة' },
    '/faq': { fr: '/faq', en: '/faq', ar: '/الأسئلة-الشائعة' },
    '/contact': { fr: '/nous-contacter', en: '/contact-us', ar: '/اتصل-بنا' },
    '/order': { fr: '/commander', en: '/order', ar: '/اطلب' }
  }
});

export type AppLocale = (typeof routing.locales)[number];
