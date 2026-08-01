'use client';

import {
  MessageCircle,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

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

  const buttonRef =
    useRef<HTMLAnchorElement | null>(
      null,
    );

  /*
   * Sur la page d’accueil, la brochure est visible dès
   * le premier rendu. On initialise donc le bouton dans
   * son état compact pour éviter un flash du texte avant
   * la première mesure côté navigateur.
   */
  const [
    isOverlappingBrochure,
    setIsOverlappingBrochure,
  ] =
    useState(
      pathname === '/',
    );

  useEffect(
    () => {
      const button =
        buttonRef.current;

      const brochure =
        document.querySelector<HTMLElement>(
          '.home-brochure',
        );

      /*
       * Sur les pages qui ne contiennent aucune brochure,
       * le bouton doit rester dans sa version complète.
       */
      if (
        !button ||
        !brochure
      ) {
        setIsOverlappingBrochure(
          false,
        );

        return;
      }

      let animationFrameId:
        number | null =
        null;

      const updateOverlapState =
        () => {
          animationFrameId =
            null;

          const buttonRectangle =
            button.getBoundingClientRect();

          const brochureRectangle =
            brochure.getBoundingClientRect();

          /*
           * On vérifie le chevauchement réel des deux
           * rectangles, plutôt qu’une distance de scroll
           * arbitraire.
           */
          const overlapsHorizontally =
            buttonRectangle.left <
              brochureRectangle.right &&
            buttonRectangle.right >
              brochureRectangle.left;

          const overlapsVertically =
            buttonRectangle.top <
              brochureRectangle.bottom &&
            buttonRectangle.bottom >
              brochureRectangle.top;

          const overlapsBrochure =
            overlapsHorizontally &&
            overlapsVertically;

          setIsOverlappingBrochure(
            currentValue =>
              currentValue ===
              overlapsBrochure
                ? currentValue
                : overlapsBrochure,
          );
        };

      const requestOverlapUpdate =
        () => {
          if (
            animationFrameId !==
            null
          ) {
            return;
          }

          animationFrameId =
            window.requestAnimationFrame(
              updateOverlapState,
            );
        };

      /*
       * Une première mesure est effectuée immédiatement,
       * puis à chaque scroll ou redimensionnement.
       */
      requestOverlapUpdate();

      window.addEventListener(
        'scroll',
        requestOverlapUpdate,
        {
          passive: true,
        },
      );

      window.addEventListener(
        'resize',
        requestOverlapUpdate,
      );

      /*
       * ResizeObserver couvre aussi les changements de
       * taille provoqués par le chargement des images,
       * la barre mobile ou une modification dynamique
       * de la brochure.
       */
      const resizeObserver =
        new ResizeObserver(
          requestOverlapUpdate,
        );

      resizeObserver.observe(
        brochure,
      );

      resizeObserver.observe(
        button,
      );

      return () => {
        window.removeEventListener(
          'scroll',
          requestOverlapUpdate,
        );

        window.removeEventListener(
          'resize',
          requestOverlapUpdate,
        );

        resizeObserver.disconnect();

        if (
          animationFrameId !==
          null
        ) {
          window.cancelAnimationFrame(
            animationFrameId,
          );
        }
      };
    },
    [
      pathname,
    ],
  );

  /*
   * usePathname() fourni par next-intl retourne le chemin
   * sans le préfixe de langue.
   *
   * /fr/contact, /en/contact et /ar/contact correspondent
   * donc toutes à /contact ici.
   */
  if (
    pathname === '/contact' ||
    pathname.startsWith(
      '/contact/',
    )
  ) {
    return null;
  }

  const label =
    t(
      'assist',
    );

  return (
    <Link
      ref={
        buttonRef
      }
      href="/contact"
      className="floating-contact-button"
      data-compact={
        isOverlappingBrochure
          ? 'true'
          : 'false'
      }
      aria-label={
        label
      }
      title={
        isOverlappingBrochure
          ? label
          : undefined
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

      <span
        className="floating-contact-button__label"
        aria-hidden={
          isOverlappingBrochure
        }
      >
        {
          label
        }
      </span>
    </Link>
  );
}