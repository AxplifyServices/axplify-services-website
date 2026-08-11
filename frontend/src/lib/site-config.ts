export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'http://localhost:3001';

export const ORGANIZATION_NAME =
  'Axplify Services';

export const ORGANIZATION_ID =
  `${SITE_URL.replace(/\/$/, '')}/#organization`;

export const ORGANIZATION_LOGO_URL =
  new URL(
    '/brand/logo_axplify_-_V12_icone-removebg-preview.png',
    SITE_URL,
  ).toString();

export const ORGANIZATION_LINKEDIN_URL =
  'https://www.linkedin.com/company/axplify-services/home';

export const ORGANIZATION_WHATSAPP_NUMBER =
  '212688194555';

export const ORGANIZATION_PHONE =
  '+212688194555';

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