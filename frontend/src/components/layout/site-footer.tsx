import Image from 'next/image';

import {
  ChevronRight,
  Mail,
} from 'lucide-react';

import {
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

import {
  getLocale,
  getTranslations,
} from 'next-intl/server';

import {
  Link,
} from '@/i18n/navigation';

const primaryLinks = [
  {
    href: '/',
    key: 'home',
  },
  {
    href: '/services',
    key: 'services',
  },
  {
    href: '/products',
    key: 'products',
  },
  {
    href: '/insights',
    key: 'insights',
  },
] as const;

const companyLinks = [
  {
    href: '/about',
    key: 'about',
  },
  {
    href: '/about/work-process',
    key: 'workProcess',
  },
  {
    href: '/faq',
    key: 'faq',
  },
] as const;

const linkedInUrl =
  'https://www.linkedin.com/company/axplify-services/home';

const whatsappUrl =
  'https://wa.me/212688194555';

export async function SiteFooter() {
  const locale =
    await getLocale();

  const t =
    await getTranslations(
      'footer',
    );

  const navigationT =
    await getTranslations(
      'navigation',
    );

  /*
   * Le slogan arabe doit rester en anglais.
   * Les textes sont donc structurés en trois parties
   * afin de colorer le premier mot de chaque phrase.
   */
  const tagline =
    locale === 'fr'
      ? {
          first: 'Simplifiez',
          firstRest: ' vos processus.',
          second: 'Valorisez',
          secondRest: ' vos données.',
          third: 'Libérez',
          thirdRest: ' votre potentiel !',
        }
      : {
          first: 'Simplify',
          firstRest: ' your processes.',
          second: 'Unlock',
          secondRest: ' the value of your data.',
          third: 'Unleash',
          thirdRest: ' your potential!',
        };

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
              width={220}
              height={74}
              className="site-footer__logo"
            />
          </Link>

          <p className="site-footer__description">
            {t(
              'description',
            )}
          </p>

          <div
            className="site-footer__social-links"
            aria-label={t(
              'socialTitle',
            )}
          >
            <a
              href={
                linkedInUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__social-link"
              aria-label={t(
                'linkedinLabel',
              )}
              title="LinkedIn"
            >
              <FaLinkedinIn
                size={19}
                aria-hidden="true"
              />
            </a>

            <a
              href={
                whatsappUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__social-link"
              aria-label={t(
                'whatsappLabel',
              )}
              title="WhatsApp"
            >
              <FaWhatsapp
                size={20}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div>
          <p className="site-footer__heading">
            {t(
              'explore',
            )}
          </p>

          <nav
            className="site-footer__links"
            aria-label={t(
              'explore',
            )}
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
                    {navigationT(
                      item.key,
                    )}
                  </span>

                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </nav>
        </div>

        <div>
          <p className="site-footer__heading">
            {t(
              'company',
            )}
          </p>

          <nav
            className="site-footer__links"
            aria-label={t(
              'company',
            )}
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
                    {navigationT(
                      item.key,
                    )}
                  </span>

                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </nav>
        </div>

<div className="site-footer__contact-column">
  <p className="site-footer__heading">
    {t(
      'contactTitle',
    )}
  </p>

  <p className="site-footer__contact-copy">
    {t(
      'contactCopy',
    )}
  </p>

  <p className="site-footer__contact-tagline">
    <strong className="site-footer__tagline-word">
      {
        tagline.first
      }
    </strong>

    {
      tagline.firstRest
    }{' '}

    <strong className="site-footer__tagline-word">
      {
        tagline.second
      }
    </strong>

    {
      tagline.secondRest
    }{' '}

    <strong className="site-footer__tagline-word">
      {
        tagline.third
      }
    </strong>

    {
      tagline.thirdRest
    }
  </p>
</div>
      </div>

      <div className="site-container site-footer__bottom">
        <p>
          © {new Date().getFullYear()}{' '}
          Axplify Services.{' '}
          {t(
            'rights',
          )}
        </p>
      </div>
    </footer>
  );
}