import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  AboutPageContent,
} from '@/components/about/about-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

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
    'about',
    '/about',
  );
}

export default async function AboutPage({
  params,
}: PageProps) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const t =
    await getTranslations({
      locale,

      namespace:
        'pages.about',
    });

  const storyParagraphs = [
    t(
      'story.paragraphs.first',
    ),

    t(
      'story.paragraphs.second',
    ),

    t(
      'story.paragraphs.third',
    ),
  ];

  const missionItems = [
    'understand',
    'design',
    'advance',
  ].map(
    (
      key,
    ) => ({
      title:
        t(
          `mission.items.${key}.title`,
        ),

      description:
        t(
          `mission.items.${key}.description`,
        ),
    }),
  );

  const valuesItems = [
    'usefulness',
    'clarity',
    'adaptability',
    'ambition',
  ].map(
    (
      key,
    ) => ({
      title:
        t(
          `values.items.${key}.title`,
        ),

      description:
        t(
          `values.items.${key}.description`,
        ),
    }),
  );

  return (
    <AboutPageContent
      hero={{
        eyebrow:
          t(
            'hero.eyebrow',
          ),

        title:
          t(
            'hero.title',
          ),

        introduction:
          t(
            'hero.introduction',
          ),

        description:
          t(
            'hero.description',
          ),

secondaryCta:
  t(
    'hero.secondaryCta',
  ),
      }}
      story={{
        eyebrow:
          t(
            'story.eyebrow',
          ),

        title:
          t(
            'story.title',
          ),

        paragraphs:
          storyParagraphs,

        statement:
          t(
            'story.statement',
          ),
      }}
      mission={{
        eyebrow:
          t(
            'mission.eyebrow',
          ),

        title:
          t(
            'mission.title',
          ),

        description:
          t(
            'mission.description',
          ),

        items:
          missionItems,
      }}
      model={{
        eyebrow:
          t(
            'model.eyebrow',
          ),

        title:
          t(
            'model.title',
          ),

        description:
          t(
            'model.description',
          ),

        activities: [
          {
            number:
              '01',

            title:
              t(
                'model.activities.services.title',
              ),

            description:
              t(
                'model.activities.services.description',
              ),

            linkLabel:
              t(
                'model.activities.services.linkLabel',
              ),

            href:
              '/services',
          },

          {
            number:
              '02',

            title:
              t(
                'model.activities.products.title',
              ),

            description:
              t(
                'model.activities.products.description',
              ),

            linkLabel:
              t(
                'model.activities.products.linkLabel',
              ),

            href:
              '/products',
          },
        ],
      }}
      values={{
        eyebrow:
          t(
            'values.eyebrow',
          ),

        title:
          t(
            'values.title',
          ),

        items:
          valuesItems,
      }}
      finalCta={{
        eyebrow:
          t(
            'finalCta.eyebrow',
          ),

        title:
          t(
            'finalCta.title',
          ),

        description:
          t(
            'finalCta.description',
          ),

primaryCta:
  t(
    'finalCta.primaryCta',
  ),
      }}
    />
  );
}