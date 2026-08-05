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
  HomeClientsSection,
} from '@/components/home/home-clients-section';

import {
  HomeInsightsSection,
} from '@/components/home/home-insights-section';

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
  getPublicHomepageClients,
} from '@/lib/homepage-clients-api';

import {
  getFeaturedPublications,
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
};

const ABOUT_PILLAR_KEYS = [
  'clarity',
  'usefulness',
  'evolution',
] as const;

const SERVICE_KEYS = [
  'digital',
  'automation',
  'data',
  'ai',
  'crm',
  'architecture',
  'analytics',
  'leadGeneration',
  'marketingStrategy',
] as const;

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
    homepageClients,
    featuredPublications,
    brochureTranslations,
    aboutTranslations,
    servicesTranslations,
    clientsTranslations,
    insightsTranslations,
  ] =
    await Promise.all([
      getPublicHomepageBrochures(
        locale,
      ),

      getPublicHomepageClients(
        locale,
      ),

      getFeaturedPublications(
        locale,
        8,
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

      getTranslations({
        locale,

        namespace:
          'pages.home.clientsPreview',
      }),

      getTranslations({
        locale,

        namespace:
          'pages.home.insightsPreview',
      }),
    ]);

  const pillars =
    ABOUT_PILLAR_KEYS.map(
      key => ({
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

  const services =
    SERVICE_KEYS.map(
      key => ({
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

  const publicationTypeLabels = {
    ARTICLE:
      insightsTranslations(
        'types.article',
      ),

    CASE_STUDY:
      insightsTranslations(
        'types.caseStudy',
      ),

    NEWS:
      insightsTranslations(
        'types.news',
      ),

    EVENT:
      insightsTranslations(
        'types.event',
      ),

    PRESS_RELEASE:
      insightsTranslations(
        'types.pressRelease',
      ),

    ANNOUNCEMENT:
      insightsTranslations(
        'types.announcement',
      ),

    GUIDE:
      insightsTranslations(
        'types.guide',
      ),

    RESOURCE:
      insightsTranslations(
        'types.resource',
      ),
  };

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

      <HomeClientsSection
        title={
          clientsTranslations(
            'title',
          )
        }
        introduction={
          clientsTranslations(
            'introduction',
          )
        }
        pauseLabel={
          clientsTranslations(
            'pause',
          )
        }
        resumeLabel={
          clientsTranslations(
            'resume',
          )
        }
        clients={
          homepageClients
        }
      />

      <HomeInsightsSection
        locale={
          locale
        }
        title={
          insightsTranslations(
            'title',
          )
        }
        readMoreLabel={
          insightsTranslations(
            'readMore',
          )
        }
        viewAllLabel={
          insightsTranslations(
            'viewAll',
          )
        }
        publicationTypeLabels={
          publicationTypeLabels
        }
        publications={
          featuredPublications
        }
      />
    </>
  );
}