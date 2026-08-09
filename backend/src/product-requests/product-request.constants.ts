export const PRODUCT_REQUEST_TYPES =
  [
    'CONTACT',
    'DEMO',
    'ORDER',
  ] as const;

export type ProductRequestType =
  (typeof PRODUCT_REQUEST_TYPES)[number];

export const PRODUCT_REQUEST_STATUSES =
  [
    'RECEIVED',
    'IN_PROGRESS',
    'PROCESSED',
    'CANCELLED',
  ] as const;

export type ProductRequestStatus =
  (typeof PRODUCT_REQUEST_STATUSES)[number];

export const PRODUCT_REQUEST_LOCALES =
  [
    'fr',
    'en',
    'ar',
  ] as const;

export type ProductRequestLocale =
  (typeof PRODUCT_REQUEST_LOCALES)[number];

export const PRODUCT_REQUEST_ALLOWED_TRANSITIONS:
  Record<
    ProductRequestStatus,
    readonly ProductRequestStatus[]
  > =
  {
    RECEIVED: [
      'IN_PROGRESS',
      'CANCELLED',
    ],

    IN_PROGRESS: [
      'PROCESSED',
      'CANCELLED',
    ],

    PROCESSED:
      [],

    CANCELLED:
      [],
  };