'use client';

import {
  MessageCircle,
} from 'lucide-react';

import {
  useTranslations,
} from 'next-intl';

import {
  Link,
  usePathname,
} from '@/i18n/navigation';

export function FloatingContactButton() {
  const pathname =
    usePathname();

  const t =
    useTranslations(
      'navigation',
    );

  /*
   * usePathname() fourni par next-intl retourne le chemin
   * sans le préfixe de langue.
   *
   * Les routes /fr/contact, /en/contact et /ar/contact
   * correspondent donc toutes à /contact ici.
   */
  if (
    pathname === '/contact' ||
    pathname.startsWith(
      '/contact/',
    )
  ) {
    return null;
  }

  return (
    <Link
      href="/contact"
      className="floating-contact-button"
      aria-label={
        t(
          'assist',
        )
      }
    >
      <span className="floating-contact-button__icon">
        <MessageCircle
          size={
            20
          }
          strokeWidth={
            2.2
          }
          aria-hidden="true"
        />
      </span>

      <span className="floating-contact-button__label">
        {
          t(
            'assist',
          )
        }
      </span>
    </Link>
  );
}