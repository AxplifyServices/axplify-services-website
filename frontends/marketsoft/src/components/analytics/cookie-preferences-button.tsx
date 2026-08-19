'use client';

import {
  openConsentPreferences,
} from '@/lib/analytics/consent';

type CookiePreferencesButtonProps = {
  label:
    string;
};

export function CookiePreferencesButton({
  label,
}: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      className="site-footer__cookie-button"
      onClick={
        openConsentPreferences
      }
    >
      {
        label
      }
    </button>
  );
}