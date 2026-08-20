export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002';
export const SITE_NAME = 'MarketSoft';
export const SITE_SLOGAN = 'The Operating System for your Commerce';
export const SITE_CODE = 'marketsoft';
export const MARKETSOFT_PRODUCT_KEY = process.env.NEXT_PUBLIC_MARKETSOFT_PRODUCT_KEY ?? '';
export const AXPLIFY_URL = 'https://axplify-services.com';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '212688194555';
export const SOCIAL_IMAGE_URL = new URL('/brand/marketsoft-logo-wordmark.png', SITE_URL).toString();
export const publicPageHrefs = ['/', '/platform', '/packages', '/benefits', '/compare', '/faq', '/contact'] as const;
export type PublicPageHref = (typeof publicPageHrefs)[number];

export const MARKETSOFT_FACEBOOK_URL =
  'https://web.facebook.com/profile.php?id=61593143567348';

export const MARKETSOFT_INSTAGRAM_URL =
  'https://www.instagram.com/marketsoft_axplify/';

export const MARKETSOFT_LINKEDIN_URL =
  'https://www.linkedin.com/showcase/marketsoftaxplify/about/';
