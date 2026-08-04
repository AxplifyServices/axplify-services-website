import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

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

type InsightsPageContentProps = {
  locale:
    AppLocale;

  eyebrow:
    string;

  title:
    string;

  description:
    string;

  allLabel:
    string;

  readMoreLabel:
    string;

  emptyTitle:
    string;

  emptyDescription:
    string;

  previousLabel:
    string;

  nextLabel:
    string;

  currentType:
    PublicationContentType |
    null;

  currentPage:
    number;

  totalPages:
    number;

  publicationTypeLabels:
    Record<
      PublicationContentType,
      string
    >;

  publications:
    PublicPublication[];
};

const FILTER_TYPES:
  PublicationContentType[] = [
    'ARTICLE',
    'CASE_STUDY',
    'NEWS',
    'EVENT',
    'PRESS_RELEASE',
    'ANNOUNCEMENT',
    'GUIDE',
    'RESOURCE',
  ];

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

type InsightsPageHref = {
  pathname:
    '/insights';

  query?: {
    type?:
      PublicationContentType;

    page?:
      string;
  };
};

function buildPageHref({
  type,
  page,
}: {
  type:
    PublicationContentType |
    null;

  page:
    number;
}): InsightsPageHref {
  const query:
    NonNullable<
      InsightsPageHref['query']
    > = {};

  if (
    type
  ) {
    query.type =
      type;
  }

  if (
    page >
    1
  ) {
    query.page =
      String(
        page,
      );
  }

  if (
    Object.keys(
      query,
    ).length ===
    0
  ) {
    return {
      pathname:
        '/insights',
    };
  }

  return {
    pathname:
      '/insights',

    query,
  };
}

export function InsightsPageContent({
  locale,
  eyebrow,
  title,
  description,
  allLabel,
  readMoreLabel,
  emptyTitle,
  emptyDescription,
  previousLabel,
  nextLabel,
  currentType,
  currentPage,
  totalPages,
  publicationTypeLabels,
  publications,
}: InsightsPageContentProps) {
  return (
    <main className="insights-page">
      <section className="insights-page__hero">
        <div className="site-container">
          <p
            className="eyebrow"
            data-reveal="up"
          >
            {eyebrow}
          </p>

          <h1
            data-reveal="up"
          >
            {title}
          </h1>

          <p
            className="insights-page__description"
            data-reveal="up"
          >
            {description}
          </p>
        </div>
      </section>

      <section className="insights-page__listing">
        <div className="site-container">
          <nav
            className="insights-filters"
            aria-label={title}
            data-reveal="up"
          >
            <Link
              href="/insights"
              className={
                currentType ===
                null
                  ? 'insights-filters__item is-active'
                  : 'insights-filters__item'
              }
            >
              {allLabel}
            </Link>

            {
              FILTER_TYPES.map(
                type => (
                  <Link
                    key={type}
                    href={
                      buildPageHref({
                        type,

                        page:
                          1,
                      })
                    }
                    className={
                      currentType ===
                        type
                        ? 'insights-filters__item is-active'
                        : 'insights-filters__item'
                    }
                  >
                    {
                      publicationTypeLabels[
                        type
                      ]
                    }
                  </Link>
                ),
              )
            }
          </nav>

          {
            publications.length >
            0
              ? (
                  <div className="insights-grid">
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

                          return (
                            <article
                              key={
                                publication.id
                              }
                              className="insights-card"
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
                                className="insights-card__link"
                                aria-label={
                                  `${readMoreLabel} : ${publication.title}`
                                }
                              >
                                <div className="insights-card__visual">
                                  {
                                    publication.coverMedia
                                      ?.cardImageUrl
                                      ? (
                                          <img
                                            src={
                                              publication
                                                .coverMedia
                                                .cardImageUrl
                                            }
                                            alt={
                                              publication
                                                .coverMedia
                                                .altText ||
                                              publication.title
                                            }
                                            loading="lazy"
                                            decoding="async"
                                          />
                                        )
                                      : (
                                          <div
                                            className="insights-card__placeholder"
                                            aria-hidden="true"
                                          />
                                        )
                                  }

                                  <span className="insights-card__theme">
                                    {theme}
                                  </span>
                                </div>

                                <div className="insights-card__content">
                                  <div className="insights-card__meta">
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

                                  <h2>
                                    {
                                      publication.title
                                    }
                                  </h2>

                                  <p>
                                    {
                                      publication.excerpt
                                    }
                                  </p>

                                  <span className="insights-card__cta">
                                    <span>
                                      {readMoreLabel}
                                    </span>

                                    <ArrowRight
                                      size={20}
                                      aria-hidden="true"
                                    />
                                  </span>
                                </div>
                              </Link>
                            </article>
                          );
                        },
                      )
                    }
                  </div>
                )
              : (
                  <div className="insights-empty">
                    <h2>
                      {emptyTitle}
                    </h2>

                    <p>
                      {emptyDescription}
                    </p>
                  </div>
                )
          }

          {
            totalPages >
            1
              ? (
                  <nav
                    className="insights-pagination"
                    aria-label={title}
                  >
                    {
                      currentPage >
                      1
                        ? (
                            <Link
                              href={
                                buildPageHref({
                                  type:
                                    currentType,

                                  page:
                                    currentPage -
                                    1,
                                })
                              }
                              className="insights-pagination__direction"
                            >
                              <ArrowLeft
                                size={18}
                                aria-hidden="true"
                              />

                              <span>
                                {previousLabel}
                              </span>
                            </Link>
                          )
                        : (
                            <span
                              className="insights-pagination__direction is-disabled"
                              aria-disabled="true"
                            >
                              <ArrowLeft
                                size={18}
                                aria-hidden="true"
                              />

                              <span>
                                {previousLabel}
                              </span>
                            </span>
                          )
                    }

                    <div className="insights-pagination__pages">
                      {
                        Array.from(
                          {
                            length:
                              totalPages,
                          },

                          (
                            _,
                            index,
                          ) =>
                            index +
                            1,
                        ).map(
                          page => (
                            <Link
                              key={page}
                              href={
                                buildPageHref({
                                  type:
                                    currentType,

                                  page,
                                })
                              }
                              className={
                                page ===
                                  currentPage
                                  ? 'insights-pagination__page is-active'
                                  : 'insights-pagination__page'
                              }
                              aria-current={
                                page ===
                                  currentPage
                                  ? 'page'
                                  : undefined
                              }
                            >
                              {page}
                            </Link>
                          ),
                        )
                      }
                    </div>

                    {
                      currentPage <
                      totalPages
                        ? (
                            <Link
                              href={
                                buildPageHref({
                                  type:
                                    currentType,

                                  page:
                                    currentPage +
                                    1,
                                })
                              }
                              className="insights-pagination__direction"
                            >
                              <span>
                                {nextLabel}
                              </span>

                              <ArrowRight
                                size={18}
                                aria-hidden="true"
                              />
                            </Link>
                          )
                        : (
                            <span
                              className="insights-pagination__direction is-disabled"
                              aria-disabled="true"
                            >
                              <span>
                                {nextLabel}
                              </span>

                              <ArrowRight
                                size={18}
                                aria-hidden="true"
                              />
                            </span>
                          )
                    }
                  </nav>
                )
              : null
          }
        </div>
      </section>
    </main>
  );
}