import {
  defineRouting,
} from 'next-intl/routing';

export const routing =
  defineRouting({
    locales: [
      'fr',
      'en',
      'ar',
    ],

    defaultLocale:
      'fr',

    localePrefix:
      'always',

    /*
     * Désactive la négociation automatique de langue basée sur
     * l'en-tête Accept-Language (et le cookie NEXT_LOCALE).
     *
     * Sans ça, une requête sur "/" redirige vers une locale qui
     * dépend de qui/quoi fait la requête, ce qui n'est pas
     * déterministe pour les crawlers (Bing en particulier est
     * beaucoup plus strict que Google sur ce point). Avec
     * localeDetection à false, "/" redirige toujours vers la
     * locale par défaut (fr), de façon stable et indexable.
     *
     * Les utilisateurs gardent la possibilité de changer de langue
     * manuellement via le sélecteur de langue du site.
     */
    localeDetection:
      false,

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

      '/services/[serviceSlug]': {
        fr:
          '/services/[serviceSlug]',

        en:
          '/services/[serviceSlug]',

        ar:
          '/الخدمات/[serviceSlug]',
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

      '/reviews': {
        fr:
          '/reviews',

        en:
          '/reviews',

        ar:
          '/آراء-العملاء',
      },

      '/reviews/submit/[token]': {
        fr:
          '/reviews/donner-mon-avis/[token]',

        en:
          '/reviews/share-your-review/[token]',

        ar:
          '/reviews/شارك-تجربتك/[token]',
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