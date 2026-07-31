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

  desktopImageUrl:
    string;

  mobileImageUrl:
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

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
          next: {
            revalidate:
              60,
          },
        },
      );

    if (
      !response.ok
    ) {
      return [];
    }

    return await response
      .json() as
      PublicHomepageBrochure[];
  } catch {
    return [];
  }
}