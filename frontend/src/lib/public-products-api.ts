import type {
  AppLocale,
} from '@/i18n/routing';

export type PublicProductImage = {
  id:
    string;

  imageUrl:
    string;

  sortOrder:
    number;

  width:
    number | null;

  height:
    number | null;

  altText:
    string;
};

export type PublicProduct = {
  id:
    string;

  linkUrl:
    string;

  name:
    string;

  title:
    string;

  description:
    string;

  category:
    string;

  images:
    PublicProductImage[];

  requestedLocale:
    AppLocale;

  resolvedLocale:
    AppLocale;

  isFallback:
    boolean;

  sortOrder:
    number;

  showOnHomepage:
    boolean;

  homepageSortOrder:
    number;

  updatedAt:
    string;
};

export type PublicProductsPagination = {
  page:
    number;

  limit:
    number;

  total:
    number;

  totalPages:
    number;
};

export type PublicProductsResponse = {
  items:
    PublicProduct[];

  categories:
    string[];

  pagination:
    PublicProductsPagination;
};

type GetPublicProductsOptions = {
  locale:
    AppLocale;

  page?:
    number;

  limit?:
    number;

  category?:
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

function asNullableNumber(
  value:
    unknown,
):
  number | null
{
  return typeof value ===
      'number' &&
    Number.isFinite(
      value,
    )
    ? value
    : null;
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

function normalizeProductImage(
  value:
    unknown,
):
  PublicProductImage | null
{
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const image =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      image.id,
    );

  const imageUrl =
    asString(
      image.imageUrl,
    );

  if (
    !id ||
    !imageUrl
  ) {
    return null;
  }

  return {
    id,

    imageUrl,

    sortOrder:
      asNumber(
        image.sortOrder,
      ),

    width:
      asNullableNumber(
        image.width,
      ),

    height:
      asNullableNumber(
        image.height,
      ),

    altText:
      asString(
        image.altText,
      ),
  };
}

function normalizeProduct(
  value:
    unknown,
):
  PublicProduct | null
{
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const product =
    value as Record<
      string,
      unknown
    >;

  const id =
    asString(
      product.id,
    );

  const linkUrl =
    asString(
      product.linkUrl,
    );

  const name =
    asString(
      product.name,
    );

  const title =
    asString(
      product.title,
    );

  const description =
    asString(
      product.description,
    );

  const category =
    asString(
      product.category,
    );

  if (
    !id ||
    !linkUrl ||
    !name ||
    !title ||
    !description ||
    !category
  ) {
    return null;
  }

  const images =
    Array.isArray(
      product.images,
    )
      ? product.images
          .map(
            normalizeProductImage,
          )
          .filter(
            (
              image,
            ): image is PublicProductImage =>
              image !==
              null,
          )
          .sort(
            (
              left,
              right,
            ) =>
              left.sortOrder -
              right.sortOrder,
          )
          .slice(
            0,
            5,
          )
      : [];

  return {
    id,

    linkUrl,

    name,

    title,

    description,

    category,

    images,

    requestedLocale:
      asLocale(
        product.requestedLocale,
      ),

    resolvedLocale:
      asLocale(
        product.resolvedLocale,
      ),

    isFallback:
      product.isFallback ===
      true,

    sortOrder:
      asNumber(
        product.sortOrder,
      ),

    showOnHomepage:
      product.showOnHomepage ===
      true,

    homepageSortOrder:
      asNumber(
        product.homepageSortOrder,
      ),

    updatedAt:
      asString(
        product.updatedAt,
      ),
  };
}

function normalizeProductArray(
  value:
    unknown,
) {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .map(
      normalizeProduct,
    )
    .filter(
      (
        product,
      ): product is PublicProduct =>
        product !==
        null,
    );
}

function normalizePagination(
  value:
    unknown,
):
  PublicProductsPagination
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
      Math.max(
        1,
        asNumber(
          pagination.limit,
        ) ||
          10,
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

export async function getPublicProducts({
  locale,
  page = 1,
  limit = 10,
  category,
}: GetPublicProductsOptions):
  Promise<
    PublicProductsResponse
  >
{
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
            Math.min(
              10,
              Math.max(
                1,
                limit,
              ),
            ),
          ),
      });

    const normalizedCategory =
      category?.trim();

    if (
      normalizedCategory
    ) {
      parameters.set(
        'category',
        normalizedCategory,
      );
    }

    const response =
      await fetch(
        `${API_URL}/products/public?${parameters.toString()}`,
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
      return {
        items:
          [],

        categories:
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

    const payload =
      await response.json() as
        unknown;

    if (
      !payload ||
      typeof payload !==
        'object'
    ) {
      return {
        items:
          [],

        categories:
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
      payload as Record<
        string,
        unknown
      >;

    const categories =
      Array.isArray(
        data.categories,
      )
        ? data.categories
            .map(
              asString,
            )
            .filter(
              Boolean,
            )
        : [];

    return {
      items:
        normalizeProductArray(
          data.items,
        ),

      categories,

      pagination:
        normalizePagination(
          data.pagination,
        ),
    };
  } catch {
    return {
      items:
        [],

      categories:
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

/*
 * IMPORTANT :
 *
 * Cet endpoint reste volontairement distinct de
 * getPublicProducts().
 *
 * Il est utilisé par la home et ne doit pas être
 * limité par la pagination du catalogue.
 */
export async function getFeaturedProducts(
  locale:
    AppLocale,
):
  Promise<
    PublicProduct[]
  >
{
  try {
    const parameters =
      new URLSearchParams({
        locale,
      });

    const response =
      await fetch(
        `${API_URL}/products/public/featured?${parameters.toString()}`,
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
        unknown;

    return normalizeProductArray(
      payload,
    );
  } catch {
    return [];
  }
}