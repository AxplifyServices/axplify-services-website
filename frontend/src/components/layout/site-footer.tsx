import Image from 'next/image';

import {
  ArrowUpRight,
  ChevronRight,
  Mail,
} from 'lucide-react';

import {
  getTranslations,
} from 'next-intl/server';

import {
  Link,
} from '@/i18n/navigation';

const primaryLinks = [
  {
    href:
      '/',

    key:
      'home',
  },

  {
    href:
      '/services',

    key:
      'services',
  },

  {
    href:
      '/products',

    key:
      'products',
  },

  {
    href:
      '/insights',

    key:
      'insights',
  },
] as const;

const companyLinks = [
  {
    href:
      '/about',

    key:
      'about',
  },

  {
    href:
      '/about/work-process',

    key:
      'workProcess',
  },

  {
    href:
      '/faq',

    key:
      'faq',
  },

  {
    href:
      '/contact',

    key:
      'contact',
  },
] as const;

export async function SiteFooter() {
  const t =
    await getTranslations(
      'footer',
    );

  const navigationT =
    await getTranslations(
      'navigation',
    );

  return (
    <footer className="site-footer">
      <div className="site-container site-footer__grid">
        <div className="site-footer__brand-column">
          <Link
            href="/"
            className="site-footer__logo-card"
            aria-label="Axplify Services"
          >
            <Image
              src="/brand/axplify-logo.svg"
              alt="Axplify Services"
              width={
                220
              }
              height={
                74
              }
              className="site-footer__logo"
            />
          </Link>

          <p className="site-footer__description">
            {
              t(
                'description',
              )
            }
          </p>

          <Link
            href="/assist"
            className="button button--footer"
          >
            {
              t(
                'cta',
              )
            }

            <ArrowUpRight
              size={
                17
              }
              aria-hidden="true"
            />
          </Link>
        </div>

        <div>
          <p className="site-footer__heading">
            {
              t(
                'explore',
              )
            }
          </p>

          <nav
            className="site-footer__links"
            aria-label={
              t(
                'explore',
              )
            }
          >
            {primaryLinks.map(
              (
                item,
              ) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="site-footer__link"
                >
                  <span>
                    {
                      navigationT(
                        item.key,
                      )
                    }
                  </span>

                  <ChevronRight
                    size={
                      16
                    }
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </nav>
        </div>

        <div>
          <p className="site-footer__heading">
            {
              t(
                'company',
              )
            }
          </p>

          <nav
            className="site-footer__links"
            aria-label={
              t(
                'company',
              )
            }
          >
            {companyLinks.map(
              (
                item,
              ) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="site-footer__link"
                >
                  <span>
                    {
                      navigationT(
                        item.key,
                      )
                    }
                  </span>

                  <ChevronRight
                    size={
                      16
                    }
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </nav>
        </div>

        <div>
          <p className="site-footer__heading">
            {
              t(
                'contactTitle',
              )
            }
          </p>

          <p className="site-footer__contact-copy">
            {
              t(
                'contactCopy',
              )
            }
          </p>

          <Link
            href="/contact"
            className="site-footer__contact-link"
          >
            <Mail
              size={
                17
              }
              aria-hidden="true"
            />

            {
              t(
                'contactLink',
              )
            }
          </Link>
        </div>
      </div>

      <div className="site-container site-footer__bottom">
        <p>
          © {new Date().getFullYear()}{' '}
          Axplify Services.{' '}
          {
            t(
              'rights',
            )
          }
        </p>

        <p>
          {
            t(
              'tagline',
            )
          }
        </p>
      </div>
    </footer>
  );
}