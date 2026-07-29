'use client';

import {
  useLocale,
} from 'next-intl';

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

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="Language selector"
    >
      {routing.locales.map(
        (
          targetLocale,
        ) => (
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
              locale ===
              targetLocale
            }
            aria-current={
              locale ===
              targetLocale
                ? 'page'
                : undefined
            }
          >
            {
              languageLabels[
                targetLocale
              ]
            }
          </Link>
        ),
      )}
    </div>
  );
}