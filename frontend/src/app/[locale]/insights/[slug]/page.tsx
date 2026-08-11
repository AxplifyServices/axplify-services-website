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
  PublicationCoverLightbox,
} from '@/components/insights/publication-cover-lightbox';

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPathname,
} from '@/i18n/navigation';

import {
  getPublicPublicationBySlug,
} from '@/lib/public-publications-api';

import type {
  PublicationContentType,
  PublicPublication,
} from '@/lib/public-publications-api';

import {
  ORGANIZATION_ID,
  ORGANIZATION_NAME,
  SITE_URL,
} from '@/lib/site-config';

import {
  createBreadcrumbStructuredData,
} from '@/lib/breadcrumb-structured-data';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;

      slug:
        string;
    }>;
};

type ArticleStructuredDataType =
  'Article' |
  'NewsArticle';

function absoluteUrl(
  pathname:
    string,
) {
  return new URL(
    pathname,
    SITE_URL,
  ).toString();
}

function getStructuredDataType(
  contentType:
    PublicationContentType,
): ArticleStructuredDataType {
  switch (
    contentType
  ) {
    case 'NEWS':
    case 'PRESS_RELEASE':
    case 'ANNOUNCEMENT':
      return 'NewsArticle';

    case 'ARTICLE':
    case 'CASE_STUDY':
    case 'GUIDE':
    case 'RESOURCE':
    case 'EVENT':
    default:
      return 'Article';
  }
}

function getPublicationUrl(
  locale:
    AppLocale,

  slug:
    string,
) {
  return absoluteUrl(
    getPathname({
      locale,

      href: {
        pathname:
          '/insights/[slug]',

        params: {
          slug,
        },
      },
    }),
  );
}

function buildArticleStructuredData(
  publication:
    PublicPublication,

  locale:
    AppLocale,
) {
  const publicationUrl =
    getPublicationUrl(
      locale,
      publication.slug,
    );

  const images =
    publication.media
      ?.map(
        media =>
          media.cardImageUrl ||
          media.mediaUrl,
      )
      .filter(
        (
          imageUrl,
        ): imageUrl is string =>
          Boolean(
            imageUrl,
          ),
      ) ??
    [];

  if (
    images.length ===
      0 &&
    publication.coverMedia
      ?.cardImageUrl
  ) {
    images.push(
      publication.coverMedia
        .cardImageUrl,
    );
  }

  return {
    '@context':
      'https://schema.org',

    '@type':
      getStructuredDataType(
        publication.contentType,
      ),

    '@id':
      `${publicationUrl}#article`,

    headline:
      publication.title,

    description:
      publication.excerpt,

    url:
      publicationUrl,

    mainEntityOfPage: {
      '@type':
        'WebPage',

      '@id':
        publicationUrl,
    },

    inLanguage:
      publication.resolvedLocale,

    image:
      images.length >
        0
        ? images
        : undefined,

    datePublished:
      publication.publishedAt ??
      undefined,

    dateModified:
      publication.updatedAt,

    author: {
      '@type':
        'Organization',

      '@id':
        ORGANIZATION_ID,

      name:
        ORGANIZATION_NAME,
    },

    publisher: {
      '@type':
        'Organization',

      '@id':
        ORGANIZATION_ID,

      name:
        ORGANIZATION_NAME,
    },

    keywords:
      publication.tags.length >
        0
        ? publication.tags
            .map(
              tag =>
                tag.label,
            )
            .join(
              ', ',
            )
        : undefined,

    isPartOf: {
      '@type':
        'WebSite',

      '@id':
        `${SITE_URL.replace(
          /\/$/,
          '',
        )}/#website`,

      url:
        SITE_URL,

      name:
        ORGANIZATION_NAME,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    locale,
    slug,
  } =
    await params;

  const publication =
    await getPublicPublicationBySlug(
      locale,
      slug,
    );

  if (
    !publication
  ) {
    return {};
  }

/*
 * Si la langue demandée n'existe pas réellement,
 * publication.resolvedLocale contient la langue source
 * effectivement servie.
 *
 * Exemple :
 * /ar/... avec contenu EN
 * → canonical vers /en/...
 */
const automaticCanonical =
  getPublicationUrl(
    publication.resolvedLocale,
    publication.slug,
  );

const canonicalUrl =
  publication.seo.canonicalUrl ??
  automaticCanonical;

const alternateLanguages:
  Record<
    string,
    string
  > =
  {};

const frenchVersion =
  publication
    .localizedVersions
    .fr;

if (
  frenchVersion
) {
  alternateLanguages.fr =
    frenchVersion.canonicalUrl ??
    getPublicationUrl(
      'fr',
      frenchVersion.slug,
    );
}

const englishVersion =
  publication
    .localizedVersions
    .en;

if (
  englishVersion
) {
  alternateLanguages.en =
    englishVersion.canonicalUrl ??
    getPublicationUrl(
      'en',
      englishVersion.slug,
    );
}

  return {
    title:
      publication.seo.title,

    description:
      publication.seo.description,

    robots:
      publication.seo.allowIndexing
        ? {
            index:
              true,

            follow:
              true,
          }
        : {
            index:
              false,

            follow:
              false,

            noarchive:
              true,
          },

alternates: {
  canonical:
    canonicalUrl,

  languages:
    alternateLanguages,
},

    openGraph: {
      title:
        publication.seo.title,

      description:
        publication.seo.description,

      type:
        'article',

      publishedTime:
        publication.publishedAt ??
        undefined,

      modifiedTime:
        publication.updatedAt,

      tags:
        publication.tags.map(
          tag =>
            tag.label,
        ),

      images:
        publication.coverMedia
          ?.cardImageUrl
          ? [
              {
                url:
                  publication.coverMedia
                    .cardImageUrl,

                alt:
                  publication.coverMedia
                    .altText ||
                  publication.title,
              },
            ]
          : undefined,
    },
  };
}

export default async function PublicationPage({
  params,
}: PageProps) {
  const {
    locale,
    slug,
  } =
    await params;

  setRequestLocale(
    locale,
  );

const [
  publication,
  translations,
  navigationTranslations,
] =
  await Promise.all([
    getPublicPublicationBySlug(
      locale,
      slug,
    ),

    getTranslations({
      locale,

      namespace:
        'pages.insights',
    }),

    getTranslations({
      locale,

      namespace:
        'navigation',
    }),
  ]);

  if (
    !publication
  ) {
    notFound();
  }

  const formattedDate =
    publication.publishedAt
      ? new Intl.DateTimeFormat(
          locale,
          {
            day:
              'numeric',

            month:
              'long',

            year:
              'numeric',
          },
        ).format(
          new Date(
            publication.publishedAt,
          ),
        )
      : '';

  const articleStructuredData =
    buildArticleStructuredData(
      publication,
      locale,
    );

   const publicationUrl =
  getPublicationUrl(
    locale,
    publication.slug,
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
            'insights',
          ),

        href:
          '/insights',
      },

      {
        name:
          publication.title,

        url:
          publicationUrl,
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
              articleStructuredData,
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
        breadcrumbStructuredData,
      ).replace(
        /</g,
        '\\u003c',
      ),
  }}
