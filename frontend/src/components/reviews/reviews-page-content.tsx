'use client';

import {
  ArrowLeft,
  ArrowRight,
  MessageSquareQuote,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicReview,
} from '@/lib/public-reviews-api';

import {
  ReviewCard,
} from './review-card';

type ReviewsPageContentProps = {
  locale:
    AppLocale;

  reviews:
    PublicReview[];

  currentPage:
    number;

  totalPages:
    number;

  totalResults:
    number;

  hero: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;
  };

  results: {
    label:
      string;

    single:
      string;
  };

  projectLabel:
    string;

  emptyState: {
    title:
      string;

    description:
      string;
  };

  pagination: {
    previous:
      string;

    next:
      string;

    page:
      string;

    of:
      string;
  };
};

type ReviewsPageHref = {
  pathname:
    '/reviews';

  query?: {
    page?:
      string;
  };
};

function buildReviewsHref(
  page:
    number,
): ReviewsPageHref {
  if (
    page <=
    1
  ) {
    return {
      pathname:
        '/reviews',
    };
  }

  return {
    pathname:
      '/reviews',

    query: {
      page:
        String(
          page,
        ),
    },
  };
}

export function ReviewsPageContent({
  locale,
  reviews,
  currentPage,
  totalPages,
  totalResults,
  hero,
  results,
  projectLabel,
  emptyState,
  pagination,
}: ReviewsPageContentProps) {
  const isRtl =
    locale ===
    'ar';

  return (
    <main
      className="reviews-page"
      dir={
        isRtl
          ? 'rtl'
          : 'ltr'
      }
    >
      <section className="reviews-page__hero">
        <div className="site-container">
          <div className="reviews-page__hero-content">
            <span className="reviews-page__eyebrow">
              {hero.eyebrow}
            </span>

            <h1>
              {hero.title}
            </h1>

            <p>
              {hero.description}
            </p>
          </div>
        </div>
      </section>

      <section className="reviews-page__content">
        <div className="site-container">
          <header className="reviews-page__results-header">
            <p>
              <strong>
                {totalResults}
              </strong>{' '}

              {totalResults ===
              1
                ? results.single
                : results.label}
            </p>
          </header>

          {reviews.length ===
          0 ? (
            <div className="reviews-page__empty">
              <MessageSquareQuote
                size={30}
                aria-hidden="true"
              />

              <h2>
                {emptyState.title}
              </h2>

              <p>
                {emptyState.description}
              </p>
            </div>
          ) : (
            <div className="reviews-page__grid">
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
                  />
                ),
              )}
            </div>
          )}

          {totalPages >
          1 ? (
            <nav
              className="reviews-pagination"
              aria-label={
                pagination.page
              }
            >
              {currentPage >
              1 ? (
                <Link
                  href={
                    buildReviewsHref(
                      currentPage -
                        1,
                    )
                  }
                  className="reviews-pagination__direction"
                >
                  {isRtl ? (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowLeft
                      size={17}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {pagination.previous}
                  </span>
                </Link>
              ) : (
                <span className="reviews-pagination__direction is-disabled">
                  {isRtl ? (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowLeft
                      size={17}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {pagination.previous}
                  </span>
                </span>
              )}

              <span className="reviews-pagination__current">
                {pagination.page}{' '}
                <strong>
                  {currentPage}
                </strong>{' '}
                {pagination.of}{' '}
                <strong>
                  {totalPages}
                </strong>
              </span>

              {currentPage <
              totalPages ? (
                <Link
                  href={
                    buildReviewsHref(
                      currentPage +
                        1,
                    )
                  }
                  className="reviews-pagination__direction"
                >
                  <span>
                    {pagination.next}
                  </span>

                  {isRtl ? (
                    <ArrowLeft
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ) : (
                <span className="reviews-pagination__direction is-disabled">
                  <span>
                    {pagination.next}
                  </span>

                  {isRtl ? (
                    <ArrowLeft
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  )}
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}