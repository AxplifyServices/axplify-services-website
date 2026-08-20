'use client';

import {
  ChevronDown,
} from 'lucide-react';

import {
  useLocale,
} from 'next-intl';

import {
  useParams,
} from 'next/navigation';

import {
  useEffect,
  useRef,
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
  fr: 'FR',
  en: 'EN',
  ar: 'AR',
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

  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false,
    );

  const [
    pendingLocale,
    setPendingLocale,
  ] =
    useState<AppLocale | null>(
      null,
    );

  useEffect(
    () => {
      setIsOpen(
        false,
      );

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

  useEffect(
    () => {
      if (
        !isOpen
      ) {
        return;
      }

      const closeOnOutsidePointer =
        (
          event:
            PointerEvent,
        ) => {
          const target =
            event.target;

          if (
            !(
              target instanceof
              Node
            )
          ) {
            return;
          }

          if (
            rootRef.current?.contains(
              target,
            )
          ) {
            return;
          }

          setIsOpen(
            false,
          );
        };

      const closeOnEscape =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            setIsOpen(
              false,
            );
          }
        };

      document.addEventListener(
        'pointerdown',
        closeOnOutsidePointer,
      );

      document.addEventListener(
        'keydown',
        closeOnEscape,
      );

      return () => {
        document.removeEventListener(
          'pointerdown',
          closeOnOutsidePointer,
        );

        document.removeEventListener(
          'keydown',
          closeOnEscape,
        );
      };
    },
    [
      isOpen,
    ],
  );

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

  function handleLocaleChange(
    targetLocale:
      AppLocale,
  ) {
    if (
      targetLocale ===
      locale
    ) {
      setIsOpen(
        false,
      );

      return;
    }

    setPendingLocale(
      targetLocale,
    );

    document.documentElement.setAttribute(
      'data-locale-switching',
      'true',
    );

    setIsOpen(
      false,
    );
  }

  return (
    <div
      ref={
        rootRef
      }
      className="language-switcher"
      data-open={
        isOpen
      }
      aria-busy={
        pendingLocale !==
        null
      }
    >
      <button
        type="button"
        className="language-switcher__trigger"
        aria-haspopup="menu"
        aria-expanded={
          isOpen
        }
        onClick={
          () =>
            setIsOpen(
              current =>
                !current,
            )
        }
      >
        <span>
          {
            languageLabels[
              locale
            ]
          }
        </span>

        <ChevronDown
          size={
            14
          }
          aria-hidden="true"
          className="language-switcher__chevron"
        />
      </button>

      {
        isOpen
          ? (
              <div
                className="language-switcher__menu"
                role="menu"
                aria-label="Language selector"
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

                      return (
                        <Link
                          key={
                            targetLocale
                          }
                          href={
                            getLanguageSwitcherHref(
                              targetLocale,
                            )
                          }
                          locale={
                            targetLocale
                          }
                          hrefLang={
                            targetLocale
                          }
                          role="menuitem"
                          className="language-switcher__option"
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
                          <span>
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
            )
          : null
      }
    </div>
  );
}
