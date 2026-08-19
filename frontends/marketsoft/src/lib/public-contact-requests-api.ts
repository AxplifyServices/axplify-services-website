import type {
  AppLocale,
} from '@/i18n/routing';

export const CONTACT_REQUEST_SOURCES = [
  'CONTACT_PAGE',
  'ASSIST_PAGE',
] as const;

export type ContactRequestSource =
  (typeof CONTACT_REQUEST_SOURCES)[number];

export type ContactRequestAvailabilityPayload = {
  startsAt: string;
  endsAt: string;
  timezone: string;
  note?: string;
};

export type CreateContactRequestPayload = {
  source: ContactRequestSource;
  locale: AppLocale;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  needDescription: string;
  phoneNumber: string;
  email: string;
  wantsAppointment: boolean;
  privacyConsent: boolean;
  availabilities: ContactRequestAvailabilityPayload[];
  website: string;
};

export type PublicContactRequestResponse = {
  message: string;
  request: {
    id: string;
    status: 'RECEIVED';
    source: ContactRequestSource;
    createdAt: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

export class PublicContactRequestApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'PublicContactRequestApiError';
  }
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(
  payload: unknown,
) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('message' in payload)
  ) {
    return null;
  }

  const message = payload.message;

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === 'string',
    );

    return messages.length > 0
      ? messages.join(' ')
      : null;
  }

  return null;
}

export async function createPublicContactRequest(
  payload: CreateContactRequestPayload,
): Promise<PublicContactRequestResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/contact-requests/public`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  } catch {
    throw new PublicContactRequestApiError(
      'Le serveur est momentanément inaccessible.',
      0,
    );
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new PublicContactRequestApiError(
      extractErrorMessage(responseBody) ??
        'La demande n’a pas pu être envoyée.',
      response.status,
    );
  }

  if (
    !responseBody ||
    typeof responseBody !== 'object' ||
    !('request' in responseBody)
  ) {
    throw new PublicContactRequestApiError(
      'La réponse du serveur est invalide.',
      response.status,
    );
  }

  return responseBody as PublicContactRequestResponse;
}
