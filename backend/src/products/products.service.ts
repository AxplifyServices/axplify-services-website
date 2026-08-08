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

  /*
   * =========================================================
   * VALIDATIONS
   * =========================================================
   */

  private validateLinkUrl(
    linkUrl: string,
  ) {
    const value =
      linkUrl.trim();

    /*
     * Lien interne Axplify.
     *
     * Exemples :
     * /fr/...
     * /nous-contacter
     *
     * On refuse volontairement //domain.com
     * afin d'empêcher les URL protocol-relative.
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
     * Bloque notamment :
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

  private validateImages(
    images:
      CreateProductDto['images'],
  ) {
    if (
      !images
    ) {
      return;
    }

    if (
      images.length >
      5
    ) {
      throw new BadRequestException(
        'Un produit ne peut pas contenir plus de 5 images.',
      );
    }

    const urls =
      images.map(
        image =>
          image.imageUrl.trim(),
      );

    /*
     * La même image ne peut pas être enregistrée
     * plusieurs fois sur le même produit.
     */
    if (
      new Set(
        urls,
      ).size !==
      urls.length
    ) {
      throw new BadRequestException(
        'La même image ne peut pas être ajoutée plusieurs fois au produit.',
      );
    }

    images.forEach(
      (
        image,
        index,
      ) => {
        const imageUrl =
          image.imageUrl.trim();

        if (
          !imageUrl
        ) {
          throw new BadRequestException(
            `L’image ${index + 1} ne possède pas d’URL valide.`,
          );
        }

        /*
         * Les URL d'images sont normalement générées
         * par StorageService après upload MinIO.
         *
         * On vérifie tout de même qu'on ne reçoit pas
         * un protocole dangereux.
         */
        let parsedImageUrl:
          URL;

        try {
          parsedImageUrl =
            new URL(
              imageUrl,
            );
        } catch {
          throw new BadRequestException(
            `L’URL de l’image ${index + 1} est invalide.`,
          );
        }

        if (
          parsedImageUrl.protocol !==
            'http:' &&
          parsedImageUrl.protocol !==
            'https:'
        ) {
          throw new BadRequestException(
            `L’URL de l’image ${index + 1} doit utiliser http ou https.`,
          );
        }

        const locales =
          image.translations?.map(
            translation =>
              translation.locale,
          ) ??
          [];

        if (
          new Set(
            locales,
          ).size !==
          locales.length
        ) {
          throw new BadRequestException(
            `L’image ${index + 1} contient plusieurs textes alternatifs pour la même langue.`,
          );
        }
      },
    );
  }

  /*
   * =========================================================
   * TRANSLATIONS / FALLBACKS
   * =========================================================
   */

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

  private resolveImageAltText(
    translations: Array<{
      locale: string;
      alt_text: string | null;
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

      const altText =
        translation
          ?.alt_text
          ?.trim();

      if (
        altText
      ) {
        return altText;
      }
    }

    return null;
  }

  /*
   * =========================================================
   * MAPPERS
   * =========================================================
   */

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

      product_images: Array<{
        id: string;

        image_url: string;
        sort_order: number;

        width: number | null;
        height: number | null;

        product_image_translations: Array<{
          locale: string;
          alt_text: string | null;
        }>;
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

      images:
        product
          .product_images
          .map(
            image => ({
              id:
                image.id,

              imageUrl:
                image.image_url,

              sortOrder:
                image.sort_order,

              width:
                image.width,

              height:
                image.height,

              translations:
                image
                  .product_image_translations
                  .map(
                    translation => ({
                      locale:
                        translation.locale,

                      altText:
                        translation.alt_text,
                    }),
                  ),
            }),
          ),

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

      product_images: Array<{
        id: string;

        image_url: string;
        sort_order: number;

        width: number | null;
        height: number | null;

        product_image_translations: Array<{
          locale: string;
          alt_text: string | null;
        }>;
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

    const images =
      product
        .product_images
        .map(
          image => {
            const altText =
              this.resolveImageAltText(
                image.product_image_translations,
                requestedLocale,
              );

            return {
              id:
                image.id,

              imageUrl:
                image.image_url,

              sortOrder:
                image.sort_order,

              width:
                image.width,

              height:
                image.height,

              /*
               * Si aucun ALT spécifique n'existe,
               * le nom traduit du produit sert de fallback.
               */
              altText:
                altText ??
                resolved.translation.name,
            };
          },
        );

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

      images,

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

  /*
   * =========================================================
   * ADMIN READ
   * =========================================================
   */

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

            product_images: {
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

              include: {
                product_image_translations: {
                  orderBy: {
                    locale:
                      'asc',
                  },
                },
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

            product_images: {
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

              include: {
                product_image_translations: {
                  orderBy: {
                    locale:
                      'asc',
                  },
                },
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

  /*
   * =========================================================
   * PUBLIC READ
   * =========================================================
   */

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

            product_images: {
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

              include: {
                product_image_translations:
                  true,
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
          product !==
          null,
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

            product_images: {
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

              include: {
                product_image_translations:
                  true,
              },
            },
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
          product !==
          null,
      );
  }

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  async create(
    dto:
      CreateProductDto,

    currentUser:
      AuthenticatedUser,
  ) {
    this.validateTranslations(
      dto.translations,
    );

    this.validateImages(
      dto.images,
    );

    const linkUrl =
      this.validateLinkUrl(
        dto.linkUrl,
      );

    const product =
      await this.prisma
        .$transaction(
          async transaction => {
            /*
             * 1. Produit
             */
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

            /*
             * 2. Traductions du produit
             */
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

            /*
             * 3. Galerie
             *
             * L'ordre envoyé par le navigateur
             * n'est pas utilisé directement.
             *
             * L'ordre du tableau devient :
             *
             * 0 = couverture
             * 1 = image 2
             * ...
             * 4 = image 5
             */
            if (
              dto.images?.length
            ) {
              for (
                const [
                  index,
                  image,
                ] of dto.images.entries()
              ) {
                const createdImage =
                  await transaction
                    .product_images
                    .create({
                      data: {
                        product_id:
                          createdProduct.id,

                        image_url:
                          image.imageUrl.trim(),

                        sort_order:
                          index,

                        width:
                          image.width ??
                          null,

                        height:
                          image.height ??
                          null,
                      },
                    });

                if (
                  image.translations?.length
                ) {
                  await transaction
                    .product_image_translations
                    .createMany({
                      data:
                        image.translations.map(
                          translation => ({
                            product_image_id:
                              createdImage.id,

                            locale:
                              translation.locale,

                            alt_text:
                              translation.altText
                                ?.trim() ||
                              null,
                          }),
                        ),
                    });
                }
              }
            }

            /*
             * 4. Retour complet
             */
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

                  product_images: {
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

                    include: {
                      product_image_translations: {
                        orderBy: {
                          locale:
                            'asc',
                        },
                      },
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

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

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

    if (
      dto.images
    ) {
      this.validateImages(
        dto.images,
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
            /*
             * 1. Données principales
             */
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

            /*
             * 2. Traductions
             */
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
               *
               * Si la traduction AR est retirée
               * depuis l'éditeur, elle est supprimée
               * afin que le fallback EN reprenne
               * automatiquement la main.
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

            /*
             * 3. Galerie
             *
             * Important :
             *
             * - dto.images === undefined
             *   => on ne touche pas à la galerie.
             *
             * - dto.images === []
             *   => on retire toutes les images.
             *
             * - dto.images contient des éléments
             *   => la galerie est remplacée par
             *      celle reçue.
             *
             * Maximum : 5.
             */
            if (
              dto.images !==
              undefined
            ) {
              /*
               * Grâce au ON DELETE CASCADE,
               * supprimer product_images supprime
               * également les ALT associés.
               */
              await transaction
                .product_images
                .deleteMany({
                  where: {
                    product_id:
                      id,
                  },
                });

              for (
                const [
                  index,
                  image,
                ] of dto.images.entries()
              ) {
                const createdImage =
                  await transaction
                    .product_images
                    .create({
                      data: {
                        product_id:
                          id,

                        image_url:
                          image.imageUrl.trim(),

                        sort_order:
                          index,

                        width:
                          image.width ??
                          null,

                        height:
                          image.height ??
                          null,
                      },
                    });

                if (
                  image.translations?.length
                ) {
                  await transaction
                    .product_image_translations
                    .createMany({
                      data:
                        image.translations.map(
                          translation => ({
                            product_image_id:
                              createdImage.id,

                            locale:
                              translation.locale,

                            alt_text:
                              translation.altText
                                ?.trim() ||
                              null,
                          }),
                        ),
                    });
                }
              }
            }

            /*
             * 4. Retour complet
             */
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

                  product_images: {
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

                    include: {
                      product_image_translations: {
                        orderBy: {
                          locale:
                            'asc',
                        },
                      },
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

  /*
   * =========================================================
   * DELETE / ARCHIVE
   * =========================================================
   */

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

    /*
     * Suppression logique.
     *
     * On conserve volontairement les images
     * et traductions en base puisque le produit
     * lui-même reste archivé.
     */
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