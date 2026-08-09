import type {
  ConsentState,
} from './consent';

type GoogleConsentValue =
  | 'granted'
  | 'denied';

type GoogleConsentCommand =
  [
    'consent',
    'default' | 'update',
    Record<
      string,
      GoogleConsentValue
    >,
  ];

declare global {
  interface Window {
    dataLayer?:
      unknown[];
  }
}

function getDataLayer() {
  if (
    typeof window ===
    'undefined'
  ) {
    return null;
  }

  window.dataLayer =
    window.dataLayer ??
    [];

  return window.dataLayer;
}

export function setGoogleConsentDefault() {
  const dataLayer =
    getDataLayer();

  if (
    !dataLayer
  ) {
    return;
  }

  const command:
    GoogleConsentCommand = [
      'consent',
      'default',
      {
        analytics_storage:
          'denied',

        ad_storage:
          'denied',

        ad_user_data:
          'denied',

        ad_personalization:
          'denied',
      },
    ];

  dataLayer.push(
    command,
  );
}

export function updateGoogleConsent(
  consent:
    ConsentState,
) {
  const dataLayer =
    getDataLayer();

  if (
    !dataLayer
  ) {
    return;
  }

  const analytics:
    GoogleConsentValue =
    consent.analytics
      ? 'granted'
      : 'denied';

  const marketing:
    GoogleConsentValue =
    consent.marketing
      ? 'granted'
      : 'denied';

  const command:
    GoogleConsentCommand = [
      'consent',
      'update',
      {
        analytics_storage:
          analytics,

        ad_storage:
          marketing,

        ad_user_data:
          marketing,

        ad_personalization:
          marketing,
      },
    ];

dataLayer.push(
  command,
);

/*
 * Événement métier indépendant de Google.
 *
 * GTM peut ainsi déclencher les outils correspondant
 * aux catégories réellement autorisées.
 */
dataLayer.push({
  event:
    'axplify_consent_update',

  analytics_consent:
    consent.analytics,

  marketing_consent:
    consent.marketing,
});
}