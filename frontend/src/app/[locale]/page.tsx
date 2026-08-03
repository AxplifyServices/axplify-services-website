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
    brochureTranslations,
    aboutTranslations,
    servicesTranslations,
    clientsTranslations,
  ] =
    await Promise.all([
      getPublicHomepageBrochures(
        locale,
      ),

      getPublicHomepageClients(
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

      getTranslations({
        locale,

        namespace:
          'pages.home.clientsPreview',
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