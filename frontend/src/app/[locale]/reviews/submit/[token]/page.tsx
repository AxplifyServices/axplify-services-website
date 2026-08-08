import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ReviewSubmissionPageContent,
} from '@/components/reviews/review-submission-page-content';

import type {
  ReviewSubmissionPageCopy,
} from '@/components/reviews/review-submission-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;

      token:
        string;
    }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  const translations =
    await getTranslations({
      locale,

      namespace:
        'pages.reviewSubmission',
    });

  return {
    title:
      translations(
        'metadata.title',
      ),

    description:
      translations(
        'metadata.description',
      ),

    robots: {
      index:
        false,

      follow:
        false,

      nocache:
        true,

      googleBot: {
        index:
          false,

        follow:
          false,

        noimageindex:
          true,
      },
    },
  };
}

export default async function ReviewSubmissionPage({
  params,
}: PageProps) {
  const {
    locale,
    token,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const translations =
    await getTranslations({
      locale,

      namespace:
        'pages.reviewSubmission',
    });

  const copy =
    translations.raw(
      'content',
    ) as ReviewSubmissionPageCopy;

  return (
    <ReviewSubmissionPageContent
      locale={
        locale
      }
      token={
        token
      }
      copy={
        copy
      }
    />
  );
}