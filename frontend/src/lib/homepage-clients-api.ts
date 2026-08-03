import type {
  AppLocale,
} from '@/i18n/routing';

export type PublicHomepageClient = {
  id:
    string;

  name:
    string;

  industry:
    string;

  logoUrl:
    string;

  logoAlt:
    string;
};

type RawPublicHomepageClient = {
  id?:
    unknown;

  name?:
    unknown;

  industry?:
    unknown;

  logoUrl?:
    unknown;

  logoAlt?:
    unknown;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

function asNonEmptyString(
  value:
    unknown,
): string | null {
  if (
    typeof value !==
    'string'
  ) {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue
    ? normalizedValue
    : null;
}

function normalizeClient(
  rawClient:
    RawPublicHomepageClient,
): PublicHomepageClient | null {
  const id =
    asNonEmptyString(
      rawClient.id,
    );

  const name =
    asNonEmptyString(
      rawClient.name,
    );

  const logoUrl =
    asNonEmptyString(
      rawClient.logoUrl,
    );

  if (
    !id ||
    !name ||
    !logoUrl
  ) {
    return null;
  }

  return {
    id,

    name,

    industry:
      asNonEmptyString(
        rawClient.industry,
      ) ??
      '',

    logoUrl,

    logoAlt:
      asNonEmptyString(
        rawClient.logoAlt,
      ) ??
      `Logo ${name}`,
  };
}

export async function getPublicHomepageClients(
  locale:
    AppLocale,
): Promise<
  PublicHomepageClient[]
> {
  try {
    const response =
      await fetch(
        `${API_URL}/clients/homepage?locale=${locale}`,
        {
          cache:
            'no-store',

          headers: {
            Accept:
              'application/json',
          },
        },
      );

    if (
      !response.ok
    ) {
      console.error(
        '[Homepage clients] API error:',
        response.status,
        response.statusText,
      );

      return [];
    }

    const responseBody:
      unknown =
        await response.json();

    if (
      !Array.isArray(
        responseBody,
      )
    ) {
      console.error(
        '[Homepage clients] Invalid API response: expected an array.',
      );

      return [];
    }

    return responseBody
      .map(
        item =>
          normalizeClient(
            item as
              RawPublicHomepageClient,
          ),
      )
      .filter(
        (
          client,
        ): client is
          PublicHomepageClient =>
            client !==
            null,
      );
  } catch (
    error
  ) {
    console.error(
      '[Homepage clients] Unable to load clients:',
      error,
    );

    return [];
  }
}