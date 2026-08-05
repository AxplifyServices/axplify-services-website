export const CONTACT_REQUEST_SOURCES =
  [
    'CONTACT_PAGE',
    'ASSIST_PAGE',
  ] as const;

export type ContactRequestSource =
  (typeof CONTACT_REQUEST_SOURCES)[number];

export const CONTACT_REQUEST_STATUSES =
  [
    'RECEIVED',
    'IN_PROGRESS',
    'PROCESSED',
    'CANCELLED',
  ] as const;

export type ContactRequestStatus =
  (typeof CONTACT_REQUEST_STATUSES)[number];

export const CONTACT_REQUEST_LOCALES =
  [
    'fr',
    'en',
    'ar',
  ] as const;

export type ContactRequestLocale =
  (typeof CONTACT_REQUEST_LOCALES)[number];

export const CONTACT_REQUEST_SERVICE_CODES =
  [
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

export type ContactRequestServiceCode =
  (typeof CONTACT_REQUEST_SERVICE_CODES)[number];

export const CONTACT_REQUEST_ALLOWED_TRANSITIONS:
  Record<
    ContactRequestStatus,
    readonly ContactRequestStatus[]
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