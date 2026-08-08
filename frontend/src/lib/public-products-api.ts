import type {
  AppLocale,
} from '@/i18n/routing';

export type PublicProductImage = {
  id: string;

  imageUrl: string;

  sortOrder: number;

  width:
    number | null;

  height:
    number | null;

  altText: string;
};

export type PublicProduct = {
  id: string;

  linkUrl: string;

  name: string;

  title: string;

  description: string;

  category: string;

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

async function getProducts(
  endpoint:
    string,

  locale:
    AppLocale,
) {
  try {
    const parameters =
      new URLSearchParams({
        locale,
      });

    const response =
      await fetch(
        `${API_URL}${endpoint}?${parameters.toString()}`,
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

    if (
      !Array.isArray(
        payload,
      )
    ) {
      return [];
    }

    return payload
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
  } catch {
    return [];
  }
}

export function getPublicProducts(
  locale:
    AppLocale,
):
  Promise<
    PublicProduct[]
  >
{
  return getProducts(
    '/products/public',
    locale,
  );
}

export function getFeaturedProducts(
  locale:
    AppLocale,
):
  Promise<
    PublicProduct[]
  >
{
  return getProducts(
    '/products/public/featured',
    locale,
  );
}