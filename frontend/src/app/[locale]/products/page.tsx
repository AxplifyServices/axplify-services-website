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
  createPageMetadata,
} from '@/lib/seo';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;
    }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'products',
    '/products',
  );
}

export default async function ProductsPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const [
    products,
    t,
  ] =
    await Promise.all([
      getPublicProducts(
        locale,
      ),

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
        products
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