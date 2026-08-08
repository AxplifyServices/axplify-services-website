export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'http://localhost:3001';

export const publicPageHrefs = [
  '/',
  '/services',
  '/projects',
  '/products',
  '/about',
  '/about/work-process',
  '/insights',
  '/faq',
  '/reviews',
  '/contact',
] as const;

export type PublicPageHref =
  (typeof publicPageHrefs)[number];

export const navigationItems = [
  {
    href:
      '/',

    translationKey:
      'home',
  },

  {
    href:
      '/services',

    translationKey:
      'services',
  },

  {
    href:
      '/products',

    translationKey:
      'products',
  },

  {
    href:
      '/about',

    translationKey:
      'about',
  },

  {
    href:
      '/insights',

    translationKey:
      'insights',
  },

  /*
   * La page Réalisations remplace la FAQ
   * dans la navigation principale.
   * La FAQ reste accessible depuis le footer.
   */
  {
    href:
      '/projects',

    translationKey:
      'projects',
  },

  {
    href:
      '/contact',

    translationKey:
      'contact',
  },
] as const;