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

  if (
    !responseBody ||
    typeof responseBody !==
      'object'
  ) {
    throw new PublicReviewsApiError(
      'La réponse du serveur est invalide.',
      response.status,
    );
  }

  return responseBody as T;
}

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