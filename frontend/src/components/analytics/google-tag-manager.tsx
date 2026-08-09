'use client';

import {
  useEffect,
  useState,
} from 'react';

import Script from 'next/script';

import {
  CONSENT_CHANGED_EVENT,
  getStoredConsent,
  type ConsentState,
} from '@/lib/analytics/consent';

const GTM_ID =
  process.env
    .NEXT_PUBLIC_GTM_ID;

export function GoogleTagManager() {
  const [
    shouldLoad,
    setShouldLoad,
  ] =
    useState(
      false,
    );

  /*
   * =======================================================
   * INITIAL CONSENT
   * =======================================================
   */

  useEffect(
    () => {
      const consent =
        getStoredConsent();

      setShouldLoad(
        Boolean(
          consent?.analytics ||
            consent?.marketing,
        ),
      );
    },
    [],
  );

  /*
   * =======================================================
   * CONSENT CHANGES
   * =======================================================
   */

  useEffect(
    () => {
      const handleConsentChanged =
        (
          event:
            Event,
        ) => {
          const customEvent =
            event as CustomEvent<ConsentState>;

          const consent =
            customEvent.detail;

          setShouldLoad(
            Boolean(
              consent.analytics ||
                consent.marketing,
            ),
          );
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
    [],
  );

  if (
    !GTM_ID ||
    !shouldLoad
  ) {
    return null;
  }

  return (
    <>
      <Script
        id="axplify-gtm"
        strategy="afterInteractive"
      >
        {`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({
              'gtm.start':
                new Date().getTime(),
              event:'gtm.js'
            });

            var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'
                  ? '&l='+l
                  : '';

            j.async=true;

            j.src=
              'https://www.googletagmanager.com/gtm.js?id='
              + i + dl;

            f.parentNode.insertBefore(j,f);
          })(
            window,
            document,
            'script',
            'dataLayer',
            '${GTM_ID}'
          );
        `}
      </Script>
    </>
  );
}