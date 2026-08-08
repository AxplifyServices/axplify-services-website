'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

import {
  FormEvent,
  useState,
} from 'react';

import {
  Link,
  useRouter,
} from '@/i18n/navigation';

import type {
  PublicFaqCategoryCode,
  PublicFaqItem,
} from '@/lib/public-faqs-api';

type CategoryLabels =
  Record<
    PublicFaqCategoryCode,
    string
  >;

type FaqPageContentProps = {
  items:
    PublicFaqItem[];

  availableCategories:
    PublicFaqCategoryCode[];

  selectedCategory:
    PublicFaqCategoryCode |
    'ALL';

  search:
    string;

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

  labels: {
    searchPlaceholder:
      string;

    allCategories:
      string;

    noResultTitle:
      string;

    noResultDescription:
      string;

    countSingular:
      string;

    countPlural:
      string;

    previous:
      string;

    next:
      string;

    page:
      string;

    of:
      string;
  };

  categories:
    CategoryLabels;
};

type FaqHref = {
  pathname:
    '/faq';

  query?: {
    category?:
      PublicFaqCategoryCode;

    search?:
      string;

    page?:
      string;
  };
};

function buildFaqHref({
  category,
  search,
  page,
}: {
  category:
    PublicFaqCategoryCode |
    'ALL';

  search:
    string;

  page:
    number;
}): FaqHref {
  const query:
    NonNullable<
      FaqHref['query']
    > = {};

  if (
    category !==
    'ALL'
  ) {
    query.category =
      category;
  }

  const normalizedSearch =
    search.trim();

  if (
    normalizedSearch
  ) {
    query.search =
      normalizedSearch;
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
        '/faq',
    };
  }

  return {
    pathname:
      '/faq',

    query,
  };
}

export function FaqPageContent({
  items,
  availableCategories,
  selectedCategory,
  search,
  currentPage,
  totalPages,
  totalResults,
  hero,
  labels,
  categories,
}: FaqPageContentProps) {
  const router =
    useRouter();

  const [
    openedId,
    setOpenedId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    searchValue,
    setSearchValue,
  ] =
    useState(
      search,
    );

  function handleSearchSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setOpenedId(
      null,
    );

    router.push(
      buildFaqHref({
        category:
          selectedCategory,

        search:
          searchValue,

        page:
          1,
      }),
    );
  }

  function selectCategory(
    category:
      PublicFaqCategoryCode |
      'ALL',
  ) {
    setOpenedId(
      null,
    );

    router.push(
      buildFaqHref({
        category,

        search,

        page:
          1,
      }),
    );
  }

  return (
    <div className="faq-page">
      <section
        className="faq-hero"
        aria-labelledby="faq-page-title"
      >
        <div className="site-container faq-hero__container">
          <p className="faq-hero__eyebrow">
            {hero.eyebrow}
          </p>

          <h1 id="faq-page-title">
            {hero.title}
          </h1>

          <p className="faq-hero__description">
            {hero.description}
          </p>
        </div>
      </section>

      <section className="faq-content">
        <div className="site-container faq-content__container">
          <div className="faq-tools">
            <form
              className="faq-search"
              onSubmit={
                handleSearchSubmit
              }
            >
              <Search
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />

              <input
                type="search"
                value={
                  searchValue
                }
                placeholder={
                  labels.searchPlaceholder
                }
                onChange={
                  event =>
                    setSearchValue(
                      event.target.value,
                    )
                }
              />
            </form>

            {availableCategories.length >
            1 ? (
              <div
                className="faq-categories"
                aria-label={
                  labels.allCategories
                }
              >
                <button
                  type="button"
                  data-active={
                    selectedCategory ===
                    'ALL'
                  }
                  onClick={
                    () =>
                      selectCategory(
                        'ALL',
                      )
                  }
                >
                  {labels.allCategories}
                </button>

                {availableCategories.map(
                  category => (
                    <button
                      key={
                        category
                      }
                      type="button"
                      data-active={
                        selectedCategory ===
                        category
                      }
                      onClick={
                        () =>
                          selectCategory(
                            category,
                          )
                      }
                    >
                      {
                        categories[
                          category
                        ]
                      }
                    </button>
                  ),
                )}
              </div>
            ) : null}

            <p className="faq-result-count">
              <strong>
                {totalResults}
              </strong>{' '}
              {totalResults ===
              1
                ? labels.countSingular
                : labels.countPlural}
            </p>
          </div>

          {items.length ===
          0 ? (
            <div className="faq-empty">
              <Search
                size={22}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <h2>
                {
                  labels.noResultTitle
                }
              </h2>

              <p>
                {
                  labels.noResultDescription
                }
              </p>
            </div>
          ) : (
            <>
              <div className="faq-list">
                {items.map(
                  item => {
                    const isOpen =
                      openedId ===
                      item.id;

                    const contentId =
                      `faq-answer-${item.id}`;

                    const buttonId =
                      `faq-question-${item.id}`;

                    return (
                      <article
                        key={
                          item.id
                        }
                        className="faq-item"
                        data-open={
                          isOpen
                        }
                      >
                        <button
                          id={
                            buttonId
                          }
                          type="button"
                          className="faq-item__trigger"
                          aria-expanded={
                            isOpen
                          }
                          aria-controls={
                            contentId
                          }
                          onClick={
                            () =>
                              setOpenedId(
                                current =>
                                  current ===
                                  item.id
                                    ? null
                                    : item.id,
                              )
                          }
                        >
                          <div className="faq-item__heading">
                            <span className="faq-item__category">
                              {
                                categories[
                                  item.categoryCode
                                ]
                              }
                            </span>

                            <h2>
                              {
                                item.question
                              }
                            </h2>
                          </div>

                          <span
                            className="faq-item__chevron"
                            aria-hidden="true"
                          >
                            <ChevronDown
                              size={18}
                              strokeWidth={2}
                            />
                          </span>
                        </button>

                        <div
                          id={
                            contentId
                          }
                          className="faq-item__answer"
                          role="region"
                          aria-labelledby={
                            buttonId
                          }
                          hidden={
                            !isOpen
                          }
                        >
                          <div className="faq-item__answer-inner">
                            <p>
                              {
                                item.answer
                              }
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              {totalPages >
              1 ? (
                <nav
                  className="faq-pagination"
                  aria-label={`${labels.page} ${currentPage} ${labels.of} ${totalPages}`}
                >
                  {currentPage >
                  1 ? (
                    <Link
                      href={
                        buildFaqHref({
                          category:
                            selectedCategory,

                          search,

                          page:
                            currentPage -
                            1,
                        })
                      }
                      className="faq-pagination__arrow"
                    >
                      <ChevronLeft
                        size={18}
                        aria-hidden="true"
                      />

                      <span>
                        {labels.previous}
                      </span>
                    </Link>
                  ) : (
                    <span
                      className="faq-pagination__arrow is-disabled"
                      aria-disabled="true"
                    >
                      <ChevronLeft
                        size={18}
                        aria-hidden="true"
                      />

                      <span>
                        {labels.previous}
                      </span>
                    </span>
                  )}

                  <div className="faq-pagination__pages">
                    {Array.from(
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
                          key={
                            page
                          }
                          href={
                            buildFaqHref({
                              category:
                                selectedCategory,

                              search,

                              page,
                            })
                          }
                          data-active={
                            page ===
                            currentPage
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
                    )}
                  </div>

                  {currentPage <
                  totalPages ? (
                    <Link
                      href={
                        buildFaqHref({
                          category:
                            selectedCategory,

                          search,

                          page:
                            currentPage +
                            1,
                        })
                      }
                      className="faq-pagination__arrow"
                    >
                      <span>
                        {labels.next}
                      </span>

                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                      />
                    </Link>
                  ) : (
                    <span
                      className="faq-pagination__arrow is-disabled"
                      aria-disabled="true"
                    >
                      <span>
                        {labels.next}
                      </span>

                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}