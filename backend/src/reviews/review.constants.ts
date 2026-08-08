export const REVIEW_STATUSES = [
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
] as const;

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[number];

export const REVIEW_LOCALES = [
  'fr',
  'en',
  'ar',
] as const;

export type ReviewLocale =
  (typeof REVIEW_LOCALES)[number];