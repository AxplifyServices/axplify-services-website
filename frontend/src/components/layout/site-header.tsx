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
  useRef,
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

const aboutDropdownRef =
  useRef<HTMLDivElement>(
    null,
  );

const mobileAboutDropdownRef =
  useRef<HTMLDivElement>(
    null,
  );  

useEffect(
  () => {
    /*
     * À chaque changement de page :
     * - le menu mobile se ferme ;
     * - le sous-menu À propos se referme ;
     * - il ne se rouvre jamais automatiquement,
     *   même lorsque la page active appartient à /about.
     */
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

useEffect(
  () => {
    if (
      !isAboutOpen
    ) {
      return;
    }

    const closeOnOutsidePointer =
      (
        event: PointerEvent,
      ) => {
        const target =
          event.target;

        if (
          !(target instanceof Node)
        ) {
          return;
        }

        if (
          aboutDropdownRef.current?.contains(
            target,
          ) ||
          mobileAboutDropdownRef.current?.contains(
            target,
          )
        ) {
          return;
        }

        setIsAboutOpen(
          false,
        );
      };

    document.addEventListener(
      'pointerdown',
      closeOnOutsidePointer,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeOnOutsidePointer,
      );
    };
  },
  [
    isAboutOpen,
  ],
);  

  const closeMobileNavigation = () => {
    setIsMenuOpen(
      false,
    );

    setIsAboutOpen(
      false,
    );

    /*
     * Libère immédiatement le défilement de la page cible.
     * Le Link continue ensuite sa navigation normalement.
     */
    document.body.style.overflow =
      '';
  };

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link
          href="/"
          className="site-header__brand"
          onClick={
            closeMobileNavigation
          }
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
  ref={
    aboutDropdownRef
  }
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
  onClick={
    () =>
      setIsAboutOpen(
        false,
      )
  }
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
  onClick={
    () =>
      setIsAboutOpen(
        false,
      )
  }
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
              closeMobileNavigation
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
  const isAboutActive =
    isActivePath(
      pathname,
      '/about',
    );

  return (
    <div
      ref={
        mobileAboutDropdownRef
      }
      key={
        item.href
      }
      className="site-header__mobile-group"
    >
      <button
        type="button"
        className="site-header__mobile-link site-header__mobile-link--toggle"
        data-active={
          isAboutActive
        }
        aria-expanded={
          isAboutOpen
        }
        aria-controls="mobile-about-submenu"
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
        <span>
          {
            t(
              'about',
            )
          }
        </span>

        <ChevronDown
          size={18}
          aria-hidden="true"
          className="site-header__mobile-chevron"
          data-open={
            isAboutOpen
          }
        />
      </button>

      <div
        id="mobile-about-submenu"
        className="site-header__mobile-submenu"
        data-open={
          isAboutOpen
        }
      >
        <div className="site-header__mobile-submenu-inner">
<Link
  href="/about"
  className="site-header__mobile-sublink"
  data-active={
    pathname ===
    '/about'
  }
  onClick={
    closeMobileNavigation
  }
>
  {
    t(
      'aboutOverview',
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
  onClick={
    closeMobileNavigation
  }
>
  {
    t(
      'workProcess',
    )
  }
</Link>
        </div>
      </div>
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
                        onClick={
                          closeMobileNavigation
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
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}