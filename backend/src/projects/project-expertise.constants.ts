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

export type ProjectExpertiseCode =
  (typeof PROJECT_EXPERTISE_CODES)[number];

export const PROJECT_STATUSES =
  [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
  ] as const;

export type ProjectStatus =
  (typeof PROJECT_STATUSES)[number];

export const PUBLIC_LOCALES =
  [
    'fr',
    'en',
    'ar',
  ] as const;

export type PublicLocale =
  (typeof PUBLIC_LOCALES)[number];