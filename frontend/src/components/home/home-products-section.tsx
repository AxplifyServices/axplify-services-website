'use client';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ProductCard,
} from '@/components/products/product-card';

import {
  Link,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicProduct,
} from '@/lib/public-products-api';

type HomeProductsSectionProps = {
  locale: AppLocale;
  products: PublicProduct[];
  eyebrow: string;
  title: string;
  description: string;
  discoverLabel: string;
  viewAllLabel: string;
};

export function HomeProductsSection({
  locale,
  products,
  eyebrow,
  title,
  description,
  discoverLabel,
  viewAllLabel,
}: HomeProductsSectionProps) {
  const trackRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(
      0,
    );

  const updateActiveIndex =
    useCallback(
      () => {
        const track =
          trackRef.current;

        if (
          !track
        ) {
          return;
        }

        const cards =
          Array.from(
            track.querySelectorAll<HTMLElement>(
              '.product-card',
            ),
          );

        if (
          cards.length ===
          0
        ) {
          setActiveIndex(
            0,
          );

          return;
        }

        const trackRect =
          track.getBoundingClientRect();

        const trackStart =
          locale ===
          'ar'
            ? trackRect.right
            : trackRect.left;

        let nearestIndex =
          0;

        let nearestDistance =
          Number.POSITIVE_INFINITY;

        cards.forEach(
          (
            card,
            index,
          ) => {
            const cardRect =
              card.getBoundingClientRect();

            const cardStart =
              locale ===
              'ar'
                ? cardRect.right
                : cardRect.left;

            const distance =
              Math.abs(
                cardStart -
                  trackStart,
              );

            if (
              distance <
              nearestDistance
            ) {
              nearestDistance =
                distance;

              nearestIndex =
                index;
            }
          },
        );

        setActiveIndex(
          nearestIndex,
        );
      },
      [
        locale,
      ],
    );

  useEffect(
    () => {
      const track =
        trackRef.current;

      if (
        !track
      ) {
        return;
      }

      updateActiveIndex();

      track.addEventListener(
        'scroll',
        updateActiveIndex,
        {
          passive:
            true,
        },
      );

      window.addEventListener(
        'resize',
        updateActiveIndex,
      );

      return () => {
        track.removeEventListener(
          'scroll',
          updateActiveIndex,
        );

        window.removeEventListener(
          'resize',
          updateActiveIndex,
        );
      };
    },
    [
      updateActiveIndex,
    ],
  );

  if (
    products.length ===
    0
  ) {
    return null;
  }

  function goToProduct(
    index:
      number,
  ) {
    const track =
      trackRef.current;

    if (
      !track
    ) {
      return;
    }

    const cards =
      track.querySelectorAll<HTMLElement>(
        '.product-card',
      );

    const targetCard =
      cards[index];

    if (
      !targetCard
    ) {
      return;
    }

    targetCard.scrollIntoView({
      behavior:
        'smooth',

      block:
        'nearest',

      inline:
        'start',
    });

    setActiveIndex(
      index,
    );
  }

  function goToPreviousProduct() {
    const nextIndex =
      activeIndex <=
      0
        ? products.length -
          1
        : activeIndex -
          1;

    goToProduct(
      nextIndex,
    );
  }

  function goToNextProduct() {
    const nextIndex =
      activeIndex >=
      products.length -
        1
        ? 0
        : activeIndex +
          1;

    goToProduct(
      nextIndex,
    );
  }

  return (
    <section
      className="home-products"
      dir={
        locale ===
        'ar'
          ? 'rtl'
          : 'ltr'
      }
      aria-labelledby="home-products-title"
    >
      <div className="site-container">
        <header
          className="home-products__heading"
          data-reveal="up"
        >
          <div className="home-products__heading-copy">
            <span className="home-products__eyebrow">
              {eyebrow}
            </span>

            <h2 id="home-products-title">
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>

          <Link
            href="/products"
            className="home-products__view-all"
          >
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </header>

        <div
          ref={
            trackRef
          }
          className="home-products__grid"
          data-reveal="up"
        >
          {products.map(
            product => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                discoverLabel={
                  discoverLabel
                }
                compact
              />
            ),
          )}
        </div>

        <div className="home-products__mobile-controls">
          {products.length >
          1 ? (
            <div
              className="home-carousel-controls"
              role="group"
              aria-label={title}
            >
              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label="Produit précédent"
                onClick={
                  goToPreviousProduct
                }
              >
                <ArrowLeft
                  size={18}
                  aria-hidden="true"
                />
              </button>

              <span className="home-carousel-controls__counter">
                {activeIndex +
                  1}
                /
                {products.length}
              </span>

              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label="Produit suivant"
                onClick={
                  goToNextProduct
                }
              >
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : null}

          <Link
            href="/products"
            className="home-products__view-all"
          >
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
