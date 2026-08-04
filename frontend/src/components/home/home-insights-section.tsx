'use client';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import {
  useRef,
} from 'react';

import {
  Link,
} from '@/i18n/navigation';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicPublication,
  PublicationContentType,
} from '@/lib/public-publications-api';

type HomeInsightsSectionProps = {
  locale:
    AppLocale;

  eyebrow:
    string;

  title:
    string;

  introduction:
    string;

  previousLabel:
    string;

  nextLabel:
    string;

  readMoreLabel:
    string;

  viewAllLabel:
    string;

  publicationTypeLabels:
    Record<
      PublicationContentType,
      string
    >;

  publications:
    PublicPublication[];
};

function formatPublicationDate(
  value:
    string | null,

  locale:
    AppLocale,
) {
  if (
    !value
  ) {
    return '';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    locale ===
      'ar'
      ? 'ar'
      : locale,
    {
      day:
        'numeric',

      month:
        'long',

      year:
        'numeric',
    },
  ).format(
    date,
  );
}

export function HomeInsightsSection({
  locale,
  eyebrow,
  title,
  introduction,
  previousLabel,
  nextLabel,
  readMoreLabel,
  viewAllLabel,
  publicationTypeLabels,
  publications,
}: HomeInsightsSectionProps) {
  const trackRef =
    useRef<HTMLDivElement>(
      null,
    );

  if (
    publications.length ===
    0
  ) {
    return null;
  }

  function scrollTrack(
    direction:
      -1 |
      1,
  ) {
    const track =
      trackRef.current;

    if (
      !track
    ) {
      return;
    }

    const firstCard =
      track.querySelector<HTMLElement>(
        '.home-insights-card',
      );

    const cardWidth =
      firstCard?.offsetWidth ??
      Math.min(
        track.clientWidth *
          0.85,
        430,
      );

    const gap =
      24;

    track.scrollBy({
      left:
        direction *
        (
          cardWidth +
          gap
        ),

      behavior:
        'smooth',
    });
  }

  return (
    <section
      className="home-insights"
      aria-labelledby="home-insights-title"
    >
      <div className="site-container">
        <header
          className="home-insights__heading"
          data-reveal="up"
        >
          <div className="home-insights__heading-copy">
            <p className="eyebrow">
              {eyebrow}
            </p>

            <h2 id="home-insights-title">
              {title}
            </h2>
          </div>

          <div className="home-insights__heading-side">
            <p>
              {introduction}
            </p>

            <div className="home-insights__actions">
              <button
                type="button"
                className="home-insights__navigation-button"
                onClick={
                  () =>
                    scrollTrack(
                      locale ===
                        'ar'
                        ? 1
                        : -1,
                    )
                }
                aria-label={
                  previousLabel
                }
              >
                <ArrowLeft
                  size={20}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="home-insights__navigation-button"
                onClick={
                  () =>
                    scrollTrack(
                      locale ===
                        'ar'
                        ? -1
                        : 1,
                    )
                }
                aria-label={
                  nextLabel
                }
              >
                <ArrowRight
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </header>

        <div
          ref={trackRef}
          className="home-insights__track"
        >
          {
            publications.map(
              publication => {
                const category =
                  publicationTypeLabels[
                    publication.contentType
                  ];

                const date =
                  formatPublicationDate(
                    publication.publishedAt,
                    locale,
                  );

                const theme =
                  publication.tags[0]
                    ?.label ??
                  publication.expertiseCodes[0] ??
                  category;

                const coverImage =
                  publication.coverMedia
                    ?.cardImageUrl;

                return (
                  <article
                    key={
                      publication.id
                    }
                    className="home-insights-card"
                    data-reveal="up"
                  >
                    <Link
                      href={{
                        pathname:
                          '/insights/[slug]',

                        params: {
                          slug:
                            publication.slug,
                        },
                      }}
                      className="home-insights-card__link"
                      aria-label={
                        `${readMoreLabel} : ${publication.title}`
                      }
                    >
                      <div className="home-insights-card__visual">
                        {
                          coverImage
                            ? (
                                <img
                                  src={
                                    coverImage
                                  }
                                  alt={
                                    publication
                                      .coverMedia
                                      ?.altText ||
                                    publication.title
                                  }
                                  loading="lazy"
                                  decoding="async"
                                />
                              )
                            : (
                                <div
                                  className="home-insights-card__placeholder"
                                  aria-hidden="true"
                                />
                              )
                        }

                        <span className="home-insights-card__theme">
                          {theme}
                        </span>
                      </div>

                      <div className="home-insights-card__panel">
                        <div className="home-insights-card__meta">
                          <strong>
                            {category}
                          </strong>

                          {
                            date
                              ? (
                                  <time
                                    dateTime={
                                      publication.publishedAt ??
                                      undefined
                                    }
                                  >
                                    {date}
                                  </time>
                                )
                              : null
                          }
                        </div>

                        <h3>
                          {
                            publication.title
                          }
                        </h3>

                        <div className="home-insights-card__hover-content">
                          <p>
                            {
                              publication.excerpt
                            }
                          </p>

                          <span className="home-insights-card__button">
                            <span>
                              {readMoreLabel}
                            </span>

                            <ArrowRight
                              size={21}
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              },
            )
          }
        </div>

        <div
          className="home-insights__footer"
          data-reveal="up"
        >
          <Link
            href="/insights"
            className="home-insights__view-all"
          >
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={19}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}