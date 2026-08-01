import type {
  AppLocale,
} from '@/i18n/routing';

export type PublicHomepageBrochureCrop = {
  offsetX:
    number;

  offsetY:
    number;

  zoom:
    number;

  naturalWidth:
    number;

  naturalHeight:
    number;
};

export type PublicHomepageBrochure = {
  id:
    string;

  mediaType:
    'IMAGE' |
    'VIDEO';

  desktopMediaUrl:
    string;

  mobileMediaUrl:
    string;

  desktopImageCrop:
    PublicHomepageBrochureCrop | null;

  mobileImageCrop:
    PublicHomepageBrochureCrop | null;

  altText:
    string;

  linkUrl:
    string | null;

  linkTarget:
    '_self' |
    '_blank';
};

/*
 * Ce type représente les différentes formes que l’API
 * peut encore renvoyer pendant la transition :
 *
 * - nouveau contrat : desktopMediaUrl / mobileMediaUrl ;
 * - ancien contrat : desktopImageUrl / mobileImageUrl.
 */
type RawPublicHomepageBrochure = {
  id?:
    unknown;

  mediaType?:
    unknown;

  desktopMediaUrl?:
    unknown;

  mobileMediaUrl?:
    unknown;

  desktopImageUrl?:
    unknown;

  mobileImageUrl?:
    unknown;

  desktopImageCrop?:
    unknown;

  mobileImageCrop?:
    unknown;

  altText?:
    unknown;

  linkUrl?:
    unknown;

  linkTarget?:
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

function asCrop(
  value:
    unknown,
): PublicHomepageBrochureCrop | null {
  if (
    !value ||
    typeof value !==
    'object'
  ) {
    return null;
  }

  const candidate =
    value as
      Record<
        string,
        unknown
      >;

  const offsetX =
    Number(
      candidate.offsetX,
    );

  const offsetY =
    Number(
      candidate.offsetY,
    );

  const zoom =
    Number(
      candidate.zoom,
    );

  const naturalWidth =
    Number(
      candidate.naturalWidth,
    );

  const naturalHeight =
    Number(
      candidate.naturalHeight,
    );

  if (
    !Number.isFinite(
      offsetX,
    ) ||
    !Number.isFinite(
      offsetY,
    ) ||
    !Number.isFinite(
      zoom,
    ) ||
    !Number.isFinite(
      naturalWidth,
    ) ||
    !Number.isFinite(
      naturalHeight,
    )
  ) {
    return null;
  }

  return {
    offsetX,

    offsetY,

    zoom,

    naturalWidth,

    naturalHeight,
  };
}

function normalizeBrochure(
  rawBrochure:
    RawPublicHomepageBrochure,
): PublicHomepageBrochure | null {
  const id =
    asNonEmptyString(
      rawBrochure.id,
    );

  /*
   * Priorité au nouveau contrat.
   *
   * Les anciens champs image sont conservés uniquement
   * comme compatibilité temporaire pendant le redémarrage
   * et le déploiement du backend.
   */
  const desktopMediaUrl =
    asNonEmptyString(
      rawBrochure
        .desktopMediaUrl,
    ) ??
    asNonEmptyString(
      rawBrochure
        .desktopImageUrl,
    );

  const mobileMediaUrl =
    asNonEmptyString(
      rawBrochure
        .mobileMediaUrl,
    ) ??
    asNonEmptyString(
      rawBrochure
        .mobileImageUrl,
    ) ??
    desktopMediaUrl;

  if (
    !id ||
    !desktopMediaUrl ||
    !mobileMediaUrl
  ) {
    return null;
  }

  const mediaType =
    rawBrochure.mediaType ===
    'VIDEO'
      ? 'VIDEO'
      : 'IMAGE';

  return {
    id,

    mediaType,

    desktopMediaUrl,

    mobileMediaUrl,

    desktopImageCrop:
      mediaType ===
      'IMAGE'
        ? asCrop(
            rawBrochure
              .desktopImageCrop,
          )
        : null,

    mobileImageCrop:
      mediaType ===
      'IMAGE'
        ? asCrop(
            rawBrochure
              .mobileImageCrop,
          )
        : null,

    altText:
      asNonEmptyString(
        rawBrochure.altText,
      ) ??
      'Brochure Axplify Services',

    linkUrl:
      asNonEmptyString(
        rawBrochure.linkUrl,
      ),

    linkTarget:
      rawBrochure.linkTarget ===
      '_blank'
        ? '_blank'
        : '_self',
  };
}

export async function getPublicHomepageBrochures(
  locale:
    AppLocale,
): Promise<
  PublicHomepageBrochure[]
> {
  try {
    const response =
      await fetch(
        `${API_URL}/homepage-brochures?locale=${locale}`,
        {
          /*
           * Une brochure ajoutée ou modifiée depuis
           * l’administration doit être visible immédiatement.
           *
           * Le précédent revalidate de 60 secondes pouvait
           * conserver l’ancien contrat de réponse et provoquer
           * des images sans src.
           */
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
        '[Homepage brochures] API error:',
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
        '[Homepage brochures] Invalid API response: expected an array.',
      );

      return [];
    }

    return responseBody
      .map(
        item =>
          normalizeBrochure(
            item as
              RawPublicHomepageBrochure,
          ),
      )
      .filter(
        (
          brochure,
        ): brochure is
          PublicHomepageBrochure =>
            brochure !==
            null,
      );
  } catch (
    error
  ) {
    console.error(
      '[Homepage brochures] Unable to load brochures:',
      error,
    );

    return [];
  }
}