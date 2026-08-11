import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ProductsPageContent,
} from '@/components/products/products-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicProducts,
} from '@/lib/public-products-api';

import {
  createPaginatedPageMetadata,
} from '@/lib/seo';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;

  searchParams:
    Promise<{
      page?:
        string;

      category?:
        string;
    }>;
};

function resolvePage(
  value:
    string |
    undefined,
) {
  const parsedPage =
    Number.parseInt(
      value ??
        '1',
      10,
    );

  if (
    !Number.isFinite(
      parsedPage,
    ) ||
    parsedPage <
      1
  ) {
    return 1;
  }

  return parsedPage;
}

function resolveCategory(
  value:
    string |
    undefined,
) {
  const normalizedValue =
    value?.trim();

  return normalizedValue
    ? normalizedValue
    : undefined;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [
    resolvedParams,
    resolvedSearchParams,
  ] =
    await Promise.all([
      params,
      searchParams,
    ]);

  const {
    locale,
  } =
    resolvedParams;

  const page =
    resolvePage(
      resolvedSearchParams.page,
    );

  const category =
    resolveCategory(
      resolvedSearchParams.category,
    );

  return createPaginatedPageMetadata({
    locale,

    namespace:
      'products',

    href:
      '/products',

    page,

    hasFilters:
      Boolean(
        category,
      ),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
  ] =
    await Promise.all([
      params,
      searchParams,
    ]);

  const {
    locale,
  } =
    resolvedParams;

  const requestedPage =
    resolvePage(
      resolvedSearchParams.page,
    );

  const selectedCategory =
    resolveCategory(
      resolvedSearchParams.category,
    );

  setRequestLocale(
    locale,
  );

  const [
    productsResponse,
    t,
  ] =
    await Promise.all([
      getPublicProducts({
        locale,

        page:
          requestedPage,

        limit:
          10,

        category:
          selectedCategory,
      }),

      getTranslations({
        locale,

        namespace:
          'pages.products',
      }),
    ]);

  return (
    <ProductsPageContent
      locale={
        locale
      }
      products={
        productsResponse.items
      }
      categories={
        productsResponse.categories
      }
      selectedCategory={
        selectedCategory ??
        'all'
      }
      currentPage={
        productsResponse.pagination.page
      }
      totalPages={
        productsResponse.pagination.totalPages
      }
      totalResults={
        productsResponse.pagination.total
      }
      hero={{
        eyebrow:
          t(
            'hero.eyebrow',
          ),

        title:
          t(
            'hero.title',
          ),

        description:
          t(
            'hero.description',
          ),
      }}
      filters={{
        title:
          t(
            'filters.title',
          ),

        all:
          t(
            'filters.all',
          ),

        open:
          t(
            'filters.open',
          ),

        close:
          t(
            'filters.close',
          ),

        results:
          t(
            'filters.results',
          ),

        singleResult:
          t(
            'filters.singleResult',
          ),
      }}
      pagination={{
        previous:
          t(
            'pagination.previous',
          ),

        next:
          t(
            'pagination.next',
          ),

        page:
          t(
            'pagination.page',
          ),

        of:
          t(
            'pagination.of',
          ),
      }}
      card={{
        discover:
          t(
            'card.discover',
          ),
      }}
      emptyState={{
        title:
          t(
            'empty.title',
          ),

        description:
          t(
            'empty.description',
          ),
      }}
    />
  );
}