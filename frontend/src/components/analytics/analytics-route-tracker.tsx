'use client';

import {
  useEffect,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

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

  useEffect(
    () => {
      /*
       * pathname est volontairement utilisé
       * comme dépendance.
       *
       * Next.js peut changer de page sans
       * recharger entièrement le navigateur.
       *
       * Sans ce tracker, une navigation :
       *
       * /fr
       *   ↓
       * /fr/services
       *
       * pourrait ne pas être interprétée
       * correctement comme une nouvelle vue
       * par notre couche analytics.
       */
      trackPageView({
        locale,
      });
    },
    [
      locale,
      pathname,
    ],
  );

  return null;
}