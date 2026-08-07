export const FAQ_LOCALES = [
  'fr',
  'en',
  'ar',
] as const;

export type FaqLocale =
  (typeof FAQ_LOCALES)[number];

export const FAQ_CATEGORY_CODES = [
  'OFFER',
  'METHODOLOGY',
  'PROTOTYPE',
  'DELIVERY',
  'BUDGET',
  'TECHNICAL',
  'SUPPORT',
  'GENERAL',
] as const;

export type FaqCategoryCode =
  (typeof FAQ_CATEGORY_CODES)[number];

export const FAQ_PUBLIC_FALLBACK_LOCALE:
  Record<
    FaqLocale,
    FaqLocale[]
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