import type {
  Metadata,
} from 'next';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  WorkProcessPageContent,
} from '@/components/about/work-process-page-content';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  createBreadcrumbStructuredData,
} from '@/lib/breadcrumb-structured-data';

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

const getPoints = (
  t: Awaited<
    ReturnType<
      typeof getTranslations
    >
  >,
  namespace:
    string,
  keys:
    string[],
) =>
  keys.map(
    key =>
      t(
        `${namespace}.points.${key}`,
      ),
  );

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
  } =
    await params;

  return createPageMetadata(
    locale,
    'workProcess',
    '/about/work-process',
  );
}

export default async function WorkProcessPage({
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
    navigationTranslations,
  ] =
    await Promise.all([
      getTranslations({
        locale,

        namespace:
          'pages.workProcess',
      }),

      getTranslations({
        locale,

        namespace:
          'navigation',
      }),
    ]);

  const createStep = (
    key:
      string,
    number:
      string,
    pointKeys:
      string[],
  ) => ({
    number,

    eyebrow:
      t(
        `steps.${key}.eyebrow`,
      ),

    title:
      t(
        `steps.${key}.title`,
      ),

    description:
      t(
        `steps.${key}.description`,
      ),

    points:
      getPoints(
        t,
        `steps.${key}`,
        pointKeys,
      ),
  });

  const breadcrumbStructuredData =
    createBreadcrumbStructuredData({
      locale,

      items: [
        {
          name:
            navigationTranslations(
              'home',
            ),

          href:
            '/',
        },

        {
          name:
            navigationTranslations(
              'about',
            ),

          href:
            '/about',
        },

        {
          name:
            navigationTranslations(
              'workProcess',
            ),

          href:
            '/about/work-process',
        },
      ],
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbStructuredData,
            ).replace(
              /</g,
              '\\u003c',
            ),
        }}
      />

      <WorkProcessPageContent
        hero={{
          eyebrow:
            t(
              'hero.eyebrow',
            ),

          title:
            t(
              'hero.title',
            ),

          description:
            t(
              'hero.description',
            ),

          reassurance:
            t(
              'hero.reassurance',
            ),
        }}

        steps={{
          understand:
            createStep(
              'understand',
              '01',
              [
                'challenge',
                'users',
                'objectives',
              ],
            ),

          observe:
            createStep(
              'observe',
              '02',
              [
                'process',
                'tools',
                'friction',
              ],
            ),

          reframe:
            createStep(
              'reframe',
              '03',
              [
                'summary',
                'examples',
                'priorities',
              ],
            ),

          validate:
            createStep(
              'validate',
              '04',
              [
                'approval',
                'adjustments',
                'decision',
              ],
            ),
        }}

        validationLoop={{
          label:
            t(
              'validationLoop.label',
            ),

          title:
            t(
              'validationLoop.title',
            ),

          description:
            t(
              'validationLoop.description',
            ),

          returnLabel:
            t(
              'validationLoop.returnLabel',
            ),
        }}

        decision={{
          eyebrow:
            t(
              'decision.eyebrow',
            ),

          title:
            t(
              'decision.title',
            ),

          description:
            t(
              'decision.description',
            ),

          product: {
            label:
              t(
                'decision.product.label',
              ),

            title:
              t(
                'decision.product.title',
              ),

            description:
              t(
                'decision.product.description',
              ),

            points:
              getPoints(
                t,
                'decision.product',
                [
                  'configuration',
                  'integration',
                  'deployment',
                ],
              ),
          },

          custom: {
            label:
              t(
                'decision.custom.label',
              ),

            title:
              t(
                'decision.custom.title',
              ),

            description:
              t(
                'decision.custom.description',
              ),

            points:
              getPoints(
                t,
                'decision.custom',
                [
                  'design',
                  'experience',
                  'architecture',
                ],
              ),
          },

          convergence:
            t(
              'decision.convergence',
            ),
        }}

        prototype={{
          number:
            '05',

          eyebrow:
            t(
              'prototype.eyebrow',
            ),

          title:
            t(
              'prototype.title',
            ),

          description:
            t(
              'prototype.description',
            ),

          demo: {
            title:
              t(
                'prototype.demo.title',
              ),

            description:
              t(
                'prototype.demo.description',
              ),
          },

          poc: {
            title:
              t(
                'prototype.poc.title',
              ),

            description:
              t(
                'prototype.poc.description',
              ),
          },

          mvp: {
            title:
              t(
                'prototype.mvp.title',
              ),

            description:
              t(
                'prototype.mvp.description',
              ),
          },

          conclusion:
            t(
              'prototype.conclusion',
            ),
        }}

        delivery={
          createStep(
            'delivery',
            '06',
            [
              'increments',
              'reviews',
              'quality',
            ],
          )
        }

        testing={{
          eyebrow:
            t(
              'testing.eyebrow',
            ),

          title:
            t(
              'testing.title',
            ),

          description:
            t(
              'testing.description',
            ),

          items: [
            {
              title:
                t(
                  'testing.items.environment.title',
                ),

              description:
                t(
                  'testing.items.environment.description',
                ),
            },

            {
              title:
                t(
                  'testing.items.access.title',
                ),

              description:
                t(
                  'testing.items.access.description',
                ),
            },

            {
              title:
                t(
                  'testing.items.followUp.title',
                ),

              description:
                t(
                  'testing.items.followUp.description',
                ),
            },
          ],
        }}

        launch={
          createStep(
            'launch',
            '07',
            [
              'deployment',
              'support',
              'evolution',
            ],
          )
        }

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

          button:
            t(
              'finalCta.button',
            ),
        }}
      />
    </>
  );
}