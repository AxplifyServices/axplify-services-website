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

import type {
  AppLocale,
} from '@/i18n/routing';

import {
  getPublicPublicationBySlug,
} from '@/lib/public-publications-api';

type PageProps = {
  params:
    Promise<{
      locale:
        AppLocale;

      slug:
        string;
    }>;
};

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

    alternates:
      publication.seo.canonicalUrl
        ? {
            canonical:
              publication.seo.canonicalUrl,
          }
        : undefined,

    openGraph: {
      title:
        publication.seo.title,

      description:
        publication.seo.description,

      type:
        'article',

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

  return (
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
                      {formattedDate}
                    </time>
                  )
                : null
            }

            {
              publication.tags.map(
                tag => (
                  <span key={tag.id}>
                    {tag.label}
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
        publication.coverMedia
          ? (
              <div className="site-container publication-page__cover">
                <img
                  src={
                    publication.coverMedia
                      .cardImageUrl
                  }
                  alt={
                    publication.coverMedia
                      .altText ||
                    publication.title
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
  );
}