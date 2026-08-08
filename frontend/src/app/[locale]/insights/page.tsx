import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  InsightsPageContent,
} from '@/components/insights/insights-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  PUBLICATION_CONTENT_TYPES,
  getPublicPublications,
} from '@/lib/public-publications-api';

import type {
  PublicationContentType,
} from '@/lib/public-publications-api';

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
      type?:
        string;

      page?:
        string;
    }>;
};

function resolveContentType(
  value:
    string |
    undefined,
):
  PublicationContentType |
  null
{
  if (
    !value
  ) {
    return null;
  }

  return PUBLICATION_CONTENT_TYPES.includes(
    value as
      PublicationContentType,
  )
    ? value as
        PublicationContentType
    : null;
}

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
    'insights',
    '/insights',
  );
}

export default async function InsightsPage({
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

  const currentType =
    resolveContentType(
      resolvedSearchParams.type,
    );

  const requestedPage =
    resolvePage(
      resolvedSearchParams.page,
    );

  setRequestLocale(
    locale,
  );

  const [
    publicationsResponse,
    translations,
  ] =
    await Promise.all([
      getPublicPublications({
        locale,

        page:
          requestedPage,

        limit:
          10,

        contentType:
          currentType ??
          undefined,

        includePastEvents:
          true,
      }),

      getTranslations({
        locale,

        namespace:
          'pages.insights',
      }),
    ]);

  const totalPages =
    publicationsResponse
      .pagination
      .totalPages;

  const currentPage =
    totalPages >
      0
      ? Math.min(
          requestedPage,
          totalPages,
        )
      : 1;

  const publicationTypeLabels:
    Record<
      PublicationContentType,
      string
    > = {
      ARTICLE:
        translations(
          'types.ARTICLE',
        ),

      CASE_STUDY:
        translations(
          'types.CASE_STUDY',
        ),

      NEWS:
        translations(
          'types.NEWS',
        ),

      EVENT:
        translations(
          'types.EVENT',
        ),

      PRESS_RELEASE:
        translations(
          'types.PRESS_RELEASE',
        ),

      ANNOUNCEMENT:
        translations(
          'types.ANNOUNCEMENT',
        ),

      GUIDE:
        translations(
          'types.GUIDE',
        ),

      RESOURCE:
        translations(
          'types.RESOURCE',
        ),
    };

  return (
    <InsightsPageContent
      locale={
        locale
      }
      eyebrow={
        translations(
          'eyebrow',
        )
      }
      title={
        translations(
          'title',
        )
      }
      description={
        translations(
          'description',
        )
      }
      allLabel={
        translations(
          'filters.all',
        )
      }
      readMoreLabel={
        translations(
          'readMore',
        )
      }
      emptyTitle={
        translations(
          'empty.title',
        )
      }
      emptyDescription={
        translations(
          'empty.description',
        )
      }
      previousLabel={
        translations(
          'pagination.previous',
        )
      }
      nextLabel={
        translations(
          'pagination.next',
        )
      }
      currentType={
        currentType
      }
      currentPage={
        currentPage
      }
      totalPages={
        totalPages
      }
      publicationTypeLabels={
        publicationTypeLabels
      }
      publications={
        publicationsResponse.items
      }
    />
  );
}