import type {
  AppLocale,
} from '@/i18n/routing';

export const FAQ_CATEGORY_CODES = [
  'OFFER',
  'METHODOLOGY',
  'PROTOTYPE',
  'DELIVERY',
  'BUDGET',
  'TECHNICAL',
  'SUPPORT',
  'GENERAL',
] as const;

export type PublicFaqCategoryCode =
  (typeof FAQ_CATEGORY_CODES)[number];

export type PublicFaqItem = {
  id:
    string;

  categoryCode:
    PublicFaqCategoryCode;

  sortOrder:
    number;

  locale:
    string;

  question:
    string;

  answer:
    string;
};

export type PublicFaqPagination = {
  page:
    number;

  limit:
    number;

  total:
    number;

  totalPages:
    number;
};

export type PublicFaqResponse = {
  items:
    PublicFaqItem[];

  availableCategories:
    PublicFaqCategoryCode[];

  pagination:
    PublicFaqPagination;
};

type GetPublicFaqsOptions = {
  locale:
    AppLocale;

  page?:
    number;

  limit?:
    number;

  categoryCode?:
    PublicFaqCategoryCode;

  search?:
    string;
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

function isCategoryCode(
  value:
    unknown,
): value is PublicFaqCategoryCode {
  return (
    typeof value ===
      'string' &&
    FAQ_CATEGORY_CODES.includes(
      value as PublicFaqCategoryCode,
    )
  );
}

function normalizeFaq(
  value:
    unknown,
): PublicFaqItem | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const rawFaq =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      rawFaq.id,
    );

  const categoryCode =
    rawFaq.categoryCode;

  const question =
    asString(
      rawFaq.question,
    );

  const answer =
    asString(
      rawFaq.answer,
    );

  const locale =
    asString(
      rawFaq.locale,
    );

  if (
    !id ||
    !isCategoryCode(
      categoryCode,
    ) ||
    !question ||
    !answer
  ) {
    return null;
  }

  return {
    id,

    categoryCode,

    sortOrder:
      asNumber(
        rawFaq.sortOrder,
      ),

    locale,

    question,

    answer,
  };
}

function normalizePagination(
  value:
    unknown,
):
  PublicFaqPagination
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
        25,

      total:
        0,

      totalPages:
        0,
    };
  }

  const pagination =
    value as Record<
      string,
      unknown
    >;

  return {
    page:
      Math.max(
        1,
        asNumber(
          pagination.page,
        ) ||
          1,
      ),

    limit:
      Math.min(
        25,
        Math.max(
          1,
          asNumber(
            pagination.limit,
          ) ||
            25,
        ),
      ),

    total:
      Math.max(
        0,
        asNumber(
          pagination.total,
        ),
      ),

    totalPages:
      Math.max(
        0,
        asNumber(
          pagination.totalPages,
        ),
      ),
  };
}

export async function getPublicFaqs({
  locale,
  page = 1,
  limit = 25,
  categoryCode,
  search,
}: GetPublicFaqsOptions):
  Promise<
    PublicFaqResponse
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
              25,
              Math.max(
                1,
                limit,
              ),
            ),
          ),
      });

    if (
      categoryCode
    ) {
      parameters.set(
        'categoryCode',
        categoryCode,
      );
    }

    const normalizedSearch =
      search?.trim();

    if (
      normalizedSearch
    ) {
      parameters.set(
        'search',
        normalizedSearch,
      );
    }

    const response =
      await fetch(
        `${API_URL}/faqs/public?${parameters.toString()}`,
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
        '[Public FAQ] API error:',
        response.status,
        response.statusText,
      );

      return {
        items:
          [],

        availableCategories:
          [],

        pagination: {
          page:
            1,

          limit:
            25,

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
      return {
        items:
          [],

        availableCategories:
          [],

        pagination: {
          page:
            1,

          limit:
            25,

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
              normalizeFaq,
            )
            .filter(
              (
                faq,
              ): faq is PublicFaqItem =>
                faq !==
                null,
            )
        : [];

    const availableCategories =
      Array.isArray(
        data.availableCategories,
      )
        ? data.availableCategories
            .filter(
              isCategoryCode,
            )
        : [];

    return {
      items,

      availableCategories,

      pagination:
        normalizePagination(
          data.pagination,
        ),
    };
  } catch (
    error
  ) {
    console.error(
      '[Public FAQ] Unable to load FAQ:',
      error,
    );

    return {
      items:
        [],

      availableCategories:
        [],

      pagination: {
        page:
          1,

        limit:
          25,

        total:
          0,

        totalPages:
          0,
      },
    };
  }
}