/>      

      <article className="publication-page">
        <header className="publication-page__hero">
          <div className="site-container publication-page__hero-inner">
            <p className="eyebrow">
              {
                translations(
                  `types.${publication.contentType}`,
                )
              }
            </p>

            <h1>
              {
                publication.title
              }
            </h1>

            <div className="publication-page__meta">
              {
                formattedDate
                  ? (
                      <time
                        dateTime={
                          publication.publishedAt ??
                          undefined
                        }
                      >
                        {
                          formattedDate
                        }
                      </time>
                    )
                  : null
              }

              {
                publication.tags.map(
                  tag => (
                    <span
                      key={
                        tag.id
                      }
                    >
                      {
                        tag.label
                      }
                    </span>
                  ),
                )
              }
            </div>

            <p className="publication-page__excerpt">
              {
                publication.excerpt
              }
            </p>
          </div>
        </header>

        {
          publication.media &&
          publication.media.length >
            0
            ? (
                <div className="site-container publication-page__cover">
                  <PublicationCoverLightbox
                    media={
                      publication.media
                        .slice()
                        .sort(
                          (
                            first,
                            second,
                          ) =>
                            first.sortOrder -
                            second.sortOrder,
                        )
                    }
                    title={
                      publication.title
                    }
                    openLabel={
                      translations(
                        'imageViewer.open',
                      )
                    }
                    closeLabel={
                      translations(
                        'imageViewer.close',
                      )
                    }
                    previousLabel={
                      translations(
                        'pagination.previous',
                      )
                    }
                    nextLabel={
                      translations(
                        'pagination.next',
                      )
                    }
                  />
                </div>
              )
            : publication.coverMedia
              ? (
                  <div className="site-container publication-page__cover">
                    <PublicationCoverLightbox
                      media={[
                        publication.coverMedia,
                      ]}
                      title={
                        publication.title
                      }
                      openLabel={
                        translations(
                          'imageViewer.open',
                        )
                      }
                      closeLabel={
                        translations(
                          'imageViewer.close',
                        )
                      }
                      previousLabel={
                        translations(
                          'pagination.previous',
                        )
                      }
                      nextLabel={
                        translations(
                          'pagination.next',
                        )
                      }
                    />
                  </div>
                )
              : null
        }

        <div className="site-container publication-page__content-layout">
          <div
            className="publication-page__content"
            dangerouslySetInnerHTML={{
              __html:
                publication.body ??
                '',
            }}
          />
        </div>
      </article>
    </>
  );
}