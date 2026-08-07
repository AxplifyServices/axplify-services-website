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
  FAQ_LOCALES,
  FAQ_PUBLIC_FALLBACK_LOCALE,
} from './faq.constants';

import type {
  FaqLocale,
} from './faq.constants';

import {
  AdminFaqQueryDto,
} from './dto/admin-faq-query.dto';

import {
  CreateFaqDto,
} from './dto/create-faq.dto';

import {
  PublicFaqQueryDto,
} from './dto/public-faq-query.dto';

import {
  UpdateFaqDto,
} from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private validateTranslations(
    translations:
      CreateFaqDto['translations'],
  ) {
    const locales =
      translations.map(
        translation =>
          translation.locale,
      );

    const uniqueLocales =
      new Set(
        locales,
      );

    if (
      uniqueLocales.size !==
      locales.length
    ) {
      throw new BadRequestException(
        'Une seule traduction est autorisée par langue.',
      );
    }

    const missingLocales =
      FAQ_LOCALES.filter(
        locale =>
          !uniqueLocales.has(
            locale,
          ),
      );

    if (
      missingLocales.length >
      0
    ) {
      throw new BadRequestException(
        `Les traductions suivantes sont obligatoires : ${missingLocales.join(
          ', ',
        )}.`,
      );
    }
  }

  private mapAdminItem(
    item: {
      id:
        string;

      category_code:
        string;

      sort_order:
        number;

      is_visible:
        boolean;

      created_at:
        Date;

      updated_at:
        Date;

      faq_item_translations:
        Array<{
          locale:
            string;

          question:
            string;

          answer:
            string;
        }>;
    },
  ) {
    return {
      id:
        item.id,

      categoryCode:
        item.category_code,

      sortOrder:
        item.sort_order,

      isVisible:
        item.is_visible,

      createdAt:
        item.created_at,

      updatedAt:
        item.updated_at,

      translations:
        item.faq_item_translations.map(
          translation => ({
            locale:
              translation.locale,

            question:
              translation.question,

            answer:
              translation.answer,
          }),
        ),
    };
  }

  async findAllAdmin(
    query:
      AdminFaqQueryDto,
  ) {
    const search =
      query.search?.trim();

    const visibility =
      query.visibility ??
      'all';

    const items =
      await this.prisma
        .faq_items
        .findMany({
          where: {
            ...(query.categoryCode
              ? {
                  category_code:
                    query.categoryCode,
                }
              : {}),

            ...(visibility ===
            'visible'
              ? {
                  is_visible:
                    true,
                }
              : visibility ===
                  'hidden'
                ? {
                    is_visible:
                      false,
                  }
                : {}),

            ...(search
              ? {
                  faq_item_translations: {
                    some: {
                      OR: [
                        {
                          question: {
                            contains:
                              search,

                            mode:
                              'insensitive',
                          },
                        },

                        {
                          answer: {
                            contains:
                              search,

                            mode:
                              'insensitive',
                          },
                        },
                      ],
                    },
                  },
                }
              : {}),
          },

          include: {
            faq_item_translations: {
              orderBy: {
                locale:
                  'asc',
              },
            },
          },

          orderBy: [
            {
              category_code:
                'asc',
            },

            {
              sort_order:
                'asc',
            },

            {
              updated_at:
                'desc',
            },
          ],
        });

    return items.map(
      item =>
        this.mapAdminItem(
          item,
        ),
    );
  }

  async findOneAdmin(
    id:
      string,
  ) {
    const item =
      await this.prisma
        .faq_items
        .findUnique({
          where: {
            id,
          },

          include: {
            faq_item_translations: {
              orderBy: {
                locale:
                  'asc',
              },
            },
          },
        });

    if (
      !item
    ) {
      throw new NotFoundException(
        'Question FAQ introuvable.',
      );
    }

    return this.mapAdminItem(
      item,
    );
  }

  async create(
    dto:
      CreateFaqDto,

    currentUser:
      AuthenticatedUser,
  ) {
    this.validateTranslations(
      dto.translations,
    );

    const item =
      await this.prisma
        .$transaction(
          async transaction => {
            const createdItem =
              await transaction
                .faq_items
                .create({
                  data: {
                    category_code:
                      dto.categoryCode,

                    sort_order:
                      dto.sortOrder ??
                      0,

                    is_visible:
                      dto.isVisible ??
                      false,

                    created_by_user_id:
                      currentUser.id,

                    updated_by_user_id:
                      currentUser.id,
                  },
                });

            await transaction
              .faq_item_translations
              .createMany({
                data:
                  dto.translations.map(
                    translation => ({
                      faq_item_id:
                        createdItem.id,

                      locale:
                        translation.locale,

                      question:
                        translation.question.trim(),

                      answer:
                        translation.answer.trim(),
                    }),
                  ),
              });

            return transaction
              .faq_items
              .findUniqueOrThrow({
                where: {
                  id:
                    createdItem.id,
                },

                include: {
                  faq_item_translations:
                    true,
                },
              });
          },
        );

    return this.mapAdminItem(
      item,
    );
  }

  async update(
    id:
      string,

    dto:
      UpdateFaqDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingItem =
      await this.prisma
        .faq_items
        .findUnique({
          where: {
            id,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !existingItem
    ) {
      throw new NotFoundException(
        'Question FAQ introuvable.',
      );
    }

    if (
      dto.translations
    ) {
      this.validateTranslations(
        dto.translations,
      );
    }

    const item =
      await this.prisma
        .$transaction(
          async transaction => {
            await transaction
              .faq_items
              .update({
                where: {
                  id,
                },

                data: {
                  ...(dto.categoryCode
                    ? {
                        category_code:
                          dto.categoryCode,
                      }
                    : {}),

                  ...(dto.sortOrder !==
                  undefined
                    ? {
                        sort_order:
                          dto.sortOrder,
                      }
                    : {}),

                  ...(dto.isVisible !==
                  undefined
                    ? {
                        is_visible:
                          dto.isVisible,
                      }
                    : {}),

                  updated_by_user_id:
                    currentUser.id,

                  updated_at:
                    new Date(),
                },
              });

            if (
              dto.translations
            ) {
              for (
                const translation
                of dto.translations
              ) {
                await transaction
                  .faq_item_translations
                  .upsert({
                    where: {
                      faq_item_id_locale: {
                        faq_item_id:
                          id,

                        locale:
                          translation.locale,
                      },
                    },

                    create: {
                      faq_item_id:
                        id,

                      locale:
                        translation.locale,

                      question:
                        translation.question.trim(),

                      answer:
                        translation.answer.trim(),
                    },

                    update: {
                      question:
                        translation.question.trim(),

                      answer:
                        translation.answer.trim(),

                      updated_at:
                        new Date(),
                    },
                  });
              }
            }

            return transaction
              .faq_items
              .findUniqueOrThrow({
                where: {
                  id,
                },

                include: {
                  faq_item_translations:
                    true,
                },
              });
          },
        );

    return this.mapAdminItem(
      item,
    );
  }

  async updateVisibility(
    id:
      string,

    isVisible:
      boolean,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingItem =
      await this.prisma
        .faq_items
        .findUnique({
          where: {
            id,
          },

          select: {
            id:
              true,

            faq_item_translations: {
              select: {
                locale:
                  true,
              },
            },
          },
        });

    if (
      !existingItem
    ) {
      throw new NotFoundException(
        'Question FAQ introuvable.',
      );
    }

    if (
      isVisible
    ) {
      const availableLocales =
        new Set(
          existingItem
            .faq_item_translations
            .map(
              translation =>
                translation.locale,
            ),
        );

      const missingLocales =
        FAQ_LOCALES.filter(
          locale =>
            !availableLocales.has(
              locale,
            ),
        );

      if (
        missingLocales.length >
        0
      ) {
        throw new BadRequestException(
          'La question doit être traduite en français, anglais et arabe avant sa publication.',
        );
      }
    }

    const item =
      await this.prisma
        .faq_items
        .update({
          where: {
            id,
          },

          data: {
            is_visible:
              isVisible,

            updated_by_user_id:
              currentUser.id,

            updated_at:
              new Date(),
          },

          include: {
            faq_item_translations:
              true,
          },
        });

    return this.mapAdminItem(
      item,
    );
  }

  async remove(
    id:
      string,
  ) {
    const existingItem =
      await this.prisma
        .faq_items
        .findUnique({
          where: {
            id,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !existingItem
    ) {
      throw new NotFoundException(
        'Question FAQ introuvable.',
      );
    }

    await this.prisma
      .faq_items
      .delete({
        where: {
          id,
        },
      });

    return {
      success:
        true,
    };
  }

  async findAllPublic(
    query:
      PublicFaqQueryDto,
  ) {
    const locale:
      FaqLocale =
      query.locale ??
      'fr';

    const items =
      await this.prisma
        .faq_items
        .findMany({
          where: {
            is_visible:
              true,

            ...(query.categoryCode
              ? {
                  category_code:
                    query.categoryCode,
                }
              : {}),
          },

          include: {
            faq_item_translations: {
              where: {
                locale: {
                  in:
                    FAQ_PUBLIC_FALLBACK_LOCALE[
                      locale
                    ],
                },
              },
            },
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

    return items.flatMap(
      item => {
        const translation =
          FAQ_PUBLIC_FALLBACK_LOCALE[
            locale
          ]
            .map(
              fallbackLocale =>
                item
                  .faq_item_translations
                  .find(
                    candidate =>
                      candidate.locale ===
                      fallbackLocale,
                  ),
            )
            .find(
              Boolean,
            );

        if (
          !translation
        ) {
          return [];
        }

        return [
          {
            id:
              item.id,

            categoryCode:
              item.category_code,

            sortOrder:
              item.sort_order,

            locale:
              translation.locale,

            question:
              translation.question,

            answer:
              translation.answer,
          },
        ];
      },
    );
  }
}