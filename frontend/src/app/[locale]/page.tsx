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

import {
  HomeServicesSection,
} from '@/components/home/home-services-section';

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
    servicesTranslations,
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

      getTranslations({
        locale,

        namespace:
          'pages.home.servicesPreview',
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

  const services = [
    'digital',
    'automation',
    'data',
    'ai',
    'crm',
    'architecture',
  ].map(
    (
      key,
    ) => ({
      title:
        servicesTranslations(
          `items.${key}.title`,
        ),

      description:
        servicesTranslations(
          `items.${key}.description`,
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

      <HomeServicesSection
        eyebrow={
          servicesTranslations(
            'eyebrow',
          )
        }
        title={
          servicesTranslations(
            'title',
          )
        }
        introduction={
          servicesTranslations(
            'introduction',
          )
        }
        services={
          services
        }
        cta={
          servicesTranslations(
            'cta',
          )
        }
      />

      <HomeAboutSection
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
      />
    </>
  );
}