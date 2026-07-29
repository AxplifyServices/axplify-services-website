'use client';

import {
  useLocale,
} from 'next-intl';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  usePathname,
} from '@/i18n/navigation';

import {
  routing,
  type AppLocale,
} from '@/i18n/routing';

const languageLabels:
Record<AppLocale, string> = {
  fr:
    'FR',

  en:
    'EN',

  ar:
    'AR',
};

export function LanguageSwitcher() {
  const locale =
    useLocale() as AppLocale;

  const pathname =
    usePathname();

  const [
    pendingLocale,
    setPendingLocale,
  ] = useState<AppLocale | null>(
    null,
  );

  useEffect(
    () => {
      setPendingLocale(
        null,
      );

      document.documentElement.removeAttribute(
        'data-locale-switching',
      );
    },
    [
      locale,
      pathname,
    ],
  );

  function handleLocaleChange(
    targetLocale: AppLocale,
  ) {
    if (
      targetLocale === locale
    ) {
      return;
    }

    setPendingLocale(
      targetLocale,
    );

    document.documentElement.setAttribute(
      'data-locale-switching',
      'true',
    );
  }

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="Language selector"
      aria-busy={
        pendingLocale !==
        null
      }
    >
      {routing.locales.map(
        (
          targetLocale,
        ) => {
          const isActive =
            locale ===
            targetLocale;

          const isPending =
            pendingLocale ===
            targetLocale;

          return (
            <Link
              key={
                targetLocale
              }
              href={
                pathname
              }
              locale={
                targetLocale
              }
              hrefLang={
                targetLocale
              }
              className="language-switcher__item"
              data-active={
                isActive
              }
              data-pending={
                isPending
              }
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              onClick={
                () =>
                  handleLocaleChange(
                    targetLocale,
                  )
              }
            >
              <span className="language-switcher__label">
                {
                  languageLabels[
                    targetLocale
                  ]
                }
              </span>

              {isPending ? (
                <span
                  className="language-switcher__loader"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        },
      )}
    </div>
  );
}