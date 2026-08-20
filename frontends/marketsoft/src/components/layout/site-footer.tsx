import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { getLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getMarketSoftCopy } from '@/lib/marketsoft-content';
import {
  AXPLIFY_URL,
  MARKETSOFT_FACEBOOK_URL,
  MARKETSOFT_INSTAGRAM_URL,
  MARKETSOFT_LINKEDIN_URL,
} from '@/lib/site-config';
import { CookiePreferencesButton } from '@/components/analytics/cookie-preferences-button';


function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 22v-8h2.75l.41-3H13.5V9.08c0-.87.24-1.46 1.58-1.46H16.8V4.94c-.3-.04-1.32-.13-2.52-.13-2.5 0-4.21 1.53-4.21 4.34V11H7.25v3h2.82v8h3.43Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 8.5H3.25V21H6.5V8.5ZM4.88 3A1.88 1.88 0 1 0 4.88 6.75 1.88 1.88 0 0 0 4.88 3ZM21 14.1c0-3.77-2.01-5.52-4.7-5.52-2.17 0-3.14 1.19-3.68 2.03V8.5H9.37V21h3.25v-6.19c0-1.63.31-3.21 2.33-3.21 1.99 0 2.01 1.86 2.01 3.32V21H21v-6.9Z" />
    </svg>
  );
}

function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, '');
}

export async function SiteFooter() {
  const locale = (await getLocale()) as AppLocale;
  const copy = getMarketSoftCopy(locale);

  const nav = [
    ['/platform', copy.nav.platform],
    ['/packages', copy.nav.packages],
    ['/benefits', copy.nav.benefits],
    ['/compare', copy.nav.compare],
    ['/faq', copy.nav.faq],
    ['/contact', copy.nav.contact],
  ] as const;

  const cookieLabel =
    locale === 'fr'
      ? 'Préférences cookies'
      : locale === 'ar'
        ? 'تفضيلات ملفات الارتباط'
        : 'Cookie preferences';

  const developed =
    locale === 'fr'
      ? 'Développé par'
      : locale === 'ar'
        ? 'تم التطوير بواسطة'
        : 'Developed by';

  const whatsappNumber = normalizeWhatsappNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        copy.contact.directContact.whatsappMessage,
      )}`
    : null;

  return (
    <footer className="ms-footer">
      <div className="site-container ms-footer__grid">
        <div className="ms-footer__brand">
          <Image
            src="/brand/marketsoft-logo-wordmark.png"
            alt="MarketSoft"
            width={280}
            height={86}
          />
          <p>{copy.slogan}</p>

          <div className="ms-footer__socials" aria-label="MarketSoft social media">
            <a
              href={MARKETSOFT_FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>

            <a
              href={MARKETSOFT_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>

            <a
              href={MARKETSOFT_LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedinIcon />
            </a>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="ms-footer__links">
          {nav.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>

        <div className="ms-footer__cta">
          <Link href="/order" className="ms-button ms-button--primary">
            {copy.nav.order}
          </Link>

          <Link href="/contact" className="ms-button ms-button--ghost">
            {copy.nav.demo}
          </Link>
        </div>
      </div>

      <div className="site-container ms-footer__bottom">
        <span>© {new Date().getFullYear()} MarketSoft</span>

        <CookiePreferencesButton label={cookieLabel} />

        <a
          href={AXPLIFY_URL}
          target="_blank"
          rel="noreferrer"
          className="ms-footer__axplify"
        >
          <span>{developed}</span>
          <Image
            src="/brand/logo_axplify_-_V1_icone-removebg-preview.png"
            alt="Axplify Services"
            width={42}
            height={42}
          />
        </a>
      </div>
    </footer>
  );
}
