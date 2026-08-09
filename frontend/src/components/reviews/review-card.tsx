import {
  BriefcaseBusiness,
  Building2,
  Quote,
  Star,
} from 'lucide-react';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  Link,
} from '@/i18n/navigation';

import type {
  PublicReview,
  PublicReviewProject,
} from '@/lib/public-reviews-api';

type ReviewCardProps = {
  locale:
    AppLocale;

  review:
    PublicReview;

  projectLabel:
    string;

  compact?:
    boolean;
};

function resolveProjectTitle(
  project:
    PublicReviewProject,

  locale:
    AppLocale,
) {
  if (
    locale ===
    'ar'
  ) {
    return (
      project.titleAr ||
      project.titleEn ||
      project.titleFr
    );
  }

  if (
    locale ===
    'en'
  ) {
    return (
      project.titleEn ||
      project.titleFr ||
      project.titleAr
    );
  }

  return (
    project.titleFr ||
    project.titleEn ||
    project.titleAr
  );
}

function ReviewStars({
  rating,
}: {
  rating:
    number;
}) {
  return (
    <div
      className="review-card__stars"
      aria-label={`${rating} / 5`}
    >
      {Array.from({
        length:
          5,
      }).map(
        (
          _,
          index,
        ) => (
          <Star
            key={
              index
            }
            size={18}
            strokeWidth={1.65}
            fill={
              index <
              rating
                ? 'currentColor'
                : 'none'
            }
            aria-hidden="true"
          />
        ),
      )}
    </div>
  );
}

export function ReviewCard({
  locale,
  review,
  projectLabel,
  compact = false,
}: ReviewCardProps) {
  const projectTitle =
    review.project
      ? resolveProjectTitle(
          review.project,
          locale,
        )
      : null;

  return (
    <article
      className="review-card"
      data-compact={
        compact
      }
    >
      <header className="review-card__header">
        <ReviewStars
          rating={
            review.rating
          }
        />

        <Quote
          className="review-card__quote-icon"
          size={28}
          strokeWidth={1.35}
          aria-hidden="true"
        />
      </header>

      <blockquote className="review-card__comment">
        {review.comment}
      </blockquote>

      <footer className="review-card__footer">
        <div className="review-card__person">
          <strong>
            {review.firstName}{' '}
            {review.lastName}
          </strong>

          <span>
            <BriefcaseBusiness
              size={14}
              aria-hidden="true"
            />

            {review.companyRole}
          </span>

          <span>
            <Building2
              size={14}
              aria-hidden="true"
            />

            {review.companyName}
          </span>
        </div>

{review.project &&
projectTitle ? (
<Link
  href={{
    pathname:
      '/projects',

    hash:
      `project-${review.project.id}`,
  }}
  className="review-card__project"
  aria-label={`${projectLabel} : ${projectTitle}`}
>
    <span>
      {projectLabel}
    </span>

    <strong>
      {projectTitle}
    </strong>

    {review.project.client
      ?.name ? (
      <small>
        {
          review.project
            .client.name
        }
      </small>
    ) : null}
  </Link>
) : null}
      </footer>
    </article>
  );
}