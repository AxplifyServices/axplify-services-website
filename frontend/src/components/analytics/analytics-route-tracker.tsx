'use client';

import {
  useCallback,
  useEffect,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  CONSENT_CHANGED_EVENT,
  type ConsentState,
  hasAnalyticsConsent,
} from '@/lib/analytics/consent';

import {
  trackPageView,
} from '@/lib/analytics/tracking';

type AnalyticsRouteTrackerProps = {
  locale:
    AppLocale;
};

export function AnalyticsRouteTracker({
  locale,
}: AnalyticsRouteTrackerProps) {
  const pathname =
    usePathname();

  const trackCurrentPage =
    useCallback(
      () => {
        if (
          !hasAnalyticsConsent()
        ) {
          return;
        }

        trackPageView({
          locale,
        });
      },
      [
        locale,
      ],
    );

  useEffect(
    () => {
      trackCurrentPage();
    },
    [
      pathname,
      trackCurrentPage,
    ],
  );

  useEffect(
    () => {
      const handleConsentChanged =
        (
          event:
            Event,
        ) => {
          const customEvent =
            event as CustomEvent<ConsentState>;

          if (
            customEvent
              .detail
              ?.analytics ===
            true
          ) {
            trackCurrentPage();
          }
        };

      window.addEventListener(
        CONSENT_CHANGED_EVENT,
        handleConsentChanged,
      );

      return () => {
        window.removeEventListener(
          CONSENT_CHANGED_EVENT,
          handleConsentChanged,
        );
      };
    },
    [
      trackCurrentPage,
    ],
  );

  return null;
}