import {
  ANALYTICS_EVENTS,
} from './events';

import type {
  AnalyticsEventName,
  AnalyticsParameters,
} from './events';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  hasAnalyticsConsent,
} from './consent';

declare global {
  interface Window {
    dataLayer?:
      unknown[];

    __axplifyLastTrackedPageView?:
      string;
  }
}

/*
 * =========================================================
 * DATA LAYER
 * =========================================================
 */

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

/*
 * =========================================================
 * PARAMETER SANITIZATION
 * =========================================================
 *
 * On retire les valeurs undefined afin de garder
 * des événements propres.
 *
 * IMPORTANT :
 * cette fonction n'est PAS destinée à anonymiser
 * des données personnelles.
 *
 * Les composants ne doivent jamais transmettre
 * email, téléphone, nom, message utilisateur, etc.
 */

function sanitizeParameters(
  parameters:
    AnalyticsParameters,
): AnalyticsParameters {
  return Object.fromEntries(
    Object.entries(
      parameters,
    ).filter(
      (
        entry,
      ) =>
        entry[1] !==
        undefined,
    ),
  );
}

/*
 * =========================================================
 * GENERIC EVENT
 * =========================================================
 */

export function trackEvent(
  event:
    AnalyticsEventName,

  parameters:
    AnalyticsParameters =
      {},
) {
  /*
   * Axplify utilise actuellement une stratégie
   * Basic Consent :
   *
   * aucun événement Analytics métier n'est
   * enregistré tant que l'utilisateur n'a pas
   * accepté "Mesure et performance".
   */
  if (
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const dataLayer =
    getDataLayer();

  if (
    !dataLayer
  ) {
    return;
  }

  const sanitizedParameters =
    sanitizeParameters(
      parameters,
    );

  const payload = {
    event,
    site_code: 'marketsoft',

    ...sanitizedParameters,
  };

  dataLayer.push(
    payload,
  );

  /*
   * Seulement en environnement local/dev.
   *
   * Cela nous permet de vérifier immédiatement
   * chaque événement dans DevTools.
   */
  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    console.debug(
      '[MarketSoft Analytics]',
      payload,
    );
  }
}

/*
 * =========================================================
 * PAGE VIEW
 * =========================================================
 */

export type TrackPageViewInput = {
  locale:
    AppLocale;
};

export function trackPageView({
  locale,
}: TrackPageViewInput) {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  const pagePath =
    window.location.pathname;

  /*
   * On n'envoie volontairement PAS
   * window.location.href.
   *
   * Pourquoi ?
   *
   * Parce qu'une URL peut un jour contenir des
   * paramètres sensibles ou accidentellement
   * des données personnelles.
   *
   * Les paramètres marketing UTM seront capturés
   * séparément avec une whitelist stricte.
   */
  const trackingKey =
    `${locale}:${pagePath}`;

  /*
   * Protection contre les doubles page_view,
   * notamment pendant le développement React.
   */
  if (
    window
      .__axplifyLastTrackedPageView ===
    trackingKey
  ) {
    return;
  }

  window
    .__axplifyLastTrackedPageView =
    trackingKey;

  trackEvent(
    ANALYTICS_EVENTS.PAGE_VIEW,
    {
      locale,

      page_path:
        pagePath,

      page_title:
        document.title ||
        undefined,
    },
  );
}