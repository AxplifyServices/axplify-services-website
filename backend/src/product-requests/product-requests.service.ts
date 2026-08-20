import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  PRODUCT_REQUEST_ALLOWED_TRANSITIONS,
  PRODUCT_REQUEST_STATUSES,
  PRODUCT_REQUEST_TYPES,
} from './product-request.constants';

import type {
  ProductRequestStatus,
} from './product-request.constants';

import {
  AdminProductRequestQueryDto,
} from './dto/admin-product-request-query.dto';

import {
  CreateProductRequestDto,
} from './dto/create-product-request.dto';

import {
  UpdateProductRequestAdminDto,
} from './dto/update-product-request-admin.dto';

import {
  UpdateProductRequestStatusDto,
} from './dto/update-product-request-status.dto';

import {
  TelegramNotificationService,
} from '../notifications/telegram-notification.service';

@Injectable()
export class ProductRequestsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly telegramNotificationService:
      TelegramNotificationService,
  ) {}

  /*
   * =========================================================
   * PUBLIC
   * =========================================================
   */

  async createPublic(
    dto:
      CreateProductRequestDto,

    userAgent?:
      string,
  ) {
    this.validateHoneypot(
      dto.website,
    );

    this.validatePrivacyConsent(
      dto.privacyConsent,
    );

    /*
     * On résout toujours le produit côté serveur.
     *
     * sourceUrl n'est jamais utilisée pour identifier
     * le produit.
     */
const product =
  await this.prisma
    .products
    .findFirst({
      where: {
        integration_key:
          dto.productKey,

        deleted_at:
          null,

        is_active:
          true,
      },

      select: {
        id:
          true,

        product_translations: {
          where: {
            locale: {
              in: [
                dto.locale,
                'fr',
                'en',
              ],
            },
          },

          select: {
            locale:
              true,

            name:
              true,
          },
        },
      },
    });

    if (
      !product
    ) {
      throw new NotFoundException(
        'Le produit demandé est introuvable ou indisponible.',
      );
    }

const productName =
  product.product_translations
    .find(
      (
        translation,
      ) =>
        translation.locale ===
        dto.locale,
    )
    ?.name ??
  product.product_translations
    .find(
      (
        translation,
      ) =>
        translation.locale ===
        'fr',
    )
    ?.name ??
  product.product_translations
    .find(
      (
        translation,
      ) =>
        translation.locale ===
        'en',
    )
    ?.name ??
  'Produit Axplify';    

    const createdRequest =
      await this.prisma
        .$transaction(
          async (
            transaction,
          ) => {
            const request =
              await transaction
                .product_requests
                .create({
                  data: {
                    product_id:
                      product.id,

                    request_type:
                      dto.requestType,

                    locale:
                      dto.locale,

                    first_name:
                      dto.firstName ??
                      null,

                    last_name:
                      dto.lastName ??
                      null,

                    company_name:
                      dto.companyName,

                    email:
                      dto.email,

                    phone_number:
                      dto.phoneNumber,

                    request_message:
                      dto.message,

                    source_url:
                      dto.sourceUrl ??
                      null,

                    status:
                      'RECEIVED',

                    status_changed_at:
                      new Date(),

                    privacy_consent:
                      true,

                    privacy_consent_at:
                      new Date(),

                    user_agent:
                      this.normalizeUserAgent(
                        userAgent,
                      ),
                  },

                  select: {
                    id:
                      true,

                    request_type:
                      true,

                    status:
                      true,

                    created_at:
                      true,
                  },
                });

            await transaction
              .product_request_status_history
              .create({
                data: {
                  product_request_id:
                    request.id,

                  previous_status:
                    null,

                  new_status:
                    'RECEIVED',
                },
              });

            return request;
          },
        );

await this.telegramNotificationService
  .notifyNewProductRequest({
    id:
      createdRequest.id,

    createdAt:
      createdRequest.created_at,

    productName,

    request:
      dto,
  });        

    return {
      message:
        this.getPublicSuccessMessage(
          dto.requestType,
        ),

      request: {
        id:
          createdRequest.id,

        type:
          createdRequest.request_type,

        status:
          createdRequest.status,

        createdAt:
          createdRequest.created_at,
      },
    };
  }

  /*
   * =========================================================
   * ADMIN — LIST
   * =========================================================
   */

  async findAllAdmin(
    query:
      AdminProductRequestQueryDto,
  ) {
    const page =
      query.page ??
      1;

    const limit =
      query.limit ??
      10;

    const skip =
      (
        page -
        1
      ) *
      limit;

    const search =
      query.search
        ?.trim();

    const where:
      Prisma.product_requestsWhereInput =
      {
        archived_at:
          null,

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),

        ...(query.requestType
          ? {
              request_type:
                query.requestType,
            }
          : {}),

        ...(query.productId
          ? {
              product_id:
                query.productId,
            }
          : {}),

        ...(query.assignedToUserId
          ? {
              assigned_to_user_id:
                query.assignedToUserId,
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  first_name: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  last_name: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  company_name: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  email: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  phone_number: {
                    contains:
                      search,
                  },
                },

                {
                  request_message: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
              ],
            }
          : {}),
      };

    const [
      requests,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .product_requests
            .findMany({
              where,

              orderBy: [
                {
                  created_at:
                    'desc',
                },
              ],

              skip,

              take:
                limit,

              select: {
                id:
                  true,

                product_id:
                  true,

                request_type:
                  true,

                locale:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                company_name:
                  true,

                email:
                  true,

                phone_number:
                  true,

                status:
                  true,

                status_changed_at:
                  true,

                assigned_to_user_id:
                  true,

                created_at:
                  true,

                updated_at:
                  true,
              },
            }),

          this.prisma
            .product_requests
            .count({
              where,
            }),
        ]);

    const productIds =
      [
        ...new Set(
          requests.map(
            request =>
              request.product_id,
          ),
        ),
      ];

    const administratorIds =
      [
        ...new Set(
          requests
            .map(
              request =>
                request.assigned_to_user_id,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value,
                ),
            ),
        ),
      ];

    const [
      products,
      administrators,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .products
            .findMany({
              where: {
                id: {
                  in:
                    productIds,
                },
              },

              select: {
                id:
                  true,

                integration_key:
                  true,

                product_translations: {
                  select: {
                    locale:
                      true,

                    name:
                      true,
                  },
                },
              },
            }),

          this.prisma
            .users
            .findMany({
              where: {
                id: {
                  in:
                    administratorIds,
                },
              },

              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,
              },
            }),
        ]);

    const productsById =
      new Map(
        products.map(
          product => [
            product.id,
            product,
          ],
        ),
      );

    const administratorsById =
      new Map(
        administrators.map(
          user => [
            user.id,
            user,
          ],
        ),
      );

    return {
      items:
        requests.map(
          request => {
            const product =
              productsById.get(
                request.product_id,
              );

            const administrator =
              request.assigned_to_user_id
                ? administratorsById.get(
                    request.assigned_to_user_id,
                  )
                : undefined;

            return {
              id:
                request.id,

              requestType:
                request.request_type,

              locale:
                request.locale,

              firstName:
                request.first_name,

              lastName:
                request.last_name,

              fullName:
                this.buildFullName(
                  request.first_name ??
                    '',
                  request.last_name ??
                    '',
                ),

              companyName:
                request.company_name,

              email:
                request.email,

              phoneNumber:
                request.phone_number,

              status:
                request.status,

              statusChangedAt:
                request.status_changed_at,

              createdAt:
                request.created_at,

              updatedAt:
                request.updated_at,

              product:
                product
                  ? this.mapProductSummary(
                      product,
                    )
                  : null,

              assignedTo:
                administrator
                  ? this.mapUserSummary(
                      administrator,
                    )
                  : null,
            };
          },
        ),

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total /
              limit,
          ),
      },
    };
  }

  /*
   * =========================================================
   * ADMIN — OPTIONS
   * =========================================================
   */

  async getAdminOptions() {
    const [
      administrators,
      products,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .users
            .findMany({
              where: {
                status:
                  'ACTIVE',

                deleted_at:
                  null,

                user_roles_user_roles_user_idTousers: {
                  some: {
                    roles: {
                      code:
                        'SUPER_ADMIN',
                    },
                  },
                },
              },

              orderBy: [
                {
                  first_name:
                    'asc',
                },

                {
                  last_name:
                    'asc',
                },

                {
                  email:
                    'asc',
                },
              ],

              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,
              },
            }),

          this.prisma
            .products
            .findMany({
              where: {
                deleted_at:
                  null,
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

              select: {
                id:
                  true,

                integration_key:
                  true,

                is_active:
                  true,

                product_translations: {
                  select: {
                    locale:
                      true,

                    name:
                      true,
                  },
                },
              },
            }),
        ]);

    return {
      statuses:
        PRODUCT_REQUEST_STATUSES,

      requestTypes:
        PRODUCT_REQUEST_TYPES,

      administrators:
        administrators.map(
          administrator => ({
            ...this.mapUserSummary(
              administrator,
            ),

            fullName:
              this.buildUserDisplayName(
                administrator,
              ),
          }),
        ),

      products:
        products.map(
          product => ({
            ...this.mapProductSummary(
              product,
            ),

            isActive:
              product.is_active,
          }),
        ),
    };
  }

  /*
   * =========================================================
   * ADMIN — DETAIL
   * =========================================================
   */

  async findOneAdmin(
    id:
      string,
  ) {
    const request =
      await this.prisma
        .product_requests
        .findFirst({
          where: {
            id,

            archived_at:
              null,
          },

          select: {
            id:
              true,

            product_id:
              true,

            request_type:
              true,

            locale:
              true,

            first_name:
              true,

            last_name:
              true,

            company_name:
              true,

            email:
              true,

            phone_number:
              true,

            request_message:
              true,

            source_url:
              true,

            status:
              true,

            status_changed_at:
              true,

            assigned_to_user_id:
              true,

            updated_by_user_id:
              true,

            internal_note:
              true,

            privacy_consent:
              true,

            privacy_consent_at:
              true,

            created_at:
              true,

            updated_at:
              true,
          },
        });

    if (
      !request
    ) {
      throw new NotFoundException(
        'La demande produit est introuvable.',
      );
    }

    const history =
      await this.prisma
        .product_request_status_history
        .findMany({
          where: {
            product_request_id:
              request.id,
          },

          orderBy: {
            created_at:
              'asc',
          },

          select: {
            id:
              true,

            previous_status:
              true,

            new_status:
              true,

            changed_by_user_id:
              true,

            change_note:
              true,

            created_at:
              true,
          },
        });

    const userIds =
      [
        request.assigned_to_user_id,
        request.updated_by_user_id,
        ...history.map(
          item =>
            item.changed_by_user_id,
        ),
      ].filter(
        (
          value,
        ): value is string =>
          Boolean(
            value,
          ),
      );

    const [
      product,
      users,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .products
            .findUnique({
              where: {
                id:
                  request.product_id,
              },

              select: {
                id:
                  true,

                integration_key:
                  true,

                is_active:
                  true,

                link_url:
                  true,

                product_translations: {
                  select: {
                    locale:
                      true,

                    name:
                      true,

                    title:
                      true,
                  },
                },
              },
            }),

          this.prisma
            .users
            .findMany({
              where: {
                id: {
                  in: [
                    ...new Set(
                      userIds,
                    ),
                  ],
                },
              },

              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,
              },
            }),
        ]);

    const usersById =
      new Map(
        users.map(
          user => [
            user.id,
            user,
          ],
        ),
      );

    const currentStatus =
      request.status as ProductRequestStatus;

    return {
      id:
        request.id,

      requestType:
        request.request_type,

      locale:
        request.locale,

      firstName:
        request.first_name,

      lastName:
        request.last_name,

      fullName:
        this.buildFullName(
          request.first_name ??
            '',
          request.last_name ??
            '',
        ),

      companyName:
        request.company_name,

      email:
        request.email,

      phoneNumber:
        request.phone_number,

      message:
        request.request_message,

      sourceUrl:
        request.source_url,

      status:
        currentStatus,

      allowedNextStatuses:
        PRODUCT_REQUEST_ALLOWED_TRANSITIONS[
          currentStatus
        ],

      statusChangedAt:
        request.status_changed_at,

      internalNote:
        request.internal_note,

      privacyConsent:
        request.privacy_consent,

      privacyConsentAt:
        request.privacy_consent_at,

      createdAt:
        request.created_at,

      updatedAt:
        request.updated_at,

      product:
        product
          ? {
              ...this.mapProductSummary(
                product,
              ),

              isActive:
                product.is_active,

              linkUrl:
                product.link_url,

              title:
                this.mapTranslatedValue(
                  product
                    .product_translations,
                  'title',
                ),
            }
          : null,

      assignedTo:
        request.assigned_to_user_id
          ? this.mapUserSummary(
              usersById.get(
                request.assigned_to_user_id,
              ),
            )
          : null,

      lastUpdatedBy:
        request.updated_by_user_id
          ? this.mapUserSummary(
              usersById.get(
                request.updated_by_user_id,
              ),
            )
          : null,

      statusHistory:
        history.map(
          item => ({
            id:
              item.id,

            previousStatus:
              item.previous_status,

            newStatus:
              item.new_status,

            note:
              item.change_note,

            changedAt:
              item.created_at,

            changedBy:
              item.changed_by_user_id
                ? this.mapUserSummary(
                    usersById.get(
                      item.changed_by_user_id,
                    ),
                  )
                : null,
          }),
        ),
    };
  }

  /*
   * =========================================================
   * ADMIN — ASSIGNMENT / NOTE
   * =========================================================
   */

  async updateAdminFields(
    id:
      string,

    dto:
      UpdateProductRequestAdminDto,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.assertProductRequestExists(
      id,
    );

    if (
      dto.assignedToUserId
    ) {
      await this.assertAdministratorExists(
        dto.assignedToUserId,
      );
    }

    await this.prisma
      .product_requests
      .update({
        where: {
          id,
        },

        data: {
          ...(dto.assignedToUserId !==
          undefined
            ? {
                assigned_to_user_id:
                  dto.assignedToUserId,
              }
            : {}),

          ...(dto.internalNote !==
          undefined
            ? {
                internal_note:
                  dto.internalNote,
              }
            : {}),

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  /*
   * =========================================================
   * ADMIN — STATUS
   * =========================================================
   */

  async updateStatus(
    id:
      string,

    dto:
      UpdateProductRequestStatusDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingRequest =
      await this.prisma
        .product_requests
        .findFirst({
          where: {
            id,

            archived_at:
              null,
          },

          select: {
            id:
              true,

            status:
              true,
          },
        });

    if (
      !existingRequest
    ) {
      throw new NotFoundException(
        'La demande produit est introuvable.',
      );
    }

    const previousStatus =
      existingRequest.status as ProductRequestStatus;

    if (
      previousStatus ===
      dto.status
    ) {
      throw new BadRequestException(
        'La demande possède déjà ce statut.',
      );
    }

    const allowedStatuses =
      PRODUCT_REQUEST_ALLOWED_TRANSITIONS[
        previousStatus
      ];

    if (
      !allowedStatuses.includes(
        dto.status,
      )
    ) {
      throw new BadRequestException(
        `Le passage du statut ${previousStatus} vers ${dto.status} n’est pas autorisé.`,
      );
    }

    await this.prisma
      .$transaction(
        async (
          transaction,
        ) => {
          await transaction
            .product_requests
            .update({
              where: {
                id,
              },

              data: {
                status:
                  dto.status,

                status_changed_at:
                  new Date(),

                updated_by_user_id:
                  currentUser.id,
              },
            });

          await transaction
            .product_request_status_history
            .create({
              data: {
                product_request_id:
                  id,

                previous_status:
                  previousStatus,

                new_status:
                  dto.status,

                changed_by_user_id:
                  currentUser.id,

                change_note:
                  dto.note ??
                  null,
              },
            });
        },
      );

    return this.findOneAdmin(
      id,
    );
  }

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  private validateHoneypot(
    website?:
      string,
  ) {
    if (
      website
    ) {
      throw new BadRequestException(
        'La demande est invalide.',
      );
    }
  }

  private validatePrivacyConsent(
    privacyConsent:
      boolean,
  ) {
    if (
      !privacyConsent
    ) {
      throw new BadRequestException(
        'Le consentement à la politique de confidentialité est obligatoire.',
      );
    }
  }

  private async assertProductRequestExists(
    id:
      string,
  ) {
    const request =
      await this.prisma
        .product_requests
        .findFirst({
          where: {
            id,

            archived_at:
              null,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !request
    ) {
      throw new NotFoundException(
        'La demande produit est introuvable.',
      );
    }
  }

  private async assertAdministratorExists(
    id:
      string,
  ) {
    const user =
      await this.prisma
        .users
        .findFirst({
          where: {
            id,

            status:
              'ACTIVE',

            deleted_at:
              null,

            user_roles_user_roles_user_idTousers: {
              some: {
                roles: {
                  code:
                    'SUPER_ADMIN',
                },
              },
            },
          },

          select: {
            id:
              true,
          },
        });

    if (
      !user
    ) {
      throw new BadRequestException(
        'L’administrateur sélectionné est invalide.',
      );
    }
  }

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  private normalizeUserAgent(
    value?:
      string,
  ) {
    const normalized =
      value
        ?.trim()
        .slice(
          0,
          2000,
        );

    return normalized ||
      null;
  }

  private getPublicSuccessMessage(
    requestType:
      string,
  ) {
    switch (
      requestType
    ) {
      case 'DEMO':
        return 'Votre demande de démonstration a bien été enregistrée.';

      case 'ORDER':
        return 'Votre demande de commande a bien été enregistrée.';

      default:
        return 'Votre demande concernant ce produit a bien été enregistrée.';
    }
  }

  private buildFullName(
    firstName:
      string,

    lastName:
      string,
  ) {
    return [
      firstName,
      lastName,
    ]
      .filter(
        Boolean,
      )
      .join(
        ' ',
      )
      .trim();
  }

  private buildUserDisplayName(
    user: {
      email:
        string;

      first_name:
        string | null;

      last_name:
        string | null;
    },
  ) {
    const name =
      [
        user.first_name,
        user.last_name,
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )
        .trim();

    return name ||
      user.email;
  }

  private mapUserSummary(
    user:
      | {
          id:
            string;

          email:
            string;

          first_name:
            string | null;

          last_name:
            string | null;
        }
      | undefined,
  ) {
    if (
      !user
    ) {
      return null;
    }

    return {
      id:
        user.id,

      email:
        user.email,

      firstName:
        user.first_name,

      lastName:
        user.last_name,

      fullName:
        this.buildUserDisplayName(
          user,
        ),
    };
  }

  private mapProductSummary(
    product: {
      id:
        string;

      integration_key:
        string;

      product_translations: Array<{
        locale:
          string;

        name:
          string;
      }>;
    },
  ) {
    return {
      id:
        product.id,

      integrationKey:
        product.integration_key,

      name:
        this.mapTranslatedValue(
          product
            .product_translations,
          'name',
        ),
    };
  }

  private mapTranslatedValue<
    TKey extends
      'name' |
      'title',
  >(
    translations:
      Array<
        {
          locale:
            string;
        } &
        Record<
          TKey,
          string
        >
      >,

    key:
      TKey,
  ) {
    const findValue =
      (
        locale:
          string,
      ) =>
        translations
          .find(
            translation =>
              translation.locale ===
              locale,
          )
          ?.[
            key
          ] ??
        null;

    const fr =
      findValue(
        'fr',
      );

    const en =
      findValue(
        'en',
      );

    const ar =
      findValue(
        'ar',
      );

    return {
      fr:
        fr ??
        en ??
        ar,

      en,

      ar:
        ar ??
        en ??
        fr,
    };
  }
}