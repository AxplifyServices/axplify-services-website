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

  title:
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
    locale,
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
  title,
  readMoreLabel,
  viewAllLabel,
  publicationTypeLabels,
  publications,
}: HomeInsightsSectionProps) {
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
              '.home-insights-card',
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
    publications.length ===
    0
  ) {
    return null;
  }

  function goToPublication(
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
        '.home-insights-card',
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

  function goToPreviousPublication() {
    const nextIndex =
      activeIndex <=
      0
        ? publications.length -
          1
        : activeIndex -
          1;

    goToPublication(
      nextIndex,
    );
  }

  function goToNextPublication() {
    const nextIndex =
      activeIndex >=
      publications.length -
        1
        ? 0
        : activeIndex +
          1;

    goToPublication(
      nextIndex,
    );
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
          <h2 id="home-insights-title">
            {title}
          </h2>
        </header>

        <div
          ref={
            trackRef
          }
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
                          {
                            publication.excerpt
                              ? (
                                  <p>
                                    {
                                      publication.excerpt
                                    }
                                  </p>
                                )
                              : null
                          }

                          <span className="home-insights-card__button">
                            <span>
                              {readMoreLabel}
                            </span>

                            <ArrowRight
                              size={
                                19
                              }
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

        <footer
          className="home-insights__footer"
          data-reveal="up"
        >
<Link
  href="/insights"
  className="home-services__link home-insights__view-all"
>
            <span>
              {viewAllLabel}
            </span>

            <ArrowRight
              size={
                18
              }
              aria-hidden="true"
            />
          </Link>

          {publications.length >
          1 ? (
            <div
              className="home-carousel-controls home-insights__mobile-controls"
              role="group"
              aria-label={title}
            >
              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label="Article précédent"
                onClick={
                  goToPreviousPublication
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
                {publications.length}
              </span>

              <button
                type="button"
                className="home-carousel-controls__arrow"
                aria-label="Article suivant"
                onClick={
                  goToNextPublication
                }
              >
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </button>
            </div>
          ) : null}
        </footer>
      </div>
    </section>
  );
}