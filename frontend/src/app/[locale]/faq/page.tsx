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
    'faq',
    '/faq',
  );
}

export default async function FaqPage({
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
    t,
    items,
  ] =
    await Promise.all([
      getTranslations({
        locale,

        namespace:
          'pages.faq',
      }),

      getPublicFaqs(
        locale,
      ),
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
    items.length >
    0
      ? {
          '@context':
            'https://schema.org',

          '@type':
            'FAQPage',

          mainEntity:
            items.map(
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
          items
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
        }}
        categories={
          categories
        }
      />
    </>
  );
}