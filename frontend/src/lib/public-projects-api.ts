import type {
  AppLocale,
} from '@/i18n/routing';

export const PROJECT_EXPERTISE_CODES =
  [
    'digital',
    'automation',
    'data',
    'ai',
    'crm',
    'architecture',
    'analytics',
    'leadGeneration',
    'marketingStrategy',
  ] as const;

export type ProjectExpertiseCode =
  (typeof PROJECT_EXPERTISE_CODES)[number];

export type PublicProject = {
  id:
    string;

  title:
    string;

  description:
    string;

  expertiseCodes:
    ProjectExpertiseCode[];

  client: {
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

  publishedAt:
    string | null;
};

export type PublicProjectsPagination = {
  page:
    number;

  limit:
    number;

  total:
    number;

  totalPages:
    number;
};

export type PublicProjectsResponse = {
  items:
    PublicProject[];

  pagination:
    PublicProjectsPagination;
};

type GetPublicProjectsOptions = {
  locale:
    AppLocale;

  page?:
    number;

  limit?:
    number;

  expertise?:
    ProjectExpertiseCode;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

function isExpertiseCode(
  value:
    unknown,
): value is ProjectExpertiseCode {
  return (
    typeof value ===
      'string' &&
    PROJECT_EXPERTISE_CODES.includes(
      value as ProjectExpertiseCode,
    )
  );
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

function normalizeProject(
  value:
    unknown,
): PublicProject | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const rawProject =
    value as Record<
      string,
      unknown
    >;

  const rawClient =
    rawProject.client;

  if (
    !rawClient ||
    typeof rawClient !==
      'object'
  ) {
    return null;
  }

  const client =
    rawClient as Record<
      string,
      unknown
    >;

  const id =
    asString(
      rawProject.id,
    );

  const title =
    asString(
      rawProject.title,
    );

  const description =
    asString(
      rawProject.description,
    );

  const clientId =
    asString(
      client.id,
    );

  const clientName =
    asString(
      client.name,
    );

  const logoUrl =
    asString(
      client.logoUrl,
    );

  if (
    !id ||
    !title ||
    !description ||
    !clientId ||
    !clientName ||
    !logoUrl
  ) {
    return null;
  }

  const expertiseCodes =
    Array.isArray(
      rawProject.expertiseCodes,
    )
      ? rawProject
          .expertiseCodes
          .filter(
            isExpertiseCode,
          )
      : [];

  if (
    expertiseCodes.length ===
    0
  ) {
    return null;
  }

  return {
    id,

    title,

    description,

    expertiseCodes,

    client: {
      id:
        clientId,

      name:
        clientName,

      industry:
        asString(
          client.industry,
        ),

      logoUrl,

      logoAlt:
        asString(
          client.logoAlt,
        ) ||
        `Logo ${clientName}`,
    },

    publishedAt:
      typeof rawProject.publishedAt ===
        'string'
        ? rawProject.publishedAt
        : null,
  };
}

function normalizePagination(
  value:
    unknown,
):
  PublicProjectsPagination
{
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return {
      page:
        1,

      limit:
        10,

      total:
        0,

      totalPages:
        0,
    };
  }

  const rawPagination =
    value as Record<
      string,
      unknown
    >;

  return {
    page:
      Math.max(
        1,
        asNumber(
          rawPagination.page,
        ) ||
          1,
      ),

    limit:
      Math.min(
        10,
        Math.max(
          1,
          asNumber(
            rawPagination.limit,
          ) ||
            10,
        ),
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
  };
}

export async function getPublicProjects({
  locale,
  page = 1,
  limit = 10,
  expertise,
}: GetPublicProjectsOptions):
  Promise<
    PublicProjectsResponse
  >
{
  try {
    const parameters =
      new URLSearchParams({
        locale,

        page:
          String(
            Math.max(
              1,
              page,
            ),
          ),

        limit:
          String(
            Math.min(
              10,
              Math.max(
                1,
                limit,
              ),
            ),
          ),
      });

    if (
      expertise
    ) {
      parameters.set(
        'expertise',
        expertise,
      );
    }

    const response =
      await fetch(
        `${API_URL}/projects/public?${parameters.toString()}`,
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
        '[Public projects] API error:',
        response.status,
        response.statusText,
      );

      return {
        items:
          [],

        pagination: {
          page:
            1,

          limit:
            10,

          total:
            0,

          totalPages:
            0,
        },
      };
    }

    const responseBody =
      await response.json() as
        unknown;

    if (
      !responseBody ||
      typeof responseBody !==
        'object'
    ) {
      console.error(
        '[Public projects] Invalid API response.',
      );

      return {
        items:
          [],

        pagination: {
          page:
            1,

          limit:
            10,

          total:
            0,

          totalPages:
            0,
        },
      };
    }

    const data =
      responseBody as Record<
        string,
        unknown
      >;

    const items =
      Array.isArray(
        data.items,
      )
        ? data.items
            .map(
              normalizeProject,
            )
            .filter(
              (
                project,
              ): project is PublicProject =>
                project !==
                null,
            )
        : [];

    return {
      items,

      pagination:
        normalizePagination(
          data.pagination,
        ),
    };
  } catch (
    error
  ) {
    console.error(
      '[Public projects] Unable to load projects:',
      error,
    );

    return {
      items:
        [],

      pagination: {
        page:
          1,

        limit:
          10,

        total:
          0,

        totalPages:
          0,
      },
    };
  }
}