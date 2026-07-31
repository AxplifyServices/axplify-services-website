import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  HomeBrochureCarousel,
} from '@/components/home/home-brochure-carousel';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicHomepageBrochures,
} from '@/lib/homepage-brochures-api';

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
    'home',
    '/',
  );
}

export default async function HomePage({
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
    brochures,
    t,
  ] =
    await Promise.all([
      getPublicHomepageBrochures(
        locale,
      ),

      getTranslations({
        locale,

        namespace:
          'pages.home.brochures',
      }),
    ]);

  return (
    <HomeBrochureCarousel
      brochures={
        brochures
      }
      previousLabel={
        t(
          'previous',
        )
      }
      nextLabel={
        t(
          'next',
        )
      }
      goToSlideLabel={
        t(
          'goToSlide',
        )
      }
    />
  );
}