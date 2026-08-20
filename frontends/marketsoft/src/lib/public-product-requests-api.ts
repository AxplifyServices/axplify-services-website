import type {
  AppLocale,
} from '@/i18n/routing';

export const PRODUCT_REQUEST_TYPES = [
  'CONTACT',
  'DEMO',
  'ORDER',
] as const;

export type ProductRequestType =
  (typeof PRODUCT_REQUEST_TYPES)[number];

export type PublicProductRequestPayload = {
  productKey: string;
  requestType: ProductRequestType;
  locale: AppLocale;
  firstName?: string;
  lastName?: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  message: string;
  sourceUrl?: string;
  privacyConsent: boolean;
  website?: string;
};

export type PublicProductRequestResponse = {
  message: string;
  request: {
    id: string;
    type: ProductRequestType;
    status: 'RECEIVED';
    createdAt: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

export class PublicProductRequestApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'PublicProductRequestApiError';
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

export async function createPublicProductRequest(
  payload: PublicProductRequestPayload,
): Promise<PublicProductRequestResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/product-requests/public`,
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
    throw new PublicProductRequestApiError(
      'Le serveur est momentanément inaccessible.',
      0,
    );
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new PublicProductRequestApiError(
      extractErrorMessage(responseBody) ??
        'La demande produit n’a pas pu être envoyée.',
      response.status,
    );
  }

  if (
    !responseBody ||
    typeof responseBody !== 'object' ||
    !('request' in responseBody)
  ) {
    throw new PublicProductRequestApiError(
      'La réponse du serveur est invalide.',
      response.status,
    );
  }

  return responseBody as PublicProductRequestResponse;
}
