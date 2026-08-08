import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  FaqPageContent,
} from '@/components/faq/faq-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  FAQ_CATEGORY_CODES,
  getPublicFaqs,
} from '@/lib/public-faqs-api';

import type {
  PublicFaqCategoryCode,
} from '@/lib/public-faqs-api';

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

      category?:
        string;

      search?:
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

  return Number.isFinite(
    parsedPage,
  ) &&
    parsedPage >
      0
    ? parsedPage
    : 1;
}

function resolveCategory(
  value:
    string |
    undefined,
):
  PublicFaqCategoryCode |
  undefined
{
  if (
    !value
  ) {
    return undefined;
  }

  return FAQ_CATEGORY_CODES.includes(
    value as PublicFaqCategoryCode,
  )
    ? value as PublicFaqCategoryCode
    : undefined;
}

function resolveSearch(
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
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'faq',
    '/faq',
  );
}

export default async function FaqPage({
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

  const search =
    resolveSearch(
      resolvedSearchParams.search,
    );

  setRequestLocale(
    locale,
  );

  const [
    t,
    faqResponse,
  ] =
    await Promise.all([
      getTranslations({
        locale,

        namespace:
          'pages.faq',
      }),

      getPublicFaqs({
        locale,

        page:
          requestedPage,

        limit:
          25,

        categoryCode:
          selectedCategory,

        search,
      }),
    ]);

  const categories:
    Record<
      PublicFaqCategoryCode,
      string
    > = {
    OFFER:
      t(
        'categories.offer',
      ),

    METHODOLOGY:
      t(
        'categories.methodology',
      ),

    PROTOTYPE:
      t(
        'categories.prototype',
      ),

    DELIVERY:
      t(
        'categories.delivery',
      ),

    BUDGET:
      t(
        'categories.budget',
      ),

    TECHNICAL:
      t(
        'categories.technical',
      ),

    SUPPORT:
      t(
        'categories.support',
      ),

    GENERAL:
      t(
        'categories.general',
      ),
  };

  const structuredData =
    faqResponse.items.length >
    0
      ? {
          '@context':
            'https://schema.org',

          '@type':
            'FAQPage',

          mainEntity:
            faqResponse.items.map(
              item => ({
                '@type':
                  'Question',

                name:
                  item.question,

                acceptedAnswer: {
                  '@type':
                    'Answer',

                  text:
                    item.answer,
                },
              }),
            ),
        }
      : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData,
              ).replace(
                /</g,
                '\\u003c',
              ),
          }}
        />
      ) : null}

      <FaqPageContent
        items={
          faqResponse.items
        }
        availableCategories={
          faqResponse.availableCategories
        }
        selectedCategory={
          selectedCategory ??
          'ALL'
        }
        search={
          search ??
          ''
        }
        currentPage={
          faqResponse.pagination.page
        }
        totalPages={
          faqResponse.pagination.totalPages
        }
        totalResults={
          faqResponse.pagination.total
        }
        hero={{
          eyebrow:
            t(
              'eyebrow',
            ),

          title:
            t(
              'title',
            ),

          description:
            t(
              'description',
            ),
        }}
        labels={{
          searchPlaceholder:
            t(
              'searchPlaceholder',
            ),

          allCategories:
            t(
              'allCategories',
            ),

          noResultTitle:
            t(
              'noResultTitle',
            ),

          noResultDescription:
            t(
              'noResultDescription',
            ),

          countSingular:
            t(
              'countSingular',
            ),

          countPlural:
            t(
              'countPlural',
            ),

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
        categories={
          categories
        }
      />
    </>
  );
}