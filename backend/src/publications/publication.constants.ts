export const PUBLICATION_CONTENT_TYPES =
  [
    'ARTICLE',
    'CASE_STUDY',
    'NEWS',
    'EVENT',
    'PRESS_RELEASE',
    'ANNOUNCEMENT',
    'GUIDE',
    'RESOURCE',
  ] as const;

export type PublicationContentType =
  (
    typeof PUBLICATION_CONTENT_TYPES
  )[number];

export const PUBLICATION_STATUSES =
  [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
  ] as const;

export type PublicationStatus =
  (
    typeof PUBLICATION_STATUSES
  )[number];

export const PUBLICATION_LOCALES =
  [
    'fr',
    'en',
  ] as const;

export const PUBLIC_PUBLICATION_LOCALES =
  [
    'fr',
    'en',
    'ar',
  ] as const;

export type PublicPublicationLocale =
  (
    typeof PUBLIC_PUBLICATION_LOCALES
  )[number];  

export type PublicationLocale =
  (
    typeof PUBLICATION_LOCALES
  )[number];

export const PUBLICATION_COVER_MEDIA_TYPES =
  [
    'IMAGE',
    'VIDEO',
  ] as const;

export type PublicationCoverMediaType =
  (
    typeof PUBLICATION_COVER_MEDIA_TYPES
  )[number];

export const PUBLICATION_MEDIA_TYPES =
  [
    'IMAGE',
    'VIDEO',
  ] as const;

export type PublicationMediaType =
  (
    typeof PUBLICATION_MEDIA_TYPES
  )[number];

export const EVENT_LOCATION_TYPES =
  [
    'PHYSICAL',
    'ONLINE',
    'HYBRID',
  ] as const;

export type EventLocationType =
  (
    typeof EVENT_LOCATION_TYPES
  )[number];

export const EVENT_STATUSES =
  [
    'UPCOMING',
    'REGISTRATION_OPEN',
    'FULL',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'POSTPONED',
  ] as const;

export type EventStatus =
  (
    typeof EVENT_STATUSES
  )[number];

export const PUBLICATION_ADMIN_STATES =
  [
    'DRAFT',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED',
  ] as const;

export type PublicationAdminState =
  (
    typeof PUBLICATION_ADMIN_STATES
  )[number];

export const PUBLICATION_SORT_OPTIONS =
  [
    'UPDATED_DESC',
    'CREATED_DESC',
    'PUBLISHED_DESC',
    'SCHEDULED_ASC',
    'EVENT_START_ASC',
  ] as const;

export type PublicationSortOption =
  (
    typeof PUBLICATION_SORT_OPTIONS
  )[number];

export const PROJECT_EXPERTISE_CODES =
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

export type PublicationExpertiseCode =
  (
    typeof PROJECT_EXPERTISE_CODES
  )[number];

export const DEFAULT_PUBLICATION_LOCALE:
  PublicationLocale =
    'fr';

export const DEFAULT_ADMIN_PAGE_SIZE =
  20;

export const DEFAULT_PUBLIC_PAGE_SIZE =
  9;

export const MAX_ADMIN_PAGE_SIZE =
  100;

export const MAX_PUBLIC_PAGE_SIZE =
  50;

export const MAX_PUBLICATION_MEDIA =
  5;  

export const PUBLICATION_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PUBLICATION_SLUG_PATTERN_MESSAGE =
  'Le slug doit uniquement contenir des lettres minuscules non accentuées, des chiffres et des tirets.';

export const PUBLICATION_LOCALE_FALLBACKS: Readonly<
  Record<
    PublicPublicationLocale,
    readonly PublicationLocale[]
  >
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
    'en',
    'fr',
  ],
};