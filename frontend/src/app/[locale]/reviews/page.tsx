import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ReviewsPageContent,
} from '@/components/reviews/reviews-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicReviews,
} from '@/lib/public-reviews-api';

import {
  createPageMetadata,
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'reviews',
    '/reviews',
  );
}

export default async function ReviewsPage({
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

  setRequestLocale(
    locale,
  );

  const [
    reviewsResponse,
    translations,
  ] =
    await Promise.all([
      getPublicReviews({
        page:
          requestedPage,

        limit:
          10,
      }),

      getTranslations({
        locale,

        namespace:
          'pages.reviews',
      }),
    ]);

  return (
    <ReviewsPageContent
      locale={
        locale
      }
      reviews={
        reviewsResponse.items
      }
      currentPage={
        reviewsResponse.pagination.page
      }
      totalPages={
        reviewsResponse.pagination.totalPages
      }
      totalResults={
        reviewsResponse.pagination.total
      }
      hero={{
        eyebrow:
          translations(
            'hero.eyebrow',
          ),

        title:
          translations(
            'hero.title',
          ),

        description:
          translations(
            'hero.description',
          ),
      }}
      results={{
        label:
          translations(
            'results.label',
          ),

        single:
          translations(
            'results.single',
          ),
      }}
      projectLabel={
        translations(
          'card.project',
        )
      }
      emptyState={{
        title:
          translations(
            'empty.title',
          ),

        description:
          translations(
            'empty.description',
          ),
      }}
      pagination={{
        previous:
          translations(
            'pagination.previous',
          ),

        next:
          translations(
            'pagination.next',
          ),

        page:
          translations(
            'pagination.page',
          ),

        of:
          translations(
            'pagination.of',
          ),
      }}
    />
  );
}