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
  ReviewCard,
} from '@/components/reviews/review-card';

import {
  Link,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicReview,
} from '@/lib/public-reviews-api';

type HomeReviewsSectionProps = {
  locale:
    AppLocale;

  reviews:
    PublicReview[];

  eyebrow:
    string;

  title:
    string;

  description:
    string;

  projectLabel:
    string;

  viewAllLabel:
    string;

  previousLabel:
    string;

  nextLabel:
    string;
};

export function HomeReviewsSection({
  locale,
  reviews,
  eyebrow,
  title,
  description,
  projectLabel,
  viewAllLabel,
  previousLabel,
  nextLabel,
}: HomeReviewsSectionProps) {
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
              '.review-card',
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
    reviews.length ===
    0
  ) {
    return null;
  }

  function goToReview(
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
        '.review-card',
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

  function goToPreviousReview() {
    const nextIndex =
      activeIndex <=
      0
        ? reviews.length -
          1
        : activeIndex -
          1;

    goToReview(
      nextIndex,
    );
  }

  function goToNextReview() {
    const nextIndex =
      activeIndex >=
      reviews.length -
        1
        ? 0
        : activeIndex +
          1;

    goToReview(
      nextIndex,
    );
  }

  return (
    <section
      className="home-reviews"
      dir={
        locale ===
        'ar'
          ? 'rtl'
          : 'ltr'
      }
      aria-labelledby="home-reviews-title"
    >
      <div className="site-container">
        <header
          className="home-reviews__heading"
          data-reveal="up"
        >
          <div className="home-reviews__heading-copy">
            <span className="home-reviews__eyebrow">
              {eyebrow}
            </span>

            <h2 id="home-reviews-title">
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>

          <Link
            href="/reviews"
            className="home-reviews__view-all"
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
          className="home-reviews__track"
          data-reveal="up"
        >
          {reviews.map(
            review => (
              <ReviewCard
                key={
                  review.id
                }
                locale={
                  locale
                }
                review={
                  review
                }
                projectLabel={
                  projectLabel
                }
                compact
              />
            ),
          )}
        </div>

        <div className="home-reviews__mobile-controls">
          {reviews.length >
          1 ? (
            <div
              className="home-carousel-controls"
              role="group"
              aria-label={
                title
              }
            >
              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label={
                  previousLabel
                }
                onClick={
                  goToPreviousReview
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
                {reviews.length}
              </span>

              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label={
                  nextLabel
                }
                onClick={
                  goToNextReview
                }
              >
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : (
            <span />
          )}

          <Link
            href="/reviews"
            className="home-reviews__view-all"
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