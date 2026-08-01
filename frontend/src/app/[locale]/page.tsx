import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  HomeAboutSection,
} from '@/components/home/home-about-section';

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
    brochureTranslations,
    aboutTranslations,
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

      getTranslations({
        locale,

        namespace:
          'pages.home.aboutPreview',
      }),
    ]);

  const pillars = [
    'clarity',
    'usefulness',
    'evolution',
  ].map(
    (
      key,
    ) => ({
      title:
        aboutTranslations(
          `pillars.${key}.title`,
        ),

      description:
        aboutTranslations(
          `pillars.${key}.description`,
        ),
    }),
  );

  return (
    <>
      <HomeBrochureCarousel
        brochures={
          brochures
        }
        previousLabel={
          brochureTranslations(
            'previous',
          )
        }
        nextLabel={
          brochureTranslations(
            'next',
          )
        }
        goToSlideLabel={
          brochureTranslations(
            'goToSlide',
          )
        }
      />

      <HomeAboutSection
        eyebrow={
          aboutTranslations(
            'eyebrow',
          )
        }
        title={
          aboutTranslations(
            'title',
          )
        }
        introduction={
          aboutTranslations(
            'introduction',
          )
        }
        description={
          aboutTranslations(
            'description',
          )
        }
        promiseLabel={
          aboutTranslations(
            'promiseLabel',
          )
        }
        promise={
          aboutTranslations(
            'promise',
          )
        }
        pillars={
          pillars
        }
        primaryCta={
          aboutTranslations(
            'primaryCta',
          )
        }
        secondaryCta={
          aboutTranslations(
            'secondaryCta',
          )
        }
      />
    </>
  );
}