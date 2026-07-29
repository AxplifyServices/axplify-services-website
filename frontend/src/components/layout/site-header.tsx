'use client';

import Image from 'next/image';

import {
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

import {
  useTranslations,
} from 'next-intl';

import {
  useEffect,
  useState,
} from 'react';

import {
  LanguageSwitcher,
} from '@/components/common/language-switcher';

import {
  Link,
  usePathname,
} from '@/i18n/navigation';

import {
  navigationItems,
} from '@/lib/site-config';

function isActivePath(
  pathname: string,
  href: string,
) {
  if (
    href === '/'
  ) {
    return pathname === '/';
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

export function SiteHeader() {
  const t =
    useTranslations(
      'navigation',
    );

  const pathname =
    usePathname();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(
    false,
  );

  const [
    isAboutOpen,
    setIsAboutOpen,
  ] = useState(
    false,
  );

  useEffect(
    () => {
      setIsMenuOpen(
        false,
      );

      setIsAboutOpen(
        false,
      );
    },
    [
      pathname,
    ],
  );

  useEffect(
    () => {
      document.body.style.overflow =
        isMenuOpen
          ? 'hidden'
          : '';

      return () => {
        document.body.style.overflow =
          '';
      };
    },
    [
      isMenuOpen,
    ],
  );

  useEffect(
    () => {
      function closeOnEscape(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setIsMenuOpen(
            false,
          );

          setIsAboutOpen(
            false,
          );
        }
      }

      document.addEventListener(
        'keydown',
        closeOnEscape,
      );

      return () => {
        document.removeEventListener(
          'keydown',
          closeOnEscape,
        );
      };
    },
    [],
  );

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link
          href="/"
          className="site-header__brand"
          aria-label={
            t('home')
          }
        >
          <Image
            src="/brand/axplify-logo.svg"
            alt="Axplify Services"
            width={
              230
            }
            height={
              76
            }
            priority
            className="site-header__logo"
          />
        </Link>

        <nav
          className="site-header__desktop-nav"
          aria-label={
            t(
              'primaryNav',
            )
          }
        >
          {navigationItems.map(
            (
              item,
            ) => {
              if (
                item.href ===
                '/about'
              ) {
                const active =
                  isActivePath(
                    pathname,
                    '/about',
                  );

                return (
                  <div
                    key={
                      item.href
                    }
                    className="site-header__dropdown"
                  >
                    <button
                      type="button"
                      className="site-header__nav-link"
                      data-active={
                        active
                      }
                      aria-expanded={
                        isAboutOpen
                      }
                      onClick={
                        () =>
                          setIsAboutOpen(
                            (
                              current,
                            ) =>
                              !current,
                          )
                      }
                    >
                      {
                        t(
                          item.translationKey,
                        )
                      }

                      <ChevronDown
                        size={
                          15
                        }
                        aria-hidden="true"
                        className={
                          isAboutOpen
                            ? 'rotate-180'
                            : undefined
                        }
                      />
                    </button>

                    {isAboutOpen ? (
                      <div className="site-header__dropdown-panel">
                        <Link
                          href="/about"
                          className="site-header__dropdown-link"
                        >
                          {
                            t(
                              'aboutOverview',
                            )
                          }
                        </Link>

                        <Link
                          href="/about/work-process"
                          className="site-header__dropdown-link"
                        >
                          {
                            t(
                              'workProcess',
                            )
                          }
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="site-header__nav-link"
                  data-active={
                    isActivePath(
                      pathname,
                      item.href,
                    )
                  }
                >
                  {
                    t(
                      item.translationKey,
                    )
                  }
                </Link>
              );
            },
          )}
        </nav>

        <div className="site-header__desktop-actions">
          <LanguageSwitcher />

          <Link
            href="/assist"
            className="button button--primary button--compact"
          >
            {
              t(
                'assist',
              )
            }
          </Link>
        </div>

        <button
          type="button"
          className="site-header__menu-button"
          aria-label={
            isMenuOpen
              ? t(
                  'closeMenu',
                )
              : t(
                  'openMenu',
                )
          }
          aria-expanded={
            isMenuOpen
          }
          aria-controls="mobile-navigation"
          onClick={
            () =>
              setIsMenuOpen(
                (
                  current,
                ) =>
                  !current,
              )
          }
        >
          {isMenuOpen ? (
            <X
              size={
                22
              }
            />
          ) : (
            <Menu
              size={
                22
              }
            />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <>
          <button
            type="button"
            className="site-header__backdrop"
            aria-label={
              t(
                'closeMenu',
              )
            }
            onClick={
              () =>
                setIsMenuOpen(
                  false,
                )
            }
          />

          <div
            id="mobile-navigation"
            className="site-header__mobile-panel"
          >
            <div className="site-container site-header__mobile-content">
              <LanguageSwitcher />

              <nav
                className="site-header__mobile-nav"
                aria-label={
                  t(
                    'mobileNav',
                  )
                }
              >
                {navigationItems.map(
                  (
                    item,
                  ) => {
                    if (
                      item.href ===
                      '/about'
                    ) {
                      return (
                        <div
                          key={
                            item.href
                          }
                          className="site-header__mobile-group"
                        >
                          <Link
                            href="/about"
                            className="site-header__mobile-link"
                            data-active={
                              isActivePath(
                                pathname,
                                '/about',
                              )
                            }
                          >
                            {
                              t(
                                'about',
                              )
                            }
                          </Link>

                          <Link
                            href="/about/work-process"
                            className="site-header__mobile-sublink"
                            data-active={
                              pathname ===
                              '/about/work-process'
                            }
                          >
                            {
                              t(
                                'workProcess',
                              )
                            }
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        className="site-header__mobile-link"
                        data-active={
                          isActivePath(
                            pathname,
                            item.href,
                          )
                        }
                      >
                        {
                          t(
                            item.translationKey,
                          )
                        }
                      </Link>
                    );
                  },
                )}
              </nav>

              <Link
                href="/assist"
                className="button button--primary button--mobile"
              >
                {
                  t(
                    'assist',
                  )
                }
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}