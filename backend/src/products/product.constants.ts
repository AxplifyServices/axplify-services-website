export const PRODUCT_LOCALES = [
  'fr',
  'en',
  'ar',
] as const;

export type ProductLocale =
  (typeof PRODUCT_LOCALES)[number];

export const PRODUCT_LOCALE_FALLBACKS:
  Record<
    ProductLocale,
    readonly ProductLocale[]
  > = {
  fr: [
    'fr',
    'en',
  ],

  en: [
    'en',
    'fr',
  ],

  ar: [
    'ar',
    'en',
    'fr',
  ],
};