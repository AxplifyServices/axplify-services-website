import type {
  Metadata,
} from 'next';

import {
  notFound,
} from 'next/navigation';

import {
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import {
  ArrowLeft,
  Check,
  DatabaseZap,
  Target,
} from 'lucide-react';

import {
  Link,
  getPathname,
} from '@/i18n/navigation';

import {
  routing,
  type AppLocale,
} from '@/i18n/routing';

import {
  createBreadcrumbStructuredData,
} from '@/lib/breadcrumb-structured-data';

import {
  SERVICE_CATALOG,
  getServiceBySlug,
} from '@/lib/service-catalog';

import {
  ORGANIZATION_ID,
  ORGANIZATION_NAME,
  SITE_URL,
  SOCIAL_IMAGE_URL,
} from '@/lib/site-config';



type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;

      serviceSlug:
        string;
    }>;
};

function absoluteUrl(
  pathname:
    string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

function getServiceUrl(
  locale:
    AppLocale,

  serviceSlug:
    string,
) {
  return absoluteUrl(
    getPathname({
      locale,

      href: {
        pathname:
          '/services/[serviceSlug]',

        params: {
          serviceSlug,
        },
      },
    }),
  );
}

function getSocialLocale(
  locale:
    AppLocale,
) {
  switch (
    locale
  ) {
    case 'fr':
      return 'fr_FR';

    case 'ar':
      return 'ar_SA';

    case 'en':
    default:
      return 'en_US';
  }
}

/*
 * Les neuf services sont connus à la compilation.
 *
 * Next peut donc pré-générer toutes les versions
 * FR / EN / AR de ces landing pages.
 */
export function generateStaticParams() {
  return SERVICE_CATALOG.flatMap(
    service =>
      routing.locales.map(
        locale => ({
          locale,

          serviceSlug:
            service.slugs[
              locale
            ],
        }),
      ),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
    serviceSlug,
  } =
    await params;

  const service =
    getServiceBySlug(
      locale,
      serviceSlug,
    );

  if (
    !service
  ) {
    return {};
  }

  const t =
    await getTranslations({
      locale,

      namespace:
        'pages.services',
    });

  const title =
    t(
      `items.${service.key}.seo.title`,
    );

  const description =
    t(
      `items.${service.key}.seo.description`,
    );

  const canonical =
    getServiceUrl(
      locale,
      service.slugs[
        locale
      ],
    );

  const languageAlternates =
    Object.fromEntries(
      routing.locales.map(
        targetLocale => [
          targetLocale,

          getServiceUrl(
            targetLocale,

            service.slugs[
              targetLocale
            ],
          ),
        ],
      ),
    );

  return {
    title,

    description,

    alternates: {
      canonical,

      languages:
        languageAlternates,
    },

    robots: {
      index:
        true,

      follow:
        true,
    },

    openGraph: {
      title,

      description,

      url:
        canonical,

      siteName:
        ORGANIZATION_NAME,

      locale:
        getSocialLocale(
          locale,
        ),

      type:
        'website',

      images: [
        {
          url:
            SOCIAL_IMAGE_URL,

          width:
            1200,

          height:
            630,

          alt:
            ORGANIZATION_NAME,
        },
      ],
    },

    twitter: {
      card:
        'summary_large_image',

      title,

      description,

      images: [
        SOCIAL_IMAGE_URL,
      ],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: PageProps) {
  const {
    locale,
    serviceSlug,
  } =
    await params;

  setRequestLocale(
    locale,
  );

  const service =
    getServiceBySlug(
      locale,
      serviceSlug,
    );

  if (
    !service
  ) {
    notFound();
  }

  const [
    t,
    navigationTranslations,
  ] =
    await Promise.all([
      getTranslations({
        locale,

        namespace:
          'pages.services',
      }),

      getTranslations({
        locale,

        namespace:
          'navigation',
      }),
    ]);

  const title =
    t(
      `items.${service.key}.title`,
    );

  const shortTitle =
    t(
      `items.${service.key}.shortTitle`,
    );

  const promise =
    t(
      `items.${service.key}.promise`,
    );

  const description =
    t(
      `items.${service.key}.description`,
    );

  const challenge =
    t(
      `items.${service.key}.challenge`,
    );

  const solutions =
    t.raw(
      `items.${service.key}.solutions`,
    ) as string[];

  const benefits =
    t.raw(
      `items.${service.key}.benefits`,
    ) as string[];

  const example =
    t(
      `items.${service.key}.example`,
    );

  const forWhomTitle =
    t(
      `items.${service.key}.detail.forWhomTitle`,
    );

  const forWhom =
    t(
      `items.${service.key}.detail.forWhom`,
    );

  const useCasesTitle =
    t(
      `items.${service.key}.detail.useCasesTitle`,
    );

  const useCases =
    t.raw(
      `items.${service.key}.detail.useCases`,
    ) as string[];

  const faqTitle =
    t(
      `items.${service.key}.detail.faqTitle`,
    );

  const faq =
    t.raw(
      `items.${service.key}.detail.faq`,
    ) as Array<{
      question:
        string;

      answer:
        string;
    }>;

  const canonical =
    getServiceUrl(
      locale,

      service.slugs[
        locale
      ],
    );

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
              'services',
            ),

          href:
            '/services',
        },

        {
          name:
            title,

          url:
            canonical,
        },
      ],
    });

  const serviceStructuredData = {
    '@context':
      'https://schema.org',

    '@type':
      'Service',

    '@id':
      `${canonical}#service`,

    name:
      title,

    serviceType:
      shortTitle,

    description,

    url:
      canonical,

    inLanguage:
      locale,

    provider: {
      '@type':
        'Organization',

      '@id':
        ORGANIZATION_ID,

      name:
        ORGANIZATION_NAME,
    },
  };

  const faqStructuredData = {
    '@context':
      'https://schema.org',

    '@type':
      'FAQPage',

    mainEntity:
      faq.map(
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
  };

  const methodItems = [
    {
      number:
        '01',

      title:
        t(
          'method.items.diagnosis.title',
        ),

      description:
        t(
          'method.items.diagnosis.description',
        ),
    },

    {
      number:
        '02',

      title:
        t(
          'method.items.design.title',
        ),

      description:
        t(
          'method.items.design.description',
        ),
    },

    {
      number:
        '03',

      title:
        t(
          'method.items.deployment.title',
        ),

      description:
        t(
          'method.items.deployment.description',
        ),
    },
  ];

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              serviceStructuredData,
            ).replace(
              /</g,
              '\\u003c',
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              faqStructuredData,
            ).replace(
              /</g,
              '\\u003c',
            ),
        }}
      />

      <div className="services-page">
        {/*
         * HERO
         *
         * On reprend volontairement la charte et les classes
         * de la page Services afin de garder une continuité
         * visuelle parfaite.
         */}
        <section
          className="services-hero"
          aria-labelledby="service-detail-page-title"
        >
          <div
            className="services-hero__background"
            aria-hidden="true"
          >
            <span className="services-hero__orb services-hero__orb--cyan" />

            <span className="services-hero__orb services-hero__orb--violet" />

            <span className="services-hero__grid" />
          </div>

          <div className="site-container services-hero__container">
            <div className="services-hero__content">
              <p
                className="eyebrow"
                data-reveal="up"
              >
                {shortTitle}
              </p>

              <h1
                id="service-detail-page-title"
                data-reveal="up"
                data-reveal-delay="1"
              >
                {title}
              </h1>

              <p
                className="services-hero__lead"
                data-reveal="up"
                data-reveal-delay="2"
              >
                {promise}
              </p>

              <p
                className="services-hero__description"
                data-reveal="up"
                data-reveal-delay="3"
              >
                {description}
              </p>

              <div
                data-reveal="up"
                data-reveal-delay="4"
                style={{
                  display:
                    'flex',

                  flexWrap:
                    'wrap',

                  gap:
                    '0.75rem',

                  marginTop:
                    '1.5rem',
                }}
              >
                <Link
                  href="/contact"
                  className="services-button services-button--primary"
                >
                  <span>
                    {
                      t(
                        'common.discoverService',
                      )
                    }
                  </span>

                  <Target
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/services"
                  className="services-button"
                >
                  <ArrowLeft
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span>
                    {
                      t(
                        'common.backToNavigation',
                      )
                    }
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/*
         * STORYTELLING :
         * problème → ce qu'on construit → bénéfices → preuve.
         */}
        <div className="services-content">
          <div className="services-content__container">
            <main className="services-details">
              <section
                className="service-detail"
                aria-labelledby="service-solution-title"
              >
                <article className="service-detail__layout">
                  <div
                    className="service-detail__heading"
                    data-reveal="up"
                  >
                    <p className="service-detail__block-label">
                      {
                        t(
                          'common.challengeTitle',
                        )
                      }
                    </p>

                    <h2 id="service-solution-title">
                      {promise}
                    </h2>

                    <p className="service-detail__description">
                      {challenge}
                    </p>
                  </div>

                  <div className="service-detail__content">
                    <div className="service-detail__columns">
                      <div
                        className="service-detail__list-card"
                        data-reveal="up"
                      >
                        <h3>
                          {
                            t(
                              'common.solutionsTitle',
                            )
                          }
                        </h3>

                        <ul>
                          {
                            solutions.map(
                              solution => (
                                <li
                                  key={
                                    solution
                                  }
                                >
                                  <Check
                                    size={17}
                                    strokeWidth={2.3}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {
                                      solution
                                    }
                                  </span>
                                </li>
                              ),
                            )
                          }
                        </ul>
                      </div>

                      <div
                        className="service-detail__list-card service-detail__list-card--benefits"
                        data-reveal="up"
                        data-reveal-delay="1"
                      >
                        <h3>
                          {
                            t(
                              'common.benefitsTitle',
                            )
                          }
                        </h3>

                        <ul>
                          {
                            benefits.map(
                              benefit => (
                                <li
                                  key={
                                    benefit
                                  }
                                >
                                  <Check
                                    size={17}
                                    strokeWidth={2.3}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {
                                      benefit
                                    }
                                  </span>
                                </li>
                              ),
                            )
                          }
                        </ul>
                      </div>
                    </div>

                    <aside
                      className="service-detail__example"
                      data-reveal="up"
                      data-reveal-delay="2"
                    >
                      <div className="service-detail__example-icon">
                        <DatabaseZap
                          size={21}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p className="service-detail__example-label">
                          {
                            t(
                              'common.exampleLabel',
                            )
                          }
                        </p>

                        <p>
                          {example}
                        </p>
                      </div>
                    </aside>
                  </div>
                </article>
              </section>
            </main>
          </div>
        </div>

        {/*
         * CONTENU SPÉCIFIQUE À CHAQUE SERVICE
         *
         * Ce bloc différencie réellement les landing pages :
         * pertinence → cas d'usage → FAQ.
         */}
        <div className="services-content">
          <div className="services-content__container">
            <section
              className="service-detail"
              aria-labelledby="service-fit-title"
            >
              <article className="service-detail__layout">
                <div
                  className="service-detail__heading"
                  data-reveal="up"
                >
                  <p className="service-detail__block-label">
                    {shortTitle}
                  </p>

                  <h2 id="service-fit-title">
                    {forWhomTitle}
                  </h2>

                  <p className="service-detail__description">
                    {forWhom}
                  </p>
                </div>

                <div className="service-detail__content">
                  <div
                    className="service-detail__list-card"
                    data-reveal="up"
                  >
                    <h3>
                      {useCasesTitle}
                    </h3>

                    <ul>
                      {
                        useCases.map(
                          useCase => (
                            <li
                              key={
                                useCase
                              }
                            >
                              <Check
                                size={17}
                                strokeWidth={2.3}
                                aria-hidden="true"
                              />

                              <span>
                                {useCase}
                              </span>
                            </li>
                          ),
                        )
                      }
                    </ul>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </div>

        {/*
         * FAQ SPÉCIFIQUE
         *
         * Les mêmes questions sont visibles dans la page et
         * utilisées dans le JSON-LD FAQPage.
         */}
        <section className="services-method">
          <div className="site-container">
            <div
              className="services-method__intro"
              data-reveal="up"
            >
              <p className="eyebrow">
                {shortTitle}
              </p>

              <h2>
                {faqTitle}
              </h2>
            </div>

            <div className="services-method__grid">
              {
                faq.map(
                  (
                    item,
                    index,
                  ) => (
                    <article
                      key={
                        item.question
                      }
                      className="services-method__item"
                      data-reveal="up"
                      data-reveal-delay={
                        String(
                          index + 1,
                        )
                      }
                    >
                      <span className="services-method__number">
                        {
                          String(
                            index + 1,
                          ).padStart(
                            2,
                            '0',
                          )
                        }
                      </span>

                      <h3>
                        {
                          item.question
                        }
                      </h3>

                      <p>
                        {
                          item.answer
                        }
                      </p>
                    </article>
                  ),
                )
              }
            </div>
          </div>
        </section>

        {/*
         * MÉTHODE
         *
         * Cette partie rassure le prospect :
         * Axplify ne vend pas juste une technologie,
         * mais une démarche structurée.
         */}
        <section className="services-method">
          <div className="site-container">
            <div
              className="services-method__intro"
              data-reveal="up"
            >
              <p className="eyebrow">
                {
                  t(
                    'method.eyebrow',
                  )
                }
              </p>

              <h2>
                {
                  t(
                    'method.title',
                  )
                }
              </h2>

              <p>
                {
                  t(
                    'method.description',
                  )
                }
              </p>
            </div>

            <div className="services-method__grid">
              {
                methodItems.map(
                  (
                    item,
                    index,
                  ) => (
                    <article
                      key={
                        item.number
                      }
                      className="services-method__item"
                      data-reveal="up"
                      data-reveal-delay={
                        String(
                          index + 1,
                        )
                      }
                    >
                      <span className="services-method__number">
                        {
                          item.number
                        }
                      </span>

                      <h3>
                        {
                          item.title
                        }
                      </h3>

                      <p>
                        {
                          item.description
                        }
                      </p>
                    </article>
                  ),
                )
              }
            </div>
          </div>
        </section>

        {/*
         * CTA COMMERCIAL
         */}
        <section className="services-final-cta">
          <div className="site-container">
            <div
              className="services-final-cta__card"
              data-reveal="scale"
            >
              <div>
                <p className="eyebrow">
                  {
                    t(
                      'finalCta.eyebrow',
                    )
                  }
                </p>

                <h2>
                  {
                    t(
                      'finalCta.title',
                    )
                  }
                </h2>

                <p>
                  {
                    t(
                      'finalCta.description',
                    )
                  }
                </p>
              </div>

              <div className="services-final-cta__actions">
                <Link
                  href="/contact"
                  className="services-button services-button--light"
                >
                  <span>
                    {
                      t(
                        'finalCta.secondaryCta',
                      )
                    }
                  </span>

                  <Target
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}