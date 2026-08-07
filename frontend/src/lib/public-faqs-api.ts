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

  const sortOrder =
    typeof rawFaq.sortOrder ===
      'number'
      ? rawFaq.sortOrder
      : 0;

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
    sortOrder,
    locale,
    question,
    answer,
  };
}

export async function getPublicFaqs(
  locale:
    AppLocale,
): Promise<
  PublicFaqItem[]
> {
  try {
    const parameters =
      new URLSearchParams({
        locale,
      });

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

      return [];
    }

    const responseBody =
      await response.json() as
        unknown;

    if (
      !Array.isArray(
        responseBody,
      )
    ) {
      console.error(
        '[Public FAQ] Invalid API response.',
      );

      return [];
    }

    return responseBody
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
      .sort(
        (
          first,
          second,
        ) =>
          first.sortOrder -
          second.sortOrder,
      );
  } catch (
    error
  ) {
    console.error(
      '[Public FAQ] Unable to load FAQ:',
      error,
    );

    return [];
  }
}