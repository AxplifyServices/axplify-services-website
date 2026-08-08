import type {
  AppLocale,
} from '@/i18n/routing';

export type PublicReviewProject = {
  id:
    string;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  client: {
    id:
      string;

    name:
      string;
  } | null;
};

export type PublicReview = {
  id:
    string;

  rating:
    number;

  comment:
    string;

  firstName:
    string;

  lastName:
    string;

  companyName:
    string;

  companyRole:
    string;

  locale:
    AppLocale;

  project:
    PublicReviewProject | null;

  publishedAt:
    string | null;

  createdAt:
    string;
};

export type PublicReviewsPagination = {
  page:
    number;

  limit:
    number;

  total:
    number;

  totalPages:
    number;
};

export type PublicReviewsResponse = {
  items:
    PublicReview[];

  pagination:
    PublicReviewsPagination;
};

export type PublicHomepageReviewsResponse = {
  items:
    PublicReview[];
};

export type PublicReviewInvitationResponse = {
  valid:
    true;

  invitation: {
    expiresAt:
      string;

    project:
      PublicReviewProject | null;
  };
};

export type CreatePublicReviewPayload = {
  rating:
    number;

  comment:
    string;

  firstName:
    string;

  lastName:
    string;

  companyName:
    string;

  companyRole:
    string;

  locale:
    AppLocale;
};

export type CreatePublicReviewResponse = {
  message:
    string;

  review: {
    id:
      string;

    status:
      'PENDING_REVIEW';

    createdAt:
      string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

export class PublicReviewsApiError extends Error {
  constructor(
    message:
      string,

    public readonly status:
      number,
  ) {
    super(
      message,
    );

    this.name =
      'PublicReviewsApiError';
  }
}

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
):
  string | null
{
  if (
    typeof value !==
    'string'
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized ||
    null;
}

function asNumber(
  value:
    unknown,
) {
  return typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
    ? value
    : 0;
}

function asLocale(
  value:
    unknown,
):
  AppLocale
{
  if (
    value ===
      'en' ||
    value ===
      'ar'
  ) {
    return value;
  }

  return 'fr';
}

function normalizeProject(
  value:
    unknown,
):
  PublicReviewProject | null
{
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      raw.id,
    );

  if (
    !id
  ) {
    return null;
  }

  let client:
    PublicReviewProject['client'] =
    null;

  if (
    raw.client &&
    typeof raw.client ===
      'object'
  ) {
    const rawClient =
      raw.client as Record<
        string,
        unknown
      >;

    const clientId =
      asString(
        rawClient.id,
      );

    const clientName =
      asString(
        rawClient.name,
      );

    if (
      clientId &&
      clientName
    ) {
      client = {
        id:
          clientId,

        name:
          clientName,
      };
    }
  }

  return {
    id,

    titleFr:
      asString(
        raw.titleFr,
      ),

    titleEn:
      asNullableString(
        raw.titleEn,
      ),

    titleAr:
      asNullableString(
        raw.titleAr,
      ),

    client,
  };
}

function normalizeReview(
  value:
    unknown,
):
  PublicReview | null
{
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      raw.id,
    );

  const comment =
    asString(
      raw.comment,
    );

  const firstName =
    asString(
      raw.firstName,
    );

  const lastName =
    asString(
      raw.lastName,
    );

  const companyName =
    asString(
      raw.companyName,
    );

  const companyRole =
    asString(
      raw.companyRole,
    );

  const rating =
    asNumber(
      raw.rating,
    );

  if (
    !id ||
    !comment ||
    !firstName ||
    !lastName ||
    !companyName ||
    !companyRole ||
    rating <
      1 ||
    rating >
      5
  ) {
    return null;
  }

  return {
    id,

    rating,

    comment,

    firstName,

    lastName,

    companyName,

    companyRole,

    locale:
      asLocale(
        raw.locale,
      ),

    project:
      normalizeProject(
        raw.project,
      ),

    publishedAt:
      asNullableString(
        raw.publishedAt,
      ),

    createdAt:
      asString(
        raw.createdAt,
      ),
  };
}

async function parseResponseBody(
  response:
    Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      'content-type',
    );

  if (
    !contentType?.includes(
      'application/json',
    )
  ) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(
  payload:
    unknown,
) {
  if (
    !payload ||
    typeof payload !==
      'object' ||
    !(
      'message' in
      payload
    )
  ) {
    return null;
  }

  const message =
    payload.message;

  if (
    typeof message ===
    'string'
  ) {
    return message;
  }

  if (
    Array.isArray(
      message,
    )
  ) {
    const messages =
      message.filter(
        (
          item,
        ): item is string =>
          typeof item ===
          'string',
      );

    return messages.length >
      0
      ? messages.join(
          ' ',
        )
      : null;
  }

  return null;
}

async function requestPublicReviewApi<T>(
  pathname:
    string,

  init?:
    RequestInit,
): Promise<T> {
  let response:
    Response;

  try {
    response =
      await fetch(
        `${API_URL}${pathname}`,
        {
          ...init,

          headers: {
            Accept:
              'application/json',

            ...(init?.body
              ? {
                  'Content-Type':
                    'application/json',
                }
              : {}),

            ...init?.headers,
          },
        },
      );
  } catch {
    throw new PublicReviewsApiError(
      'Le serveur est momentanément inaccessible.',
      0,
    );
  }

  const responseBody =
    await parseResponseBody(
      response,
    );

  if (
    !response.ok
  ) {
    throw new PublicReviewsApiError(
      extractErrorMessage(
        responseBody,
      ) ??
        'La demande n’a pas pu être traitée.',

      response.status,
    );
  }

  return responseBody as T;
}

/*
 * =========================================================
 * PUBLIC — REVIEWS PAGE
 * =========================================================
 */

export async function getPublicReviews({
  page = 1,
  limit = 10,
}: {
  page?:
    number;

  limit?:
    number;
} = {}): Promise<PublicReviewsResponse> {
  const parameters =
    new URLSearchParams();

  parameters.set(
    'page',
    String(
      page,
    ),
  );

  parameters.set(
    'limit',
    String(
      limit,
    ),
  );

  const response =
    await requestPublicReviewApi<{
      items?:
        unknown;

      pagination?:
        unknown;
    }>(
      `/reviews/public?${parameters.toString()}`,
      {
        method:
          'GET',

        next: {
          revalidate:
            60,
        },
      },
    );

  const items =
    Array.isArray(
      response.items,
    )
      ? response.items
          .map(
            normalizeReview,
          )
          .filter(
            (
              review,
            ): review is PublicReview =>
              review !==
              null,
          )
      : [];

  const rawPagination =
    response.pagination &&
    typeof response.pagination ===
      'object'
      ? response.pagination as Record<
          string,
          unknown
        >
      : {};

  return {
    items,

    pagination: {
      page:
        Math.max(
          1,
          asNumber(
            rawPagination.page,
          ) ||
            page,
        ),

      limit:
        Math.max(
          1,
          asNumber(
            rawPagination.limit,
          ) ||
            limit,
        ),

      total:
        Math.max(
          0,
          asNumber(
            rawPagination.total,
          ),
        ),

      totalPages:
        Math.max(
          0,
          asNumber(
            rawPagination.totalPages,
          ),
        ),
    },
  };
}

/*
 * =========================================================
 * PUBLIC — HOME
 * =========================================================
 */

export async function getHomepageReviews():
Promise<PublicReview[]> {
  const response =
    await requestPublicReviewApi<{
      items?:
        unknown;
    }>(
      '/reviews/public/homepage',
      {
        method:
          'GET',

        next: {
          revalidate:
            60,
        },
      },
    );

  if (
    !Array.isArray(
      response.items,
    )
  ) {
    return [];
  }

  return response.items
    .map(
      normalizeReview,
    )
    .filter(
      (
        review,
      ): review is PublicReview =>
        review !==
        null,
    );
}

/*
 * =========================================================
 * PRIVATE INVITATION
 * =========================================================
 */

export async function validatePublicReviewInvitation(
  token:
    string,
): Promise<PublicReviewInvitationResponse> {
  return requestPublicReviewApi<PublicReviewInvitationResponse>(
    `/reviews/public/invitation/${encodeURIComponent(
      token,
    )}`,
    {
      method:
        'GET',

      cache:
        'no-store',
    },
  );
}

export async function createPublicReview(
  token:
    string,

  payload:
    CreatePublicReviewPayload,
): Promise<CreatePublicReviewResponse> {
  return requestPublicReviewApi<CreatePublicReviewResponse>(
    `/reviews/public/invitation/${encodeURIComponent(
      token,
    )}`,
    {
      method:
        'POST',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}