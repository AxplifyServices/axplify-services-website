'use client';

import {
  Check,
  Filter,
  PackageOpen,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ProductCard,
} from '@/components/products/product-card';

import type {
  AppLocale,
} from '@/i18n/routing';

import type {
  PublicProduct,
} from '@/lib/public-products-api';

type ProductsPageContentProps = {
  locale:
    AppLocale;

  products:
    PublicProduct[];

  hero: {
    eyebrow:
      string;

    title:
      string;

    description:
      string;
  };

  filters: {
    title:
      string;

    all:
      string;

    open:
      string;

    close:
      string;

    results:
      string;

    singleResult:
      string;
  };

  card: {
    discover:
      string;
  };

  emptyState: {
    title:
      string;

    description:
      string;
  };
};

type ProductsFiltersProps = {
  categories:
    string[];

  selectedCategory:
    string;

  labels:
    ProductsPageContentProps['filters'];

  onSelect:
    (
      category:
        string,
    ) =>
      void;

  onClose?:
    () =>
      void;

  mobile?:
    boolean;
};

function ProductsFilters({
  categories,
  selectedCategory,
  labels,
  onSelect,
  onClose,
  mobile = false,
}: ProductsFiltersProps) {
  return (
    <div className="products-filters">
      <header className="products-filters__header">
        <h2>
          {labels.title}
        </h2>

        {mobile &&
        onClose ? (
          <button
            type="button"
            className="products-filters__close"
            aria-label={
              labels.close
            }
            onClick={
              onClose
            }
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </header>

      <div
        className="products-filters__list"
        role="group"
        aria-label={
          labels.title
        }
      >
        <button
          type="button"
          data-active={
            selectedCategory ===
            'all'
          }
          aria-pressed={
            selectedCategory ===
            'all'
          }
          onClick={
            () =>
              onSelect(
                'all',
              )
          }
        >
          <span className="products-filters__check">
            {selectedCategory ===
            'all' ? (
              <Check
                size={14}
                aria-hidden="true"
              />
            ) : null}
          </span>

          <span>
            {labels.all}
          </span>
        </button>

        {categories.map(
          category => {
            const active =
              selectedCategory ===
              category;

            return (
              <button
                key={
                  category
                }
                type="button"
                data-active={
                  active
                }
                aria-pressed={
                  active
                }
                onClick={
                  () =>
                    onSelect(
                      category,
                    )
                }
              >
                <span className="products-filters__check">
                  {active ? (
                    <Check
                      size={14}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>

                <span>
                  {category}
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

export function ProductsPageContent({
  locale,
  products,
  hero,
  filters,
  card,
  emptyState,
}: ProductsPageContentProps) {
  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState(
      'all',
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(
      false,
    );

  /*
   * La catégorie reste une valeur libre
   * en base.
   *
   * Ici on construit simplement le catalogue
   * des catégories réellement utilisées.
   *
   * Deux produits ayant la même catégorie
   * n'afficheront qu'un seul filtre.
   */
  const categories =
    useMemo(
      () => {
        const values =
          new Map<
            string,
            string
          >();

        products.forEach(
          product => {
            const category =
              product.category.trim();

            if (
              !category
            ) {
              return;
            }

            const normalized =
              category.toLocaleLowerCase(
                locale,
              );

            if (
              !values.has(
                normalized,
              )
            ) {
              values.set(
                normalized,
                category,
              );
            }
          },
        );

        return Array.from(
          values.values(),
        ).sort(
          (
            left,
            right,
          ) =>
            left.localeCompare(
              right,
              locale,
              {
                sensitivity:
                  'base',
              },
            ),
        );
      },
      [
        locale,
        products,
      ],
    );

  const filteredProducts =
    useMemo(
      () => {
        if (
          selectedCategory ===
          'all'
        ) {
          return products;
        }

        return products.filter(
          product =>
            product.category ===
            selectedCategory,
        );
      },
      [
        products,
        selectedCategory,
      ],
    );

  useEffect(
    () => {
      if (
        !filtersOpen
      ) {
        return;
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setFiltersOpen(
            false,
          );
        }
      }

      document.body.style.overflow =
        'hidden';

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          '';

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      filtersOpen,
    ],
  );

  function selectCategory(
    category:
      string,
  ) {
    setSelectedCategory(
      category,
    );

    setFiltersOpen(
      false,
    );
  }

  const resultLabel =
    filteredProducts.length ===
    1
      ? filters.singleResult
      : filters.results;

  return (
    <main
      className="products-page"
      dir={
        locale ===
        'ar'
          ? 'rtl'
          : 'ltr'
      }
    >
      <section className="products-page__hero">
        <div className="site-container">
          <div className="products-page__hero-content">
            <span className="products-page__eyebrow">
              {hero.eyebrow}
            </span>

            <h1>
              {hero.title}
            </h1>

            <p>
              {hero.description}
            </p>

            {categories.length >
            0 ? (
              <div className="products-page__mobile-toolbar">
                <button
                  type="button"
                  className="products-page__filter-trigger"
                  aria-expanded={
                    filtersOpen
                  }
                  aria-controls="products-mobile-filters"
                  onClick={
                    () =>
                      setFiltersOpen(
                        true,
                      )
                  }
                >
                  <Filter
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    {filters.open}
                  </span>

                  {selectedCategory !==
                  'all' ? (
                    <span className="products-page__filter-indicator">
                      1
                    </span>
                  ) : null}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="products-page__content">
        <div className="site-container">
          {products.length ===
          0 ? (
            <div className="products-page__empty">
              <PackageOpen
                size={34}
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
            <div className="products-page__layout">
              <aside className="products-page__sidebar">
                <ProductsFilters
                  categories={
                    categories
                  }
                  selectedCategory={
                    selectedCategory
                  }
                  labels={
                    filters
                  }
                  onSelect={
                    selectCategory
                  }
                />
              </aside>

              <div className="products-page__results">
                <header className="products-page__results-header">
                  <p>
                    <strong>
                      {
                        filteredProducts.length
                      }
                    </strong>{' '}
                    {resultLabel}
                  </p>

                  {selectedCategory !==
                  'all' ? (
                    <span>
                      {selectedCategory}
                    </span>
                  ) : null}
                </header>

                {filteredProducts.length ===
                0 ? (
                  <div className="products-page__empty products-page__empty--small">
                    <PackageOpen
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
                  <div className="products-page__grid">
                    {filteredProducts.map(
                      product => (
                        <ProductCard
                          key={
                            product.id
                          }
                          product={
                            product
                          }
                          discoverLabel={
                            card.discover
                          }
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {filtersOpen ? (
        <div
          className="products-page__filter-overlay"
          role="presentation"
          onMouseDown={
            event => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setFiltersOpen(
                  false,
                );
              }
            }
          }
        >
          <div
            id="products-mobile-filters"
            className="products-page__filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={
              filters.title
            }
          >
            <ProductsFilters
              categories={
                categories
              }
              selectedCategory={
                selectedCategory
              }
              labels={
                filters
              }
              onSelect={
                selectCategory
              }
              onClose={
                () =>
                  setFiltersOpen(
                    false,
                  )
              }
              mobile
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}