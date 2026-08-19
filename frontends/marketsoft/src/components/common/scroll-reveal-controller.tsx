'use client';

import {
  useEffect,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

const REVEAL_SELECTOR =
  '[data-reveal]';

const VISIBLE_CLASS =
  'is-revealed';

export function ScrollRevealController() {
  const pathname =
    usePathname();

  useEffect(
    () => {
      const elements =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            REVEAL_SELECTOR,
          ),
        );

      if (
        elements.length ===
        0
      ) {
        return;
      }

      const reduceMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

      if (
        reduceMotion ||
        !(
          'IntersectionObserver' in
          window
        )
      ) {
        elements.forEach(
          (
            element,
          ) => {
            element.classList.add(
              VISIBLE_CLASS,
            );
          },
        );

        return;
      }

      const observer =
        new IntersectionObserver(
          (
            entries,
          ) => {
            entries.forEach(
              (
                entry,
              ) => {
                if (
                  !entry.isIntersecting
                ) {
                  return;
                }

                entry.target.classList.add(
                  VISIBLE_CLASS,
                );

                observer.unobserve(
                  entry.target,
                );
              },
            );
          },
          {
            threshold:
              0.14,

            rootMargin:
              '0px 0px -8% 0px',
          },
        );

      const animationFrame =
        window.requestAnimationFrame(
          () => {
            elements.forEach(
              (
                element,
              ) => {
                const rect =
                  element.getBoundingClientRect();

                const isAlreadyVisible =
                  rect.top <
                    window.innerHeight *
                      0.92 &&
                  rect.bottom >
                    0;

                if (
                  isAlreadyVisible
                ) {
                  element.classList.add(
                    VISIBLE_CLASS,
                  );

                  return;
                }

                observer.observe(
                  element,
                );
              },
            );
          },
        );

      return () => {
        window.cancelAnimationFrame(
          animationFrame,
        );

        observer.disconnect();
      };
    },
    [
      pathname,
    ],
  );

  return null;
}