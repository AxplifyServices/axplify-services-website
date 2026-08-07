'use client';

import {
  ChevronDown,
  Search,
} from 'lucide-react';

import {
  useMemo,
  useState,
} from 'react';

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
  };

  categories:
    CategoryLabels;
};

export function FaqPageContent({
  items,
  hero,
  labels,
  categories,
}: FaqPageContentProps) {
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
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<
      PublicFaqCategoryCode |
      'ALL'
    >(
      'ALL',
    );

  const availableCategories =
    useMemo(
      () => {
        const usedCategories =
          new Set(
            items.map(
              item =>
                item.categoryCode,
            ),
          );

        return (
          Object.keys(
            categories,
          ) as
            PublicFaqCategoryCode[]
        ).filter(
          category =>
            usedCategories.has(
              category,
            ),
        );
      },
      [
        categories,
        items,
      ],
    );

  const filteredItems =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLocaleLowerCase();

        return items.filter(
          item => {
            if (
              selectedCategory !==
                'ALL' &&
              item.categoryCode !==
                selectedCategory
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            return (
              item.question
                .toLocaleLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              item.answer
                .toLocaleLowerCase()
                .includes(
                  normalizedSearch,
                )
            );
          },
        );
      },
      [
        items,
        search,
        selectedCategory,
      ],
    );

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
            <label className="faq-search">
              <Search
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />

              <input
                type="search"
                value={
                  search
                }
                placeholder={
                  labels.searchPlaceholder
                }
                onChange={
                  event => {
                    setSearch(
                      event.target
                        .value,
                    );

                    setOpenedId(
                      null,
                    );
                  }
                }
              />
            </label>

            {availableCategories.length >
              1 && (
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
                    () => {
                      setSelectedCategory(
                        'ALL',
                      );

                      setOpenedId(
                        null,
                      );
                    }
                  }
                >
                  {
                    labels.allCategories
                  }
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
                        () => {
                          setSelectedCategory(
                            category,
                          );

                          setOpenedId(
                            null,
                          );
                        }
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
            )}

            <p className="faq-result-count">
              <strong>
                {
                  filteredItems.length
                }
              </strong>{' '}
              {filteredItems.length <=
              1
                ? labels.countSingular
                : labels.countPlural}
            </p>
          </div>

          {filteredItems.length ===
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
            <div className="faq-list">
              {filteredItems.map(
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
                                item
                                  .categoryCode
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
          )}
        </div>
      </section>
    </div>
  );
}