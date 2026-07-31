import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  StorageService,
} from '../storage/storage.service';

import {
  CreateHomepageBrochureDto,
} from './dto/create-homepage-brochure.dto';

import {
  ReorderHomepageBrochuresDto,
} from './dto/reorder-homepage-brochures.dto';

import {
  UpdateHomepageBrochureDto,
} from './dto/update-homepage-brochure.dto';

type PublicLocale =
  'fr' |
  'en' |
  'ar';

@Injectable()
export class HomepageBrochuresService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly storageService:
      StorageService,
  ) {}

  async findPublic(
    locale:
      PublicLocale,
  ) {
    const brochures =
      await this.prisma
        .homepage_brochures
        .findMany({
          where: {
            is_active:
              true,
          },

          orderBy: [
            {
              sort_order:
                'asc',
            },

            {
              created_at:
                'asc',
            },
          ],
        });

    return brochures
      .map(
        (
          brochure,
        ) =>
          this.mapPublicBrochure(
            brochure,
            locale,
          ),
      )
      .filter(
        (
          brochure,
        ) =>
          Boolean(
            brochure.desktopImageUrl,
          ),
      );
  }

  async findAllAdmin() {
    const brochures =
      await this.prisma
        .homepage_brochures
        .findMany({
          orderBy: [
            {
              sort_order:
                'asc',
            },

            {
              created_at:
                'asc',
            },
          ],
        });

    return brochures.map(
      (
        brochure,
      ) =>
        this.mapAdminBrochure(
          brochure,
        ),
    );
  }

  async findOneAdmin(
    id:
      string,
  ) {
    const brochure =
      await this.prisma
        .homepage_brochures
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !brochure
    ) {
      throw new NotFoundException(
        'Brochure introuvable.',
      );
    }

    return this.mapAdminBrochure(
      brochure,
    );
  }

  async create(
    dto:
      CreateHomepageBrochureDto,

    currentUser:
      AuthenticatedUser,
  ) {
    this.assertActiveBrochureHasDesktopImage(
      dto.isActive ??
        true,

      dto.desktopImageFrUrl,

      dto.desktopImageEnUrl,
    );

    const brochure =
      await this.prisma
        .homepage_brochures
        .create({
          data: {
            internal_name:
              dto.internalName.trim(),

            desktop_image_fr_url:
              dto.desktopImageFrUrl ??
              null,

            mobile_image_fr_url:
              dto.mobileImageFrUrl ??
              null,

            desktop_image_en_url:
              dto.desktopImageEnUrl ??
              null,

            mobile_image_en_url:
              dto.mobileImageEnUrl ??
              null,

            alt_text_fr:
              dto.altTextFr ??
              null,

            alt_text_en:
              dto.altTextEn ??
              null,

            link_url:
              dto.linkUrl ??
              null,

            link_target:
              dto.linkTarget ??
              '_self',

            sort_order:
              dto.sortOrder ??
              0,

            is_active:
              dto.isActive ??
              true,

            created_by_user_id:
              currentUser.id,
          },
        });

    return this.mapAdminBrochure(
      brochure,
    );
  }

  async update(
    id:
      string,

    dto:
      UpdateHomepageBrochureDto,
  ) {
    const currentBrochure =
      await this.prisma
        .homepage_brochures
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !currentBrochure
    ) {
      throw new NotFoundException(
        'Brochure introuvable.',
      );
    }

    const nextDesktopImageFrUrl =
      dto.desktopImageFrUrl !==
      undefined
        ? dto.desktopImageFrUrl
        : currentBrochure
            .desktop_image_fr_url;

    const nextDesktopImageEnUrl =
      dto.desktopImageEnUrl !==
      undefined
        ? dto.desktopImageEnUrl
        : currentBrochure
            .desktop_image_en_url;

    const nextIsActive =
      dto.isActive !==
      undefined
        ? dto.isActive
        : currentBrochure
            .is_active;

    this.assertActiveBrochureHasDesktopImage(
      nextIsActive,
      nextDesktopImageFrUrl ??
        undefined,
      nextDesktopImageEnUrl ??
        undefined,
    );

    const brochure =
      await this.prisma
        .homepage_brochures
        .update({
          where: {
            id,
          },

          data: {
            ...(dto.internalName !==
            undefined
              ? {
                  internal_name:
                    dto.internalName.trim(),
                }
              : {}),

            ...(dto.desktopImageFrUrl !==
            undefined
              ? {
                  desktop_image_fr_url:
                    dto.desktopImageFrUrl ??
                    null,
                }
              : {}),

            ...(dto.mobileImageFrUrl !==
            undefined
              ? {
                  mobile_image_fr_url:
                    dto.mobileImageFrUrl ??
                    null,
                }
              : {}),

            ...(dto.desktopImageEnUrl !==
            undefined
              ? {
                  desktop_image_en_url:
                    dto.desktopImageEnUrl ??
                    null,
                }
              : {}),

            ...(dto.mobileImageEnUrl !==
            undefined
              ? {
                  mobile_image_en_url:
                    dto.mobileImageEnUrl ??
                    null,
                }
              : {}),

            ...(dto.altTextFr !==
            undefined
              ? {
                  alt_text_fr:
                    dto.altTextFr ??
                    null,
                }
              : {}),

            ...(dto.altTextEn !==
            undefined
              ? {
                  alt_text_en:
                    dto.altTextEn ??
                    null,
                }
              : {}),

            ...(dto.linkUrl !==
            undefined
              ? {
                  link_url:
                    dto.linkUrl ??
                    null,
                }
              : {}),

            ...(dto.linkTarget !==
            undefined
              ? {
                  link_target:
                    dto.linkTarget,
                }
              : {}),

            ...(dto.sortOrder !==
            undefined
              ? {
                  sort_order:
                    dto.sortOrder,
                }
              : {}),

            ...(dto.isActive !==
            undefined
              ? {
                  is_active:
                    dto.isActive,
                }
              : {}),
          },
        });

    await this.deleteReplacedImages(
      currentBrochure,
      brochure,
    );

    return this.mapAdminBrochure(
      brochure,
    );
  }

  async reorder(
    dto:
      ReorderHomepageBrochuresDto,
  ) {
    const uniqueIds =
      new Set(
        dto.items.map(
          (
            item,
          ) =>
            item.id,
        ),
      );

    if (
      uniqueIds.size !==
      dto.items.length
    ) {
      throw new BadRequestException(
        'Une brochure apparaît plusieurs fois dans la réorganisation.',
      );
    }

    await this.prisma
      .$transaction(
        dto.items.map(
          (
            item,
          ) =>
            this.prisma
              .homepage_brochures
              .update({
                where: {
                  id:
                    item.id,
                },

                data: {
                  sort_order:
                    item.sortOrder,
                },
              }),
        ),
      );

    return this.findAllAdmin();
  }

  async remove(
    id:
      string,
  ) {
    const brochure =
      await this.prisma
        .homepage_brochures
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !brochure
    ) {
      throw new NotFoundException(
        'Brochure introuvable.',
      );
    }

    await this.prisma
      .homepage_brochures
      .delete({
        where: {
          id,
        },
      });

    await Promise.all([
      this.storageService
        .deletePublicFileByUrl(
          brochure
            .desktop_image_fr_url,
        ),

      this.storageService
        .deletePublicFileByUrl(
          brochure
            .mobile_image_fr_url,
        ),

      this.storageService
        .deletePublicFileByUrl(
          brochure
            .desktop_image_en_url,
        ),

      this.storageService
        .deletePublicFileByUrl(
          brochure
            .mobile_image_en_url,
        ),
    ]);

    return {
      success:
        true,
    };
  }

  private assertActiveBrochureHasDesktopImage(
    isActive:
      boolean,

    desktopImageFrUrl:
      string | undefined,

    desktopImageEnUrl:
      string | undefined,
  ) {
    if (
      isActive &&
      !desktopImageFrUrl &&
      !desktopImageEnUrl
    ) {
      throw new BadRequestException(
        'Une brochure active doit contenir au moins une image desktop en français ou en anglais.',
      );
    }
  }

  private mapPublicBrochure(
    brochure:
      {
        id: string;
        internal_name: string;
        desktop_image_fr_url: string | null;
        mobile_image_fr_url: string | null;
        desktop_image_en_url: string | null;
        mobile_image_en_url: string | null;
        alt_text_fr: string | null;
        alt_text_en: string | null;
        link_url: string | null;
        link_target: string;
      },

    locale:
      PublicLocale,
  ) {
    const usesEnglishPriority =
      locale ===
        'en' ||
      locale ===
        'ar';

    const desktopImageUrl =
      usesEnglishPriority
        ? brochure
            .desktop_image_en_url ??
          brochure
            .desktop_image_fr_url
        : brochure
            .desktop_image_fr_url ??
          brochure
            .desktop_image_en_url;

    const mobileImageUrl =
      usesEnglishPriority
        ? brochure
            .mobile_image_en_url ??
          brochure
            .desktop_image_en_url ??
          brochure
            .mobile_image_fr_url ??
          brochure
            .desktop_image_fr_url
        : brochure
            .mobile_image_fr_url ??
          brochure
            .desktop_image_fr_url ??
          brochure
            .mobile_image_en_url ??
          brochure
            .desktop_image_en_url;

    const altText =
      usesEnglishPriority
        ? brochure
            .alt_text_en ??
          brochure
            .alt_text_fr ??
          brochure
            .internal_name
        : brochure
            .alt_text_fr ??
          brochure
            .alt_text_en ??
          brochure
            .internal_name;

    return {
      id:
        brochure.id,

      desktopImageUrl,

      mobileImageUrl:
        mobileImageUrl ??
        desktopImageUrl,

      altText,

      linkUrl:
        brochure.link_url,

      linkTarget:
        brochure.link_target ===
        '_blank'
          ? '_blank'
          : '_self',
    };
  }

  private mapAdminBrochure(
    brochure:
      {
        id: string;
        internal_name: string;
        desktop_image_fr_url: string | null;
        mobile_image_fr_url: string | null;
        desktop_image_en_url: string | null;
        mobile_image_en_url: string | null;
        alt_text_fr: string | null;
        alt_text_en: string | null;
        link_url: string | null;
        link_target: string;
        sort_order: number;
        is_active: boolean;
        created_by_user_id: string | null;
        created_at: Date;
        updated_at: Date;
      },
  ) {
    return {
      id:
        brochure.id,

      internalName:
        brochure.internal_name,

      desktopImageFrUrl:
        brochure
          .desktop_image_fr_url,

      mobileImageFrUrl:
        brochure
          .mobile_image_fr_url,

      desktopImageEnUrl:
        brochure
          .desktop_image_en_url,

      mobileImageEnUrl:
        brochure
          .mobile_image_en_url,

      altTextFr:
        brochure.alt_text_fr,

      altTextEn:
        brochure.alt_text_en,

      linkUrl:
        brochure.link_url,

      linkTarget:
        brochure.link_target ===
        '_blank'
          ? '_blank'
          : '_self',

      sortOrder:
        brochure.sort_order,

      isActive:
        brochure.is_active,

      createdByUserId:
        brochure
          .created_by_user_id,

      createdAt:
        brochure
          .created_at
          .toISOString(),

      updatedAt:
        brochure
          .updated_at
          .toISOString(),
    };
  }

  private async deleteReplacedImages(
    previousBrochure:
      {
        desktop_image_fr_url: string | null;
        mobile_image_fr_url: string | null;
        desktop_image_en_url: string | null;
        mobile_image_en_url: string | null;
      },

    nextBrochure:
      {
        desktop_image_fr_url: string | null;
        mobile_image_fr_url: string | null;
        desktop_image_en_url: string | null;
        mobile_image_en_url: string | null;
      },
  ) {
    const previousUrls =
      [
        previousBrochure
          .desktop_image_fr_url,

        previousBrochure
          .mobile_image_fr_url,

        previousBrochure
          .desktop_image_en_url,

        previousBrochure
          .mobile_image_en_url,
      ].filter(
        (
          value,
        ):
          value is string =>
            Boolean(
              value,
            ),
      );

    const nextUrls =
      new Set(
        [
          nextBrochure
            .desktop_image_fr_url,

          nextBrochure
            .mobile_image_fr_url,

          nextBrochure
            .desktop_image_en_url,

          nextBrochure
            .mobile_image_en_url,
        ].filter(
          (
            value,
          ):
            value is string =>
              Boolean(
                value,
              ),
        ),
      );

    const replacedUrls =
      previousUrls.filter(
        (
          previousUrl,
        ) =>
          !nextUrls.has(
            previousUrl,
          ),
      );

    await Promise.all(
      replacedUrls.map(
        (
          replacedUrl,
        ) =>
          this.storageService
            .deletePublicFileByUrl(
              replacedUrl,
            ),
      ),
    );
  }
}