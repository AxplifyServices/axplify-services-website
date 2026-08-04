import type {
  AppLocale,
} from '@/i18n/routing';

export const PUBLICATION_CONTENT_TYPES =
  [
    'ARTICLE',
    'CASE_STUDY',
    'NEWS',
    'EVENT',
    'PRESS_RELEASE',
    'ANNOUNCEMENT',
    'GUIDE',
    'RESOURCE',
  ] as const;

export type PublicationContentType =
  (typeof PUBLICATION_CONTENT_TYPES)[number];

export type PublicPublicationMedia = {
  id:
    string;

  mediaType:
    'IMAGE' |
    'VIDEO';

  mediaUrl:
    string;

  cardImageUrl:
    string;

  posterUrl:
    string | null;

  isCardCover:
    boolean;

  sortOrder:
    number;

  width:
    number | null;

  height:
    number | null;

  durationSeconds:
    number | null;

  altText:
    string;

  caption:
    string;

  resolvedLocale:
    'fr' |
    'en' |
    null;
};

export type PublicPublication = {
  id:
    string;

  contentType:
    PublicationContentType;

  requestedLocale:
    AppLocale;

  resolvedLocale:
    'fr' |
    'en';

  isFallback:
    boolean;

  title:
    string;

  slug:
    string;

  excerpt:
    string;

  body?:
    string;

  seo: {
    title:
      string;

    description:
      string;

    canonicalUrl:
      string | null;

    allowIndexing:
      boolean;
  };

  coverMedia:
    PublicPublicationMedia | null;

  media?:
    PublicPublicationMedia[];

  expertiseCodes:
    string[];

  tags: Array<{
    id:
      string;

    code:
      string;

    label:
      string;

    slug:
      string;
  }>;

  event: {
    startAt:
      string | null;

    endAt:
      string | null;

    timezone:
      string | null;

    locationType:
      string | null;

    locationName:
      string | null;

    address:
      string | null;

    onlineUrl:
      string | null;

    registrationUrl:
      string | null;

    registrationDeadline:
      string | null;

    capacity:
      number | null;

    status:
      string | null;

    isPast:
      boolean;
  } | null;

  isFeatured:
    boolean;

  publishedAt:
    string | null;

  updatedAt:
    string;
};

export type PublicPublicationsResponse = {
  items:
    PublicPublication[];

  pagination: {
    page:
      number;

    limit:
      number;

    total:
      number;

    totalPages:
      number;
  };
};

export type PublicPublicationsQuery = {
  locale:
    AppLocale;

  page?:
    number;

  limit?:
    number;

  contentType?:
    PublicationContentType;

  featured?:
    boolean;

  includePastEvents?:
    boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

function asString(
  value:
    unknown,
) {
  return typeof value ===
    'string'
    ? value.trim()
    : '';
}

function asNullableString(
  value:
    unknown,
) {
  const normalized =
    asString(
      value,
    );

  return normalized ||
    null;
}

function asNullableNumber(
  value:
    unknown,
) {
  return typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
    ? value
    : null;
}

function isContentType(
  value:
    unknown,
): value is PublicationContentType {
  return (
    typeof value ===
      'string' &&
    PUBLICATION_CONTENT_TYPES.includes(
      value as
        PublicationContentType,
    )
  );
}

function normalizeMedia(
  value:
    unknown,
): PublicPublicationMedia | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const media =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      media.id,
    );

  const mediaType =
    media.mediaType;

  const mediaUrl =
    asString(
      media.mediaUrl,
    );

  const cardImageUrl =
    asString(
      media.cardImageUrl,
    );

  if (
    !id ||
    (
      mediaType !==
        'IMAGE' &&
      mediaType !==
        'VIDEO'
    ) ||
    !mediaUrl ||
    !cardImageUrl
  ) {
    return null;
  }

  return {
    id,

    mediaType,

    mediaUrl,

    cardImageUrl,

    posterUrl:
      asNullableString(
        media.posterUrl,
      ),

    isCardCover:
      media.isCardCover ===
      true,

    sortOrder:
      typeof media.sortOrder ===
        'number'
        ? media.sortOrder
        : 0,

    width:
      asNullableNumber(
        media.width,
      ),

    height:
      asNullableNumber(
        media.height,
      ),

    durationSeconds:
      asNullableNumber(
        media.durationSeconds,
      ),

    altText:
      asString(
        media.altText,
      ),

    caption:
      asString(
        media.caption,
      ),

    resolvedLocale:
      media.resolvedLocale ===
        'fr' ||
      media.resolvedLocale ===
        'en'
        ? media.resolvedLocale
        : null,
  };
}

function normalizePublication(
  value:
    unknown,
): PublicPublication | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const publication =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      publication.id,
    );

  const title =
    asString(
      publication.title,
    );

  const slug =
    asString(
      publication.slug,
    );

  const excerpt =
    asString(
      publication.excerpt,
    );

  const contentType =
    publication.contentType;

  if (
    !id ||
    !title ||
    !slug ||
    !excerpt ||
    !isContentType(
      contentType,
    )
  ) {
    return null;
  }

  const rawSeo =
    publication.seo;

  const seo =
    rawSeo &&
    typeof rawSeo ===
      'object'
      ? rawSeo as Record<
          string,
          unknown
        >
      : {};

  const rawTags =
    Array.isArray(
      publication.tags,
    )
      ? publication.tags
      : [];

  const tags =
    rawTags
      .map(
        rawTag => {
          if (
            !rawTag ||
            typeof rawTag !==
              'object'
          ) {
            return null;
          }

          const tag =
            rawTag as Record<
              string,
              unknown
            >;

          const tagId =
            asString(
              tag.id,
            );

          const label =
            asString(
              tag.label,
            );

          const tagSlug =
            asString(
              tag.slug,
            );

          if (
            !tagId ||
            !label ||
            !tagSlug
          ) {
            return null;
          }

          return {
            id:
              tagId,

            code:
              asString(
                tag.code,
              ),

            label,

            slug:
              tagSlug,
          };
        },
      )
      .filter(
        (
          tag,
        ): tag is NonNullable<
          typeof tag
        > =>
          tag !==
          null,
      );

  const coverMedia =
    normalizeMedia(
      publication.coverMedia,
    );

  const rawMedia =
    Array.isArray(
      publication.media,
    )
      ? publication.media
      : undefined;

  const media =
    rawMedia
      ? rawMedia
          .map(
            normalizeMedia,
          )
          .filter(
            (
              item,
            ): item is PublicPublicationMedia =>
              item !==
              null,
          )
      : undefined;

  return {
    id,

    contentType,

    requestedLocale:
      publication.requestedLocale ===
        'en' ||
      publication.requestedLocale ===
        'ar'
        ? publication.requestedLocale
        : 'fr',

    resolvedLocale:
      publication.resolvedLocale ===
        'en'
        ? 'en'
        : 'fr',

    isFallback:
      publication.isFallback ===
      true,

    title,

    slug,

    excerpt,

    body:
      typeof publication.body ===
        'string'
        ? publication.body
        : undefined,

    seo: {
      title:
        asString(
          seo.title,
        ) ||
        title,

      description:
        asString(
          seo.description,
        ) ||
        excerpt,

      canonicalUrl:
        asNullableString(
          seo.canonicalUrl,
        ),

      allowIndexing:
        seo.allowIndexing !==
        false,
    },

    coverMedia,

    media,

    expertiseCodes:
      Array.isArray(
        publication.expertiseCodes,
      )
        ? publication
            .expertiseCodes
            .filter(
              (
                code,
              ): code is string =>
                typeof code ===
                'string',
            )
        : [],

    tags,

    event:
      publication.event &&
      typeof publication.event ===
        'object'
        ? {
            startAt:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).startAt,
              ),

            endAt:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).endAt,
              ),

            timezone:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).timezone,
              ),

            locationType:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).locationType,
              ),

            locationName:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).locationName,
              ),

            address:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).address,
              ),

            onlineUrl:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).onlineUrl,
              ),

            registrationUrl:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).registrationUrl,
              ),

            registrationDeadline:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).registrationDeadline,
              ),

            capacity:
              asNullableNumber(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).capacity,
              ),

            status:
              asNullableString(
                (
                  publication.event as Record<
                    string,
                    unknown
                  >
                ).status,
              ),

            isPast:
              (
                publication.event as Record<
                  string,
                  unknown
                >
              ).isPast ===
              true,
          }
        : null,

    isFeatured:
      publication.isFeatured ===
      true,

    publishedAt:
      asNullableString(
        publication.publishedAt,
      ),

    updatedAt:
      asString(
        publication.updatedAt,
      ),
  };
}

export async function getPublicPublications({
  locale,
  page = 1,
  limit = 9,
  contentType,
  featured,
  includePastEvents,
}: PublicPublicationsQuery): Promise<
  PublicPublicationsResponse
> {
  const emptyResponse:
    PublicPublicationsResponse = {
      items:
        [],

      pagination: {
        page,

        limit,

        total:
          0,

        totalPages:
          0,
      },
    };

  try {
    const parameters =
      new URLSearchParams({
        locale,

        page:
          String(
            page,
          ),

        limit:
          String(
            limit,
          ),
      });

    if (
      contentType
    ) {
      parameters.set(
        'contentType',
        contentType,
      );
    }

    if (
      featured !==
      undefined
    ) {
      parameters.set(
        'featured',
        String(
          featured,
        ),
      );
    }

    if (
      includePastEvents !==
      undefined
    ) {
      parameters.set(
        'includePastEvents',
        String(
          includePastEvents,
        ),
      );
    }

    const response =
      await fetch(
        `${API_URL}/publications/public?${parameters.toString()}`,
        {
          headers: {
            Accept:
              'application/json',
          },

          next: {
            revalidate:
              300,
          },
        },
      );

    if (
      !response.ok
    ) {
      return emptyResponse;
    }

    const payload =
      await response.json() as
        PublicPublicationsResponse;

    const items =
      Array.isArray(
        payload.items,
      )
        ? payload.items
            .map(
              normalizePublication,
            )
            .filter(
              (
                publication,
              ): publication is PublicPublication =>
                publication !==
                null,
            )
        : [];

    return {
      items,

      pagination: {
        page:
          typeof payload.pagination
            ?.page ===
            'number'
            ? payload.pagination.page
            : page,

        limit:
          typeof payload.pagination
            ?.limit ===
            'number'
            ? payload.pagination.limit
            : limit,

        total:
          typeof payload.pagination
            ?.total ===
            'number'
            ? payload.pagination.total
            : items.length,

        totalPages:
          typeof payload.pagination
            ?.totalPages ===
            'number'
            ? payload.pagination.totalPages
            : 0,
      },
    };
  } catch {
    return emptyResponse;
  }
}

export async function getFeaturedPublications(
  locale:
    AppLocale,

  limit =
    8,
): Promise<
  PublicPublication[]
> {
  try {
    const parameters =
      new URLSearchParams({
        locale,

        limit:
          String(
            limit,
          ),
      });

    const response =
      await fetch(
        `${API_URL}/publications/public/featured?${parameters.toString()}`,
        {
          headers: {
            Accept:
              'application/json',
          },

          next: {
            revalidate:
              300,
          },
        },
      );

    if (
      !response.ok
    ) {
      return [];
    }

    const payload =
      await response.json() as
        PublicPublicationsResponse;

    if (
      !Array.isArray(
        payload.items,
      )
    ) {
      return [];
    }

    return payload.items
      .map(
        normalizePublication,
      )
      .filter(
        (
          publication,
        ): publication is PublicPublication =>
          publication !==
          null,
      );
  } catch {
    return [];
  }
}

export async function getPublicPublicationBySlug(
  locale:
    AppLocale,

  slug:
    string,
): Promise<
  PublicPublication | null
> {
  try {
    const response =
      await fetch(
        `${API_URL}/publications/public/${encodeURIComponent(
          locale,
        )}/${encodeURIComponent(
          slug,
        )}`,
        {
          headers: {
            Accept:
              'application/json',
          },

          next: {
            revalidate:
              300,
          },
        },
      );

    if (
      !response.ok
    ) {
      return null;
    }

    return normalizePublication(
      await response.json(),
    );
  } catch {
    return null;
  }
}