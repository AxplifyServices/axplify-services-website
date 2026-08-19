export const CONSENT_COOKIE_NAME =
  'axplify_consent';

export const CONSENT_VERSION =
  1;

export const CONSENT_CHANGED_EVENT =
  'axplify:consent-changed';

export const OPEN_CONSENT_PREFERENCES_EVENT =
  'axplify:open-consent-preferences';

export type ConsentState = {
  version:
    number;

  analytics:
    boolean;

  marketing:
    boolean;
};

export const DEFAULT_CONSENT_STATE:
  ConsentState = {
    version:
      CONSENT_VERSION,

    analytics:
      false,

    marketing:
      false,
  };

const CONSENT_MAX_AGE_SECONDS =
  60 *
  60 *
  24 *
  180;

/*
 * =========================================================
 * COOKIE SERIALIZATION
 * =========================================================
 */

function serializeConsent(
  consent:
    ConsentState,
) {
  return encodeURIComponent(
    JSON.stringify(
      consent,
    ),
  );
}

function deserializeConsent(
  value:
    string,
):
  ConsentState | null {
  try {
    const decoded =
      decodeURIComponent(
        value,
      );

    const parsed:
      unknown =
      JSON.parse(
        decoded,
      );

    if (
      !parsed ||
      typeof parsed !==
        'object'
    ) {
      return null;
    }

    const candidate =
      parsed as Partial<ConsentState>;

    if (
      candidate.version !==
        CONSENT_VERSION ||
      typeof candidate.analytics !==
        'boolean' ||
      typeof candidate.marketing !==
        'boolean'
    ) {
      return null;
    }

    return {
      version:
        candidate.version,

      analytics:
        candidate.analytics,

      marketing:
        candidate.marketing,
    };
  } catch {
    return null;
  }
}

/*
 * =========================================================
 * READ
 * =========================================================
 */

export function getStoredConsent():
  ConsentState | null {
  if (
    typeof document ===
    'undefined'
  ) {
    return null;
  }

  const cookiePrefix =
    `${CONSENT_COOKIE_NAME}=`;

  const cookie =
    document.cookie
      .split('; ')
      .find(
        (
          item,
        ) =>
          item.startsWith(
            cookiePrefix,
          ),
      );

  if (
    !cookie
  ) {
    return null;
  }

  const value =
    cookie.slice(
      cookiePrefix.length,
    );

  return deserializeConsent(
    value,
  );
}

/*
 * =========================================================
 * WRITE
 * =========================================================
 */

export function saveConsent(
  consent:
    ConsentState,
) {
  if (
    typeof document ===
    'undefined'
  ) {
    return;
  }

  const normalized:
    ConsentState = {
      version:
        CONSENT_VERSION,

      analytics:
        consent.analytics,

      marketing:
        consent.marketing,
    };

  const secure =
    window.location.protocol ===
    'https:'
      ? '; Secure'
      : '';

  document.cookie =
    [
      `${CONSENT_COOKIE_NAME}=${serializeConsent(
        normalized,
      )}`,
      'Path=/',
      `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
      'SameSite=Lax',
    ].join('; ') +
    secure;

  window.dispatchEvent(
    new CustomEvent<ConsentState>(
      CONSENT_CHANGED_EVENT,
      {
        detail:
          normalized,
      },
    ),
  );
}

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

export function acceptAllConsent() {
  saveConsent({
    version:
      CONSENT_VERSION,

    analytics:
      true,

    marketing:
      true,
  });
}

export function acceptEssentialOnly() {
  saveConsent({
    version:
      CONSENT_VERSION,

    analytics:
      false,

    marketing:
      false,
  });
}

export function hasAnalyticsConsent() {
  return (
    getStoredConsent()
      ?.analytics ===
    true
  );
}

export function hasMarketingConsent() {
  return (
    getStoredConsent()
      ?.marketing ===
    true
  );
}

export function openConsentPreferences() {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  window.dispatchEvent(
    new Event(
      OPEN_CONSENT_PREFERENCES_EVENT,
    ),
  );
}