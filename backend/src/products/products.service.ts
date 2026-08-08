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
  AdminProductQueryDto,
} from './dto/admin-product-query.dto';

import {
  CreateProductDto,
} from './dto/create-product.dto';

import {
  PublicProductQueryDto,
} from './dto/public-product-query.dto';

import {
  UpdateProductDto,
} from './dto/update-product.dto';

import {
  PRODUCT_LOCALE_FALLBACKS,
} from './product.constants';

import type {
  ProductLocale,
} from './product.constants';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private validateLinkUrl(
    linkUrl: string,
  ) {
    const value =
      linkUrl.trim();

    /*
     * Lien interne Axplify.
     *
     * /fr/...
     * /nous-contacter
     *
     * On refuse //domain.com afin d'éviter
     * les URL protocol-relative.
     */
    if (
      value.startsWith('/') &&
      !value.startsWith('//')
    ) {
      return value;
    }

    let parsedUrl: URL;

    try {
      parsedUrl =
        new URL(
          value,
        );
    } catch {
      throw new BadRequestException(
        'Le lien du produit doit être une URL http(s) valide ou un chemin interne commençant par /.',
      );
    }

    /*
     * Empêche notamment :
     *
     * javascript:
     * data:
     * file:
     */
    if (
      parsedUrl.protocol !==
        'http:' &&
      parsedUrl.protocol !==
        'https:'
    ) {
      throw new BadRequestException(
        'Le lien du produit doit utiliser http ou https.',
      );
    }

    return value;
  }

  private validateTranslations(
    translations:
      CreateProductDto['translations'],
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

    const requiredLocales:
      ProductLocale[] = [
        'fr',
        'en',
      ];

    const missingLocales =
      requiredLocales.filter(
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
        `Les traductions suivantes sont obligatoires : ${missingLocales.join(', ')}.`,
      );
    }
  }

  private mapAdminProduct(
    product: {
      id: string;
      link_url: string;
      is_active: boolean;
      sort_order: number;
      show_on_homepage: boolean;
      homepage_sort_order: number;
      created_at: Date;
      updated_at: Date;

      product_translations: Array<{
        locale: string;
        name: string;
        title: string;
        description: string;
        category: string;
      }>;
    },
  ) {
    return {
      id:
        product.id,

      linkUrl:
        product.link_url,

      isActive:
        product.is_active,

      sortOrder:
        product.sort_order,

      showOnHomepage:
        product.show_on_homepage,

      homepageSortOrder:
        product.homepage_sort_order,

      createdAt:
        product.created_at,

      updatedAt:
        product.updated_at,

      translations:
        product
          .product_translations
          .map(
            translation => ({
              locale:
                translation.locale,

              name:
                translation.name,

              title:
                translation.title,

              description:
                translation.description,

              category:
                translation.category,
            }),
          ),
    };
  }

  private resolveTranslation(
    translations: Array<{
      locale: string;
      name: string;
      title: string;
      description: string;
      category: string;
    }>,

    requestedLocale:
      ProductLocale,
  ) {
    const fallbackLocales =
      PRODUCT_LOCALE_FALLBACKS[
        requestedLocale
      ];

    for (
      const locale
      of fallbackLocales
    ) {
      const translation =
        translations.find(
          item =>
            item.locale ===
            locale,
        );

      if (
        translation
      ) {
        return {
          translation,
          resolvedLocale:
            locale,
        };
      }
    }

    return null;
  }

  private mapPublicProduct(
    product: {
      id: string;
      link_url: string;
      sort_order: number;
      show_on_homepage: boolean;
      homepage_sort_order: number;
      updated_at: Date;

      product_translations: Array<{
        locale: string;
        name: string;
        title: string;
        description: string;
        category: string;
      }>;
    },

    requestedLocale:
      ProductLocale,
  ) {
    const resolved =
      this.resolveTranslation(
        product.product_translations,
        requestedLocale,
      );

    if (
      !resolved
    ) {
      return null;
    }

    return {
      id:
        product.id,

      linkUrl:
        product.link_url,

      name:
        resolved.translation.name,

      title:
        resolved.translation.title,

      description:
        resolved.translation.description,

      category:
        resolved.translation.category,

      requestedLocale,

      resolvedLocale:
        resolved.resolvedLocale,

      isFallback:
        resolved.resolvedLocale !==
        requestedLocale,

      sortOrder:
        product.sort_order,

      showOnHomepage:
        product.show_on_homepage,

      homepageSortOrder:
        product.homepage_sort_order,

      updatedAt:
        product.updated_at,
    };
  }

  async findAllAdmin(
    query:
      AdminProductQueryDto,
  ) {
    const search =
      query.search?.trim();

    const activity =
      query.activity ??
      'all';

    const homepage =
      query.homepage ??
      'all';

    const products =
      await this.prisma
        .products
        .findMany({
          where: {
            deleted_at:
              null,

            ...(activity ===
            'active'
              ? {
                  is_active:
                    true,
                }
              : activity ===
                  'inactive'
                ? {
                    is_active:
                      false,
                  }
                : {}),

            ...(homepage ===
            'homepage'
              ? {
                  show_on_homepage:
                    true,
                }
              : homepage ===
                  'catalogOnly'
                ? {
                    show_on_homepage:
                      false,
                  }
                : {}),

            ...(search
              ? {
                  OR: [
                    {
                      link_url: {
                        contains:
                          search,

                        mode:
                          'insensitive',
                      },
                    },

                    {
                      product_translations: {
                        some: {
                          OR: [
                            {
                              name: {
                                contains:
                                  search,

                                mode:
                                  'insensitive',
                              },
                            },

                            {
                              title: {
                                contains:
                                  search,

                                mode:
                                  'insensitive',
                              },
                            },

                            {
                              description: {
                                contains:
                                  search,

                                mode:
                                  'insensitive',
                              },
                            },

                            {
                              category: {
                                contains:
                                  search,

                                mode:
                                  'insensitive',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                }
              : {}),
          },

          include: {
            product_translations: {
              orderBy: {
                locale:
                  'asc',
              },
            },
          },

          orderBy: [
            {
              show_on_homepage:
                'desc',
            },

            {
              homepage_sort_order:
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

    return products.map(
      product =>
        this.mapAdminProduct(
          product,
        ),
    );
  }

  async findOneAdmin(
    id: string,
  ) {
    const product =
      await this.prisma
        .products
        .findFirst({
          where: {
            id,

            deleted_at:
              null,
          },

          include: {
            product_translations: {
              orderBy: {
                locale:
                  'asc',
              },
            },
          },
        });

    if (
      !product
    ) {
      throw new NotFoundException(
        'Produit introuvable.',
      );
    }

    return this.mapAdminProduct(
      product,
    );
  }

  async findAllPublic(
    query:
      PublicProductQueryDto,
  ) {
    const requestedLocale =
      query.locale ??
      'fr';

    const products =
      await this.prisma
        .products
        .findMany({
          where: {
            is_active:
              true,

            deleted_at:
              null,
          },

          include: {
            product_translations:
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

    return products
      .map(
        product =>
          this.mapPublicProduct(
            product,
            requestedLocale,
          ),
      )
      .filter(
        product =>
          product !== null,
      );
  }

  async findFeaturedPublic(
    query:
      PublicProductQueryDto,
  ) {
    const requestedLocale =
      query.locale ??
      'fr';

    const products =
      await this.prisma
        .products
        .findMany({
          where: {
            is_active:
              true,

            show_on_homepage:
              true,

            deleted_at:
              null,
          },

          include: {
            product_translations:
              true,
          },

          orderBy: [
            {
              homepage_sort_order:
                'asc',
            },

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

    return products
      .map(
        product =>
          this.mapPublicProduct(
            product,
            requestedLocale,
          ),
      )
      .filter(
        product =>
          product !== null,
      );
  }

  async create(
    dto:
      CreateProductDto,

    currentUser:
      AuthenticatedUser,
  ) {
    this.validateTranslations(
      dto.translations,
    );

    const linkUrl =
      this.validateLinkUrl(
        dto.linkUrl,
      );

    const product =
      await this.prisma
        .$transaction(
          async transaction => {
            const createdProduct =
              await transaction
                .products
                .create({
                  data: {
                    link_url:
                      linkUrl,

                    is_active:
                      dto.isActive ??
                      true,

                    sort_order:
                      dto.sortOrder ??
                      0,

                    show_on_homepage:
                      dto.showOnHomepage ??
                      false,

                    homepage_sort_order:
                      dto.homepageSortOrder ??
                      0,

                    created_by_user_id:
                      currentUser.id,

                    updated_by_user_id:
                      currentUser.id,
                  },
                });

            await transaction
              .product_translations
              .createMany({
                data:
                  dto.translations.map(
                    translation => ({
                      product_id:
                        createdProduct.id,

                      locale:
                        translation.locale,

                      name:
                        translation.name.trim(),

                      title:
                        translation.title.trim(),

                      description:
                        translation.description.trim(),

                      category:
                        translation.category.trim(),
                    }),
                  ),
              });

            return transaction
              .products
              .findUniqueOrThrow({
                where: {
                  id:
                    createdProduct.id,
                },

                include: {
                  product_translations: {
                    orderBy: {
                      locale:
                        'asc',
                    },
                  },
                },
              });
          },
        );

    return this.mapAdminProduct(
      product,
    );
  }

  async update(
    id: string,

    dto:
      UpdateProductDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingProduct =
      await this.prisma
        .products
        .findFirst({
          where: {
            id,

            deleted_at:
              null,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !existingProduct
    ) {
      throw new NotFoundException(
        'Produit introuvable.',
      );
    }

    if (
      dto.translations
    ) {
      this.validateTranslations(
        dto.translations,
      );
    }

    const linkUrl =
      dto.linkUrl !==
      undefined
        ? this.validateLinkUrl(
            dto.linkUrl,
          )
        : undefined;

    const product =
      await this.prisma
        .$transaction(
          async transaction => {
            await transaction
              .products
              .update({
                where: {
                  id,
                },

                data: {
                  ...(linkUrl !==
                  undefined
                    ? {
                        link_url:
                          linkUrl,
                      }
                    : {}),

                  ...(dto.isActive !==
                  undefined
                    ? {
                        is_active:
                          dto.isActive,
                      }
                    : {}),

                  ...(dto.sortOrder !==
                  undefined
                    ? {
                        sort_order:
                          dto.sortOrder,
                      }
                    : {}),

                  ...(dto.showOnHomepage !==
                  undefined
                    ? {
                        show_on_homepage:
                          dto.showOnHomepage,
                      }
                    : {}),

                  ...(dto.homepageSortOrder !==
                  undefined
                    ? {
                        homepage_sort_order:
                          dto.homepageSortOrder,
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
              const receivedLocales =
                dto.translations.map(
                  translation =>
                    translation.locale,
                );

              /*
               * L'arabe est facultatif.
               * S'il est retiré depuis l'éditeur,
               * la traduction AR existante est supprimée
               * et le fallback anglais reprendra la main.
               */
              await transaction
                .product_translations
                .deleteMany({
                  where: {
                    product_id:
                      id,

                    locale: {
                      notIn:
                        receivedLocales,
                    },
                  },
                });

              for (
                const translation
                of dto.translations
              ) {
                await transaction
                  .product_translations
                  .upsert({
                    where: {
                      product_id_locale: {
                        product_id:
                          id,

                        locale:
                          translation.locale,
                      },
                    },

                    create: {
                      product_id:
                        id,

                      locale:
                        translation.locale,

                      name:
                        translation.name.trim(),

                      title:
                        translation.title.trim(),

                      description:
                        translation.description.trim(),

                      category:
                        translation.category.trim(),
                    },

                    update: {
                      name:
                        translation.name.trim(),

                      title:
                        translation.title.trim(),

                      description:
                        translation.description.trim(),

                      category:
                        translation.category.trim(),

                      updated_at:
                        new Date(),
                    },
                  });
              }
            }

            return transaction
              .products
              .findUniqueOrThrow({
                where: {
                  id,
                },

                include: {
                  product_translations: {
                    orderBy: {
                      locale:
                        'asc',
                    },
                  },
                },
              });
          },
        );

    return this.mapAdminProduct(
      product,
    );
  }

  async remove(
    id: string,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingProduct =
      await this.prisma
        .products
        .findFirst({
          where: {
            id,

            deleted_at:
              null,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !existingProduct
    ) {
      throw new NotFoundException(
        'Produit introuvable.',
      );
    }

    await this.prisma
      .products
      .update({
        where: {
          id,
        },

        data: {
          is_active:
            false,

          show_on_homepage:
            false,

          updated_by_user_id:
            currentUser.id,

          updated_at:
            new Date(),

          deleted_at:
            new Date(),
        },
      });

    return {
      success:
        true,
    };
  }
}