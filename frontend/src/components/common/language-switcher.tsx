'use client';

import {
  useLocale,
} from 'next-intl';

import {
  useParams,
} from 'next/navigation';

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

import {
  getServiceBySlug,
} from '@/lib/service-catalog';

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

  const params =
    useParams<{
      slug?:
        string |
        string[];

      token?:
        string |
        string[];

      serviceSlug?:
        string |
        string[];
    }>();

  const [
    pendingLocale,
    setPendingLocale,
  ] =
    useState<AppLocale | null>(
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
    targetLocale:
      AppLocale,
  ) {
    if (
      targetLocale ===
      locale
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

  const rawSlug =
    params.slug;

  const slug =
    Array.isArray(
      rawSlug,
    )
      ? rawSlug[0]
      : rawSlug;

  const rawToken =
    params.token;

  const token =
    Array.isArray(
      rawToken,
    )
      ? rawToken[0]
      : rawToken;

  const rawServiceSlug =
    params.serviceSlug;

  const serviceSlug =
    Array.isArray(
      rawServiceSlug,
    )
      ? rawServiceSlug[0]
      : rawServiceSlug;

  /*
   * Si nous sommes sur une page service individuelle,
   * on retrouve d'abord le service à partir du slug
   * de la langue actuellement affichée.
   *
   * On pourra ensuite construire l'URL correcte
   * dans chacune des langues disponibles.
   */
  const currentService =
    pathname ===
      '/services/[serviceSlug]' &&
    serviceSlug
      ? getServiceBySlug(
          locale,
          serviceSlug,
        )
      : undefined;

  function getLanguageSwitcherHref(
    targetLocale:
      AppLocale,
  ) {
    /*
     * Publications dynamiques.
     *
     * On conserve ici le comportement existant.
     * Le traitement avancé des slugs localisés
     * des publications reste indépendant.
     */
    if (
      pathname ===
      '/insights/[slug]'
    ) {
      if (
        !slug
      ) {
        return '/insights' as const;
      }

      return {
        pathname:
          '/insights/[slug]' as const,

        params: {
          slug,
        },
      };
    }

    /*
     * Pages privées de dépôt d'avis.
     */
    if (
      pathname ===
      '/reviews/submit/[token]'
    ) {
      if (
        !token
      ) {
        return '/' as const;
      }

      return {
        pathname:
          '/reviews/submit/[token]' as const,

        params: {
          token,
        },
      };
    }

    /*
     * Pages individuelles de services.
     *
     * Le slug est traduit selon la langue cible.
     *
     * Exemple :
     * intelligence-artificielle
     * → artificial-intelligence
     * → الذكاء-الاصطناعي
     */
    if (
      pathname ===
      '/services/[serviceSlug]'
    ) {
      if (
        !currentService
      ) {
        return '/services' as const;
      }

      return {
        pathname:
          '/services/[serviceSlug]' as const,

        params: {
          serviceSlug:
            currentService.slugs[
              targetLocale
            ],
        },
      };
    }

    return pathname;
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
      {
        routing.locales.map(
          targetLocale => {
            const isActive =
              locale ===
              targetLocale;

            const isPending =
              pendingLocale ===
              targetLocale;

            const languageSwitcherHref =
              getLanguageSwitcherHref(
                targetLocale,
              );

            return (
              <Link
                key={
                  targetLocale
                }
                href={
                  languageSwitcherHref
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

                {
                  isPending
                    ? (
                        <span
                          className="language-switcher__loader"
                          aria-hidden="true"
                        />
                      )
                    : null
                }
              </Link>
            );
          },
        )
      }
    </div>
  );
}