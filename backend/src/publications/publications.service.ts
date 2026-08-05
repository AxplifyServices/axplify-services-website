import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';

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
  AdminPublicationQueryDto,
} from './dto/admin-publication-query.dto';

import {
  PublicPublicationQueryDto,
} from './dto/public-publication-query.dto';

import {
  CreatePublicationDto,
} from './dto/create-publication.dto';

import {
  PublicationMediaInputDto,
} from './dto/publication-media-input.dto';

import {
  SchedulePublicationDto,
} from './dto/schedule-publication.dto';

import {
  UpdatePublicationDto,
} from './dto/update-publication.dto';

import {
  sanitizePublicationBody,
} from './publication-body-sanitizer';

import {
  StorageService,
} from '../storage/storage.service';

import {
  DEFAULT_ADMIN_PAGE_SIZE,
  DEFAULT_PUBLICATION_LOCALE,
  DEFAULT_PUBLIC_PAGE_SIZE,
  MAX_PUBLICATION_MEDIA,
  PUBLICATION_LOCALES,
  PUBLICATION_LOCALE_FALLBACKS,
} from './publication.constants';

import type {
  PublicationLocale,
  PublicPublicationLocale,
} from './publication.constants';

type PrismaTransaction =
  Prisma.TransactionClient;

@Injectable()
export class PublicationsService {
  private readonly logger =
    new Logger(
      PublicationsService.name,
    );

  constructor(
    private readonly prisma:
      PrismaService,

    private readonly storageService:
      StorageService,
  ) {}

  async findAllAdmin(
    query:
      AdminPublicationQueryDto,
  ) {
    const page =
      query.page ??
      1;

    const limit =
      query.limit ??
      DEFAULT_ADMIN_PAGE_SIZE;

    const skip =
      (
        page -
        1
      ) *
      limit;

    const where =
      this.buildAdminWhere(
        query,
      );

    const orderBy =
      this.buildAdminOrderBy(
        query.sort,
      );

    const [
      publications,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .publications
            .findMany({
              where,

              orderBy,

              skip,

              take:
                limit,

              include: {
                publication_translations: {
                  orderBy: {
                    locale:
                      'asc',
                  },
                },

                publication_media: {
                  orderBy: [
                    {
                      is_card_cover:
                        'desc',
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

                  include: {
                    publication_media_translations: {
                      orderBy: {
                        locale:
                          'asc',
                      },
                    },
                  },
                },

                publication_expertise:
                  true,

                publication_projects: {
                  include: {
                    projects:
                      true,
                  },
                },
              },
            }),

          this.prisma
            .publications
            .count({
              where,
            }),
        ]);

    return {
      items:
        publications.map(
          publication =>
            this.mapAdminPublication(
              publication,
            ),
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

  async findAllPublic(
    query:
      PublicPublicationQueryDto,
  ) {
    const requestedLocale =
      query.locale ??
      DEFAULT_PUBLICATION_LOCALE;

    const page =
      query.page ??
      1;

    const limit =
      query.limit ??
      DEFAULT_PUBLIC_PAGE_SIZE;

    const skip =
      (
        page -
        1
      ) *
      limit;

    const now =
      new Date();

    const where:
      Prisma.publicationsWhereInput =
      {
        status:
          'PUBLISHED',

        published_at: {
          not:
            null,

          lte:
            now,
        },

        deleted_at:
          null,

        ...(query.contentType
          ? {
              content_type:
                query.contentType,
            }
          : {}),

        ...(query.featured !==
        undefined
          ? {
              is_featured:
                query.featured,
            }
          : {}),

        ...(query.eventStatus
          ? {
              event_status:
                query.eventStatus,
            }
          : {}),

        ...(query.expertise
          ? {
              publication_expertise: {
                some: {
                  expertise_code:
                    query.expertise,
                },
              },
            }
          : {}),

        ...(query.tag
          ? {
              publication_tag_assignments: {
                some: {
                  publication_tags: {
                    publication_tag_translations: {
                      some: {
                        slug:
                          query.tag,
                      },
                    },
                  },
                },
              },
            }
          : {}),

        ...(query.contentType ===
          'EVENT' &&
        query.includePastEvents !==
          true
          ? {
              event_start_at: {
                gte:
                  now,
              },
            }
          : {}),
      };

    const [
      publications,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .publications
            .findMany({
              where,

              skip,

              take:
                limit,

              orderBy:
                query.contentType ===
                'EVENT'
                  ? [
                      {
                        event_start_at:
                          'asc',
                      },

                      {
                        published_at:
                          'desc',
                      },
                    ]
                  : [
                      {
                        is_featured:
                          'desc',
                      },

                      {
                        featured_sort_order:
                          'asc',
                      },

                      {
                        published_at:
                          'desc',
                      },
                    ],

              include:
                this.getPublicPublicationInclude(),
            }),

          this.prisma
            .publications
            .count({
              where,
            }),
        ]);

    const items =
      publications
        .map(
          publication =>
            this.mapPublicPublication(
              publication,
              requestedLocale,
              false,
            ),
        )
        .filter(
          (
            publication,
          ):
            publication is NonNullable<
              typeof publication
            > =>
              publication !==
              null,
        );

    return {
      items,

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

  async findFeaturedPublic(
    query:
      PublicPublicationQueryDto,
  ) {
    return this.findAllPublic({
      ...query,

      featured:
        true,

      page:
        1,

      limit:
        Math.min(
          query.limit ??
            6,
          12,
        ),
    });
  }

  async findUpcomingEventsPublic(
    query:
      PublicPublicationQueryDto,
  ) {
    return this.findAllPublic({
      ...query,

      contentType:
        'EVENT',

      includePastEvents:
        false,

      page:
        query.page ??
        1,

      limit:
        query.limit ??
        9,
    });
  }

  async findOnePublicBySlug(
    requestedLocale:
      PublicPublicationLocale,

    slug:
      string,
  ) {
    const lookupLocales =
      PUBLICATION_LOCALE_FALLBACKS[
        requestedLocale
      ];

    /*
     * Pour /ar, le slug doit être celui de la version anglaise,
     * puis française si aucune version anglaise n’existe.
     */
    const translation =
      await this.prisma
        .publication_translations
        .findFirst({
          where: {
            slug,

            locale: {
              in: [
                ...lookupLocales,
              ],
            },

            publications: {
              status:
                'PUBLISHED',

              published_at: {
                not:
                  null,

                lte:
                  new Date(),
              },

              deleted_at:
                null,
            },
          },

          orderBy: {
            locale:
              requestedLocale ===
              'fr'
                ? 'desc'
                : 'asc',
          },

          select: {
            publication_id:
              true,
          },
        });

    if (
      !translation
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    const publication =
      await this.prisma
        .publications
        .findFirst({
          where: {
            id:
              translation.publication_id,

            status:
              'PUBLISHED',

            published_at: {
              not:
                null,

              lte:
                new Date(),
            },

            deleted_at:
              null,
          },

          include:
            this.getPublicPublicationInclude(),
        });

    if (
      !publication
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    const mapped =
      this.mapPublicPublication(
        publication,
        requestedLocale,
        true,
      );

    if (
      !mapped
    ) {
      throw new NotFoundException(
        'Aucune traduction publique n’est disponible.',
      );
    }

    return mapped;
  }

  async findOneAdmin(
    id:
      string,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    return this.mapAdminPublication(
      publication,
    );
  }

  async create(
    dto:
      CreatePublicationDto,

    currentUser:
      AuthenticatedUser,
  ) {
    this.validateTranslations(
      dto.translations,
    );

    this.validateEventFields(
      dto,
    );

    const normalizedMedia =
      this.normalizeMedia(
        dto.media ??
          [],
      );

    await this.validateProjects(
      dto.projectIds ??
        [],
    );

    try {
      const publication =
        await this.prisma
          .$transaction(
            async tx => {
              const created =
                await tx
                  .publications
                  .create({
                    data: {
                      content_type:
                        dto.contentType,

                      status:
                        'DRAFT',

                      is_featured:
                        dto.isFeatured ??
                        false,

                      featured_sort_order:
                        dto.featuredSortOrder ??
                        0,

                      allow_indexing:
                        dto.allowIndexing ??
                        true,

                      event_start_at:
                        this.toNullableDate(
                          dto.eventStartAt,
                        ),

                      event_end_at:
                        this.toNullableDate(
                          dto.eventEndAt,
                        ),

                      event_timezone:
                        dto.eventTimezone ??
                        null,

                      event_location_type:
                        dto.eventLocationType ??
                        null,

                      event_location_name:
                        dto.eventLocationName ??
                        null,

                      event_address:
                        dto.eventAddress ??
                        null,

                      event_online_url:
                        dto.eventOnlineUrl ??
                        null,

                      event_registration_url:
                        dto.eventRegistrationUrl ??
                        null,

                      event_registration_deadline:
                        this.toNullableDate(
                          dto.eventRegistrationDeadline,
                        ),

                      event_capacity:
                        dto.eventCapacity ??
                        null,

                      event_status:
                        dto.contentType ===
                        'EVENT'
                          ? dto.eventStatus ??
                            'UPCOMING'
                          : null,

                      created_by_user_id:
                        currentUser.id,

                      updated_by_user_id:
                        currentUser.id,
                    },
                  });

              await this.createTranslations(
                tx,
                created.id,
                dto.translations,
              );

              await this.createExpertise(
                tx,
                created.id,
                dto.expertiseCodes ??
                  [],
              );

              await this.createProjectRelations(
                tx,
                created.id,
                dto.projectIds ??
                  [],
              );

              await this.createMedia(
                tx,
                created.id,
                normalizedMedia,
              );

              return created;
            },
          );

      return this.findOneAdmin(
        publication.id,
      );
    } catch (
      error
    ) {
      this.handleDatabaseError(
        error,
      );
    }
  }

  async update(
    id:
      string,

    dto:
      UpdatePublicationDto,

    currentUser:
      AuthenticatedUser,
  ) {
    if (
      Object.keys(
        dto,
      ).length ===
      0
    ) {
      throw new BadRequestException(
        'Aucune modification n’a été fournie.',
      );
    }

    const existing =
      await this.findPublicationOrThrow(
        id,
      );

    if (
      dto.translations
    ) {
      this.validateTranslations(
        dto.translations,
      );
    }

    const mergedEventData = {
      contentType:
        dto.contentType ??
        existing.content_type,

      eventStartAt:
        dto.eventStartAt ??
        existing.event_start_at
          ?.toISOString(),

      eventEndAt:
        dto.eventEndAt ??
        existing.event_end_at
          ?.toISOString(),

      eventTimezone:
        dto.eventTimezone ??
        existing.event_timezone ??
        undefined,

      eventLocationType:
        dto.eventLocationType ??
        existing.event_location_type ??
        undefined,

      eventLocationName:
        dto.eventLocationName ??
        existing.event_location_name ??
        undefined,

      eventAddress:
        dto.eventAddress ??
        existing.event_address ??
        undefined,

      eventOnlineUrl:
        dto.eventOnlineUrl ??
        existing.event_online_url ??
        undefined,

      eventRegistrationUrl:
        dto.eventRegistrationUrl ??
        existing.event_registration_url ??
        undefined,

      eventRegistrationDeadline:
        dto.eventRegistrationDeadline ??
        existing.event_registration_deadline
          ?.toISOString(),

      eventCapacity:
        dto.eventCapacity ??
        existing.event_capacity ??
        undefined,

      eventStatus:
        dto.eventStatus ??
        existing.event_status ??
        undefined,
    };

    this.validateEventFields(
      mergedEventData,
    );

    if (
      dto.projectIds
    ) {
      await this.validateProjects(
        dto.projectIds,
      );
    }

    const normalizedMedia =
      dto.media
        ? this.normalizeMedia(
            dto.media,
          )
        : undefined;

    try {
      await this.prisma
        .$transaction(
          async tx => {
            const newContentType =
              dto.contentType ??
              existing.content_type;

            await tx
              .publications
              .update({
                where: {
                  id,
                },

                data: {
                  ...(dto.contentType !==
                  undefined
                    ? {
                        content_type:
                          dto.contentType,
                      }
                    : {}),

                  ...(dto.isFeatured !==
                  undefined
                    ? {
                        is_featured:
                          dto.isFeatured,
                      }
                    : {}),

                  ...(dto.featuredSortOrder !==
                  undefined
                    ? {
                        featured_sort_order:
                          dto.featuredSortOrder,
                      }
                    : {}),

                  ...(dto.allowIndexing !==
                  undefined
                    ? {
                        allow_indexing:
                          dto.allowIndexing,
                      }
                    : {}),

                  ...(newContentType ===
                  'EVENT'
                    ? {
                        event_start_at:
                          dto.eventStartAt !==
                          undefined
                            ? this.toNullableDate(
                                dto.eventStartAt,
                              )
                            : undefined,

                        event_end_at:
                          dto.eventEndAt !==
                          undefined
                            ? this.toNullableDate(
                                dto.eventEndAt,
                              )
                            : undefined,

                        event_timezone:
                          dto.eventTimezone !==
                          undefined
                            ? dto.eventTimezone
                            : undefined,

                        event_location_type:
                          dto.eventLocationType !==
                          undefined
                            ? dto.eventLocationType
                            : undefined,

                        event_location_name:
                          dto.eventLocationName !==
                          undefined
                            ? dto.eventLocationName
                            : undefined,

                        event_address:
                          dto.eventAddress !==
                          undefined
                            ? dto.eventAddress
                            : undefined,

                        event_online_url:
                          dto.eventOnlineUrl !==
                          undefined
                            ? dto.eventOnlineUrl
                            : undefined,

                        event_registration_url:
                          dto.eventRegistrationUrl !==
                          undefined
                            ? dto.eventRegistrationUrl
                            : undefined,

                        event_registration_deadline:
                          dto.eventRegistrationDeadline !==
                          undefined
                            ? this.toNullableDate(
                                dto.eventRegistrationDeadline,
                              )
                            : undefined,

                        event_capacity:
                          dto.eventCapacity !==
                          undefined
                            ? dto.eventCapacity
                            : undefined,

                        event_status:
                          dto.eventStatus !==
                          undefined
                            ? dto.eventStatus
                            : undefined,
                      }
                    : {
                        event_start_at:
                          null,

                        event_end_at:
                          null,

                        event_timezone:
                          null,

                        event_location_type:
                          null,

                        event_location_name:
                          null,

                        event_address:
                          null,

                        event_online_url:
                          null,

                        event_registration_url:
                          null,

                        event_registration_deadline:
                          null,

                        event_capacity:
                          null,

                        event_status:
                          null,
                      }),

                  updated_by_user_id:
                    currentUser.id,
                },
              });

            if (
              dto.translations
            ) {
              await tx
                .publication_translations
                .deleteMany({
                  where: {
                    publication_id:
                      id,
                  },
                });

              await this.createTranslations(
                tx,
                id,
                dto.translations,
              );
            }

            if (
              dto.expertiseCodes
            ) {
              await tx
                .publication_expertise
                .deleteMany({
                  where: {
                    publication_id:
                      id,
                  },
                });

              await this.createExpertise(
                tx,
                id,
                dto.expertiseCodes,
              );
            }

            if (
              dto.projectIds
            ) {
              await tx
                .publication_projects
                .deleteMany({
                  where: {
                    publication_id:
                      id,
                  },
                });

              await this.createProjectRelations(
                tx,
                id,
                dto.projectIds,
              );
            }

            if (
              normalizedMedia
            ) {
              await tx
                .publication_media
                .deleteMany({
                  where: {
                    publication_id:
                      id,
                  },
                });

              await this.createMedia(
                tx,
                id,
                normalizedMedia,
              );
            }
          },
        );

      return this.findOneAdmin(
        id,
      );
    } catch (
      error
    ) {
      this.handleDatabaseError(
        error,
      );
    }
  }

  async publish(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    this.validatePublishable(
      publication,
    );

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          status:
            'PUBLISHED',

          published_at:
            new Date(),

          scheduled_at:
            null,

          published_by_user_id:
            currentUser.id,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async schedule(
    id:
      string,

    dto:
      SchedulePublicationDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    this.validatePublishable(
      publication,
    );

    const scheduledAt =
      new Date(
        dto.scheduledAt,
      );

    if (
      scheduledAt.getTime() <=
      Date.now()
    ) {
      throw new BadRequestException(
        'La date de publication programmée doit être dans le futur.',
      );
    }

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          status:
            'DRAFT',

          scheduled_at:
            scheduledAt,

          published_at:
            null,

          published_by_user_id:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async cancelSchedule(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    if (
      !publication.scheduled_at
    ) {
      throw new BadRequestException(
        'Cette publication n’est pas programmée.',
      );
    }

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          scheduled_at:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async unpublish(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    if (
      publication.status !==
      'PUBLISHED'
    ) {
      throw new BadRequestException(
        'Cette publication n’est pas actuellement publiée.',
      );
    }

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          status:
            'DRAFT',

          published_at:
            null,

          scheduled_at:
            null,

          published_by_user_id:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async archive(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.findPublicationOrThrow(
      id,
    );

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          status:
            'ARCHIVED',

          scheduled_at:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async restore(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    const publication =
      await this.findPublicationOrThrow(
        id,
      );

    if (
      publication.status !==
      'ARCHIVED'
    ) {
      throw new BadRequestException(
        'Seule une publication archivée peut être restaurée.',
      );
    }

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          status:
            'DRAFT',

          published_at:
            null,

          scheduled_at:
            null,

          published_by_user_id:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  async remove(
    id:
      string,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.findPublicationOrThrow(
      id,
    );

    await this.prisma
      .publications
      .update({
        where: {
          id,
        },

        data: {
          deleted_at:
            new Date(),

          scheduled_at:
            null,

          updated_by_user_id:
            currentUser.id,
        },
      });

    return {
      success:
        true,

      message:
        'La publication a été supprimée.',
    };
  }

  @Cron(
    CronExpression.EVERY_MINUTE,
  )
  async publishScheduledPublications() {
    const now =
      new Date();

    const scheduled =
      await this.prisma
        .publications
        .findMany({
          where: {
            status:
              'DRAFT',

            scheduled_at: {
              lte:
                now,
            },

            deleted_at:
              null,
          },

          select: {
            id:
              true,

            published_by_user_id:
              true,

            updated_by_user_id:
              true,

            created_by_user_id:
              true,
          },

          take:
            50,

          orderBy: {
            scheduled_at:
              'asc',
          },
        });

    for (
      const candidate of
      scheduled
    ) {
      try {
        const publication =
          await this.findPublicationOrThrow(
            candidate.id,
          );

        this.validatePublishable(
          publication,
        );

        const actorId =
          candidate.updated_by_user_id ??
          candidate.created_by_user_id ??
          candidate.published_by_user_id;

        await this.prisma
          .publications
          .updateMany({
            where: {
              id:
                candidate.id,

              status:
                'DRAFT',

              scheduled_at: {
                lte:
                  now,
              },

              deleted_at:
                null,
            },

            data: {
              status:
                'PUBLISHED',

              published_at:
                now,

              scheduled_at:
                null,

              published_by_user_id:
                actorId,
            },
          });
      } catch (
        error
      ) {
        const message =
          error instanceof Error
            ? error.message
            : 'Erreur inconnue';

        this.logger.warn(
          `La publication programmée ${candidate.id} n’a pas été publiée : ${message}`,
        );
      }
    }
  }

  private getPublicPublicationInclude() {
    return {
      publication_translations: {
        orderBy: {
          locale:
            'asc' as const,
        },
      },

      publication_media: {
        orderBy: [
          {
            is_card_cover:
              'desc' as const,
          },

          {
            sort_order:
              'asc' as const,
          },

          {
            created_at:
              'asc' as const,
          },
        ],

        include: {
          publication_media_translations: {
            orderBy: {
              locale:
                'asc' as const,
            },
          },
        },
      },

      publication_expertise:
        true,

      publication_projects: {
        include: {
          projects: {
            include: {
              clients:
                true,
            },
          },
        },
      },

      publication_tag_assignments: {
        include: {
          publication_tags: {
            include: {
              publication_tag_translations: {
                orderBy: {
                  locale:
                    'asc' as const,
                },
              },
            },
          },
        },
      },
    };
  }

  private resolveStoredLocale(
    requestedLocale:
      PublicPublicationLocale,

    availableLocales:
      string[],
  ):
    PublicationLocale |
    null
  {
    const fallbacks =
      PUBLICATION_LOCALE_FALLBACKS[
        requestedLocale
      ];

    for (
      const locale of
      fallbacks
    ) {
      if (
        availableLocales.includes(
          locale,
        )
      ) {
        return locale;
      }
    }

    return null;
  }

  private mapPublicPublication(
    publication:
      Prisma.publicationsGetPayload<{
        include:
          ReturnType<
            PublicationsService[
              'getPublicPublicationInclude'
            ]
          >;
      }>,

    requestedLocale:
      PublicPublicationLocale,

    includeBody:
      boolean,
  ) {
    const resolvedLocale =
      this.resolveStoredLocale(
        requestedLocale,
        publication
          .publication_translations
          .map(
            translation =>
              translation.locale,
          ),
      );

    if (
      !resolvedLocale
    ) {
      return null;
    }

    const translation =
      publication
        .publication_translations
        .find(
          item =>
            item.locale ===
            resolvedLocale,
        );

    if (
      !translation
    ) {
      return null;
    }

    const coverMedia =
      publication
        .publication_media
        .find(
          media =>
            media.is_card_cover,
        ) ??
      publication
        .publication_media[0] ??
      null;

    const mappedCoverMedia =
      coverMedia
        ? this.mapPublicMedia(
            coverMedia,
            requestedLocale,
          )
        : null;

    const mappedMedia =
      includeBody
        ? publication
            .publication_media
            .map(
              media =>
                this.mapPublicMedia(
                  media,
                  requestedLocale,
                ),
            )
        : undefined;

    const projects =
      publication
        .publication_projects
        .map(
          relation => {
            const project =
              relation.projects;

            const projectTitle =
              requestedLocale ===
                'fr'
                ? project.title_fr ??
                  project.title_en
                : project.title_en ??
                  project.title_fr;

const clientName =
  project.clients
    ?.name ??
  null;

            return {
              id:
                project.id,

              title:
                projectTitle,

              client:
                project.clients
                  ? {
                      id:
                        project.clients.id,

                      name:
                        clientName,

                      logoUrl:
                        project.clients
                          .logo_url,
                    }
                  : null,
            };
          },
        );

    const tags =
      publication
        .publication_tag_assignments
        .map(
          assignment => {
            const tag =
              assignment
                .publication_tags;

            const tagLocale =
              this.resolveStoredLocale(
                requestedLocale,
                tag
                  .publication_tag_translations
                  .map(
                    item =>
                      item.locale,
                  ),
              );

            const tagTranslation =
              tagLocale
                ? tag
                    .publication_tag_translations
                    .find(
                      item =>
                        item.locale ===
                        tagLocale,
                    )
                : null;

            if (
              !tagTranslation
            ) {
              return null;
            }

            return {
              id:
                tag.id,

              code:
                tag.code,

              label:
                tagTranslation.label,

              slug:
                tagTranslation.slug,
            };
          },
        )
        .filter(
          (
            tag,
          ):
            tag is NonNullable<
              typeof tag
            > =>
              tag !==
              null,
        );

    return {
      id:
        publication.id,

      contentType:
        publication.content_type,

      requestedLocale,

      resolvedLocale,

      isFallback:
        requestedLocale !==
        resolvedLocale,

      title:
        translation.title,

      slug:
        translation.slug,

      excerpt:
        translation.excerpt,

      body:
        includeBody
          ? translation.body
          : undefined,

      seo: {
        title:
          translation.seo_title ??
          translation.title,

        description:
          translation.seo_description ??
          translation.excerpt,

        canonicalUrl:
          translation.canonical_url,

        allowIndexing:
          publication.allow_indexing,
      },

      coverMedia:
        mappedCoverMedia,

      media:
        mappedMedia,

      expertiseCodes:
        publication
          .publication_expertise
          .map(
            relation =>
              relation.expertise_code,
          ),

      projects,

      tags,

      event:
        publication.content_type ===
        'EVENT'
          ? {
              startAt:
                publication.event_start_at,

              endAt:
                publication.event_end_at,

              timezone:
                publication.event_timezone,

              locationType:
                publication.event_location_type,

              locationName:
                publication.event_location_name,

              address:
                publication.event_address,

              onlineUrl:
                publication.event_online_url,

              registrationUrl:
                publication.event_registration_url,

              registrationDeadline:
                publication.event_registration_deadline,

              capacity:
                publication.event_capacity,

              status:
                publication.event_status,

              isPast:
                Boolean(
                  publication.event_end_at
                    ? publication
                        .event_end_at
                        .getTime() <
                      Date.now()
                    : publication.event_start_at &&
                        publication
                          .event_start_at
                          .getTime() <
                        Date.now(),
                ),
            }
          : null,

      isFeatured:
        publication.is_featured,

      publishedAt:
        publication.published_at,

      updatedAt:
        publication.updated_at,
    };
  }

  private mapPublicMedia(
    media:
      Prisma.publication_mediaGetPayload<{
        include: {
          publication_media_translations:
            true;
        };
      }>,

    requestedLocale:
      PublicPublicationLocale,
  ) {
    const resolvedLocale =
      this.resolveStoredLocale(
        requestedLocale,
        media
          .publication_media_translations
          .map(
            translation =>
              translation.locale,
          ),
      );

    const translation =
      resolvedLocale
        ? media
            .publication_media_translations
            .find(
              item =>
                item.locale ===
                resolvedLocale,
            )
        : null;

    return {
      id:
        media.id,

      mediaType:
        media.media_type,

      mediaUrl:
        media.media_url,

      cardImageUrl:
        media.media_type ===
        'VIDEO'
          ? media.poster_url
          : media.media_url,

      posterUrl:
        media.poster_url,

      posterFrameSeconds:
        media.poster_frame_seconds
          ?.toString() ??
        null,

      isCardCover:
        media.is_card_cover,

      sortOrder:
        media.sort_order,

      width:
        media.width,

      height:
        media.height,

      durationSeconds:
        media.duration_seconds,

      altText:
        translation?.alt_text ??
        null,

      caption:
        translation?.caption ??
        null,

      resolvedLocale,
    };
  }  

  private buildAdminWhere(
    query:
      AdminPublicationQueryDto,
  ):
    Prisma.publicationsWhereInput
  {
    const where:
      Prisma.publicationsWhereInput =
      {
        deleted_at:
          null,
      };

    if (
      query.contentType
    ) {
      where.content_type =
        query.contentType;
    }

    if (
      query.eventStatus
    ) {
      where.event_status =
        query.eventStatus;
    }

    if (
      query.locale
    ) {
      where.publication_translations =
        {
          some: {
            locale:
              query.locale,
          },
        };
    }

    if (
      query.expertise
    ) {
      where.publication_expertise =
        {
          some: {
            expertise_code:
              query.expertise,
          },
        };
    }

    if (
      query.projectId
    ) {
      where.publication_projects =
        {
          some: {
            project_id:
              query.projectId,
          },
        };
    }

    if (
      query.search
    ) {
      where.publication_translations =
        {
          some: {
            ...(query.locale
              ? {
                  locale:
                    query.locale,
                }
              : {}),

            OR: [
              {
                title: {
                  contains:
                    query.search,

                  mode:
                    'insensitive',
                },
              },

              {
                excerpt: {
                  contains:
                    query.search,

                  mode:
                    'insensitive',
                },
              },

              {
                slug: {
                  contains:
                    query.search,

                  mode:
                    'insensitive',
                },
              },
            ],
          },
        };
    }

    if (
      query.state ===
      'SCHEDULED'
    ) {
      where.status =
        'DRAFT';

      where.scheduled_at =
        {
          not:
            null,
        };
    } else if (
      query.state ===
      'DRAFT'
    ) {
      where.status =
        'DRAFT';

      where.scheduled_at =
        null;
    } else if (
      query.state
    ) {
      where.status =
        query.state;
    }

    return where;
  }

  private buildAdminOrderBy(
    sort:
      AdminPublicationQueryDto['sort'],
  ):
    Prisma.publicationsOrderByWithRelationInput[]
  {
    switch (
      sort
    ) {
      case 'CREATED_DESC':
        return [
          {
            created_at:
              'desc',
          },
        ];

      case 'PUBLISHED_DESC':
        return [
          {
            published_at:
              'desc',
          },

          {
            updated_at:
              'desc',
          },
        ];

      case 'SCHEDULED_ASC':
        return [
          {
            scheduled_at:
              'asc',
          },

          {
            updated_at:
              'desc',
          },
        ];

      case 'EVENT_START_ASC':
        return [
          {
            event_start_at:
              'asc',
          },

          {
            updated_at:
              'desc',
          },
        ];

      case 'UPDATED_DESC':
      default:
        return [
          {
            updated_at:
              'desc',
          },
        ];
    }
  }

  private async findPublicationOrThrow(
    id:
      string,
  ) {
    const publication =
      await this.prisma
        .publications
        .findFirst({
          where: {
            id,

            deleted_at:
              null,
          },

          include: {
            publication_translations: {
              orderBy: {
                locale:
                  'asc',
              },
            },

            publication_media: {
              orderBy: [
                {
                  is_card_cover:
                    'desc',
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

              include: {
                publication_media_translations: {
                  orderBy: {
                    locale:
                      'asc',
                  },
                },
              },
            },

            publication_expertise:
              true,

            publication_projects: {
              include: {
                projects:
                  true,
              },
            },
          },
        });

    if (
      !publication
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    return publication;
  }

  private validateTranslations(
    translations:
      CreatePublicationDto['translations'],
  ) {
    if (
      !translations.length
    ) {
      throw new BadRequestException(
        'Ajoutez au moins une traduction française ou anglaise.',
      );
    }

    const locales =
      translations.map(
        translation =>
          translation.locale,
      );

    if (
      new Set(
        locales,
      ).size !==
      locales.length
    ) {
      throw new BadRequestException(
        'Une langue ne peut apparaître qu’une seule fois.',
      );
    }

    for (
      const locale of
      locales
    ) {
      if (
        !PUBLICATION_LOCALES.includes(
          locale,
        )
      ) {
        throw new BadRequestException(
          'La langue de traduction est invalide.',
        );
      }
    }
  }

  private validateEventFields(
    dto: {
      contentType:
        string;

      eventStartAt?:
        string;

      eventEndAt?:
        string;

      eventTimezone?:
        string;

      eventLocationType?:
        string;

      eventLocationName?:
        string;

      eventAddress?:
        string;

      eventOnlineUrl?:
        string;

      eventRegistrationUrl?:
        string;

      eventRegistrationDeadline?:
        string;

      eventCapacity?:
        number;

      eventStatus?:
        string;
    },
  ) {
    const hasEventData =
      Boolean(
        dto.eventStartAt ||
        dto.eventEndAt ||
        dto.eventTimezone ||
        dto.eventLocationType ||
        dto.eventLocationName ||
        dto.eventAddress ||
        dto.eventOnlineUrl ||
        dto.eventRegistrationUrl ||
        dto.eventRegistrationDeadline ||
        dto.eventCapacity ||
        dto.eventStatus,
      );

    if (
      dto.contentType !==
        'EVENT' &&
      hasEventData
    ) {
      throw new BadRequestException(
        'Les informations d’événement sont réservées aux publications de type événement.',
      );
    }

    if (
      dto.contentType !==
      'EVENT'
    ) {
      return;
    }

    if (
      !dto.eventStartAt
    ) {
      throw new BadRequestException(
        'La date de début de l’événement est obligatoire.',
      );
    }

    const startAt =
      new Date(
        dto.eventStartAt,
      );

    const endAt =
      dto.eventEndAt
        ? new Date(
            dto.eventEndAt,
          )
        : null;

    const registrationDeadline =
      dto.eventRegistrationDeadline
        ? new Date(
            dto.eventRegistrationDeadline,
          )
        : null;

    if (
      endAt &&
      endAt.getTime() <
        startAt.getTime()
    ) {
      throw new BadRequestException(
        'La date de fin ne peut pas être antérieure à la date de début.',
      );
    }

    if (
      registrationDeadline &&
      registrationDeadline.getTime() >
        startAt.getTime()
    ) {
      throw new BadRequestException(
        'La date limite d’inscription doit précéder le début de l’événement.',
      );
    }

    if (
      dto.eventLocationType ===
        'PHYSICAL' &&
      !dto.eventLocationName &&
      !dto.eventAddress
    ) {
      throw new BadRequestException(
        'Indiquez le lieu ou l’adresse de l’événement physique.',
      );
    }

    if (
      dto.eventLocationType ===
        'ONLINE' &&
      !dto.eventOnlineUrl
    ) {
      throw new BadRequestException(
        'Indiquez le lien de participation à l’événement en ligne.',
      );
    }

    if (
      dto.eventLocationType ===
        'HYBRID' &&
      (
        !dto.eventOnlineUrl ||
        (
          !dto.eventLocationName &&
          !dto.eventAddress
        )
      )
    ) {
      throw new BadRequestException(
        'Un événement hybride doit avoir un lieu physique et un lien en ligne.',
      );
    }
  }

  private normalizeMedia(
    media:
      PublicationMediaInputDto[],
  ) {
    if (
      media.length >
      MAX_PUBLICATION_MEDIA
    ) {
      throw new BadRequestException(
        'Une publication ne peut pas contenir plus de 5 médias.',
      );
    }

    for (
      const item of
      media
    ) {
      if (
        !this.storageService
          .isPublicationMediaUrl(
            item.mediaUrl,
          )
      ) {
        throw new BadRequestException(
          'Un des médias ne provient pas du stockage sécurisé des publications.',
        );
      }

      if (
        item.mediaType ===
          'IMAGE' &&
        (
          item.posterUrl ||
          item.posterFrameSeconds !==
            undefined
        )
      ) {
        throw new BadRequestException(
          'Une image ne peut pas posséder d’affiche vidéo.',
        );
      }

      if (
        item.mediaType ===
          'VIDEO'
      ) {
        if (
          !item.posterUrl ||
          !this.storageService
            .isPublicationPosterUrl(
              item.posterUrl,
            )
        ) {
          throw new BadRequestException(
            'La vidéo doit posséder une affiche générée par le serveur.',
          );
        }
      }
    }    

    if (
      media.length ===
      0
    ) {
      return [];
    }

    const selectedIndexes =
      media
        .map(
          (
            item,
            index,
          ) =>
            item.isCardCover
              ? index
              : -1,
        )
        .filter(
          index =>
            index >=
            0,
        );

    if (
      selectedIndexes.length >
      1
    ) {
      throw new BadRequestException(
        'Un seul média peut être utilisé comme affiche.',
      );
    }

    let coverIndex =
      selectedIndexes[0];

    if (
      coverIndex ===
      undefined
    ) {
      const firstImageIndex =
        media.findIndex(
          item =>
            item.mediaType ===
            'IMAGE',
        );

      coverIndex =
        firstImageIndex >=
        0
          ? firstImageIndex
          : 0;
    }

    return media.map(
      (
        item,
        index,
      ) => ({
        ...item,

        isCardCover:
          index ===
          coverIndex,

        sortOrder:
          item.sortOrder ??
          index,
      }),
    );
  }

  private async validateProjects(
    projectIds:
      string[],
  ) {
    if (
      projectIds.length ===
      0
    ) {
      return;
    }

    const count =
      await this.prisma
        .projects
        .count({
          where: {
            id: {
              in:
                projectIds,
            },
          },
        });

    if (
      count !==
      projectIds.length
    ) {
      throw new BadRequestException(
        'Un ou plusieurs projets associés sont introuvables.',
      );
    }
  }

private async createTranslations(
  tx:
    PrismaTransaction,

  publicationId:
    string,

  translations:
    CreatePublicationDto['translations'],
) {
  await tx
    .publication_translations
    .createMany({
      data:
        translations.map(
          translation => ({
            publication_id:
              publicationId,

            locale:
              translation.locale,

            title:
              translation.title,

            slug:
              translation.slug,

            excerpt:
              translation.excerpt ??
              null,

            body:
              sanitizePublicationBody(
                translation.body,
              ),

            cover_alt_text:
              translation.coverAltText ??
              null,

            seo_title:
              translation.seoTitle ??
              null,

            seo_description:
              translation.seoDescription ??
              null,

            canonical_url:
              translation.canonicalUrl ??
              null,
          }),
        ),
    });
}

  private async createExpertise(
    tx:
      PrismaTransaction,

    publicationId:
      string,

    expertiseCodes:
      string[],
  ) {
    if (
      expertiseCodes.length ===
      0
    ) {
      return;
    }

    await tx
      .publication_expertise
      .createMany({
        data:
          expertiseCodes.map(
            expertiseCode => ({
              publication_id:
                publicationId,

              expertise_code:
                expertiseCode,
            }),
          ),
      });
  }

  private async createProjectRelations(
    tx:
      PrismaTransaction,

    publicationId:
      string,

    projectIds:
      string[],
  ) {
    if (
      projectIds.length ===
      0
    ) {
      return;
    }

    await tx
      .publication_projects
      .createMany({
        data:
          projectIds.map(
            projectId => ({
              publication_id:
                publicationId,

              project_id:
                projectId,
            }),
          ),
      });
  }

  private async createMedia(
    tx:
      PrismaTransaction,

    publicationId:
      string,

    media:
      ReturnType<
        PublicationsService['normalizeMedia']
      >,
  ) {
    for (
      const item of
      media
    ) {
      const createdMedia =
        await tx
          .publication_media
          .create({
            data: {
              publication_id:
                publicationId,

              media_type:
                item.mediaType,

              media_url:
                item.mediaUrl,

              is_card_cover:
                item.isCardCover,

              sort_order:
                item.sortOrder,

              width:
                item.width ??
                null,

              height:
                item.height ??
                null,

              duration_seconds:
                item.durationSeconds ??
                null,

              poster_url:
                item.posterUrl ??
                null,

              poster_frame_seconds:
                item.posterFrameSeconds ??
                null,
            },
          });

      if (
        item.translations?.length
      ) {
        await tx
          .publication_media_translations
          .createMany({
            data:
              item.translations.map(
                translation => ({
                  publication_media_id:
                    createdMedia.id,

                  locale:
                    translation.locale,

                  alt_text:
                    translation.altText ??
                    null,

                  caption:
                    translation.caption ??
                    null,
                }),
              ),
          });
      }
    }
  }

  private validatePublishable(
    publication:
      Awaited<
        ReturnType<
          PublicationsService['findPublicationOrThrow']
        >
      >,
  ) {
    const translations =
      publication
        .publication_translations;

    if (
      translations.length ===
      0
    ) {
      throw new BadRequestException(
        'Ajoutez une traduction avant de publier.',
      );
    }

    const primaryTranslation =
      translations.find(
        translation =>
          translation.locale ===
          'fr',
      ) ??
      translations.find(
        translation =>
          translation.locale ===
          'en',
      );

    if (
      !primaryTranslation
    ) {
      throw new BadRequestException(
        'Ajoutez un contenu français ou anglais avant de publier.',
      );
    }

    if (
      !primaryTranslation.title.trim() ||
      !primaryTranslation.slug.trim() ||
      !primaryTranslation.excerpt?.trim() ||
      !primaryTranslation.body?.trim()
    ) {
      throw new BadRequestException(
        'Le titre, le slug, le résumé et le contenu sont obligatoires avant publication.',
      );
    }

    if (
      publication
        .publication_media
        .length ===
      0
    ) {
      throw new BadRequestException(
        'Ajoutez au moins une image ou une vidéo avant de publier.',
      );
    }

    if (
      publication
        .publication_media
        .length >
      MAX_PUBLICATION_MEDIA
    ) {
      throw new BadRequestException(
        'Une publication ne peut pas contenir plus de 5 médias.',
      );
    }

    const coverMedia =
      publication
        .publication_media
        .filter(
          media =>
            media.is_card_cover,
        );

    if (
      coverMedia.length !==
      1
    ) {
      throw new BadRequestException(
        'Sélectionnez exactement un média d’affiche.',
      );
    }

    const cover =
      coverMedia[0];

    if (
      cover.media_type ===
        'VIDEO' &&
      !cover.poster_url
    ) {
      throw new BadRequestException(
        'La vidéo d’affiche doit disposer d’une image extraite avant publication.',
      );
    }

    if (
      cover.media_type ===
        'IMAGE'
    ) {
      const coverTranslation =
        cover
          .publication_media_translations
          .find(
            translation =>
              translation.locale ===
              primaryTranslation.locale,
          ) ??
        cover
          .publication_media_translations[0];

      const alternativeText =
        coverTranslation
          ?.alt_text ??
        primaryTranslation
          .cover_alt_text;

      if (
        !alternativeText?.trim()
      ) {
        throw new BadRequestException(
          'Le média d’affiche doit avoir un texte alternatif avant publication.',
        );
      }
    }

    if (
      publication.content_type ===
      'EVENT'
    ) {
      this.validateEventFields({
        contentType:
          publication.content_type,

        eventStartAt:
          publication.event_start_at
            ?.toISOString(),

        eventEndAt:
          publication.event_end_at
            ?.toISOString(),

        eventTimezone:
          publication.event_timezone ??
          undefined,

        eventLocationType:
          publication.event_location_type ??
          undefined,

        eventLocationName:
          publication.event_location_name ??
          undefined,

        eventAddress:
          publication.event_address ??
          undefined,

        eventOnlineUrl:
          publication.event_online_url ??
          undefined,

        eventRegistrationUrl:
          publication.event_registration_url ??
          undefined,

        eventRegistrationDeadline:
          publication.event_registration_deadline
            ?.toISOString(),

        eventCapacity:
          publication.event_capacity ??
          undefined,

        eventStatus:
          publication.event_status ??
          undefined,
      });
    }
  }

  private mapAdminPublication(
    publication:
      Awaited<
        ReturnType<
          PublicationsService['findPublicationOrThrow']
        >
      >,
  ) {
    return {
      id:
        publication.id,

      contentType:
        publication.content_type,

      status:
        publication.status,

      state:
        publication.status ===
          'DRAFT' &&
        publication.scheduled_at
          ? 'SCHEDULED'
          : publication.status,

      isFeatured:
        publication.is_featured,

      featuredSortOrder:
        publication.featured_sort_order,

      allowIndexing:
        publication.allow_indexing,

      event: {
        startAt:
          publication.event_start_at,

        endAt:
          publication.event_end_at,

        timezone:
          publication.event_timezone,

        locationType:
          publication.event_location_type,

        locationName:
          publication.event_location_name,

        address:
          publication.event_address,

        onlineUrl:
          publication.event_online_url,

        registrationUrl:
          publication.event_registration_url,

        registrationDeadline:
          publication.event_registration_deadline,

        capacity:
          publication.event_capacity,

        status:
          publication.event_status,
      },

      scheduledAt:
        publication.scheduled_at,

      publishedAt:
        publication.published_at,

      translations:
        publication
          .publication_translations
          .map(
            translation => ({
              id:
                translation.id,

              locale:
                translation.locale,

              title:
                translation.title,

              slug:
                translation.slug,

              excerpt:
                translation.excerpt,

              body:
                translation.body,

              coverAltText:
                translation.cover_alt_text,

              seoTitle:
                translation.seo_title,

              seoDescription:
                translation.seo_description,

              canonicalUrl:
                translation.canonical_url,
            }),
          ),

      media:
        publication
          .publication_media
          .map(
            media => ({
              id:
                media.id,

              mediaType:
                media.media_type,

              mediaUrl:
                media.media_url,

              isCardCover:
                media.is_card_cover,

              posterUrl:
                media.poster_url,

              posterFrameSeconds:
                media.poster_frame_seconds
                  ?.toString() ??
                null,

              sortOrder:
                media.sort_order,

              width:
                media.width,

              height:
                media.height,

              durationSeconds:
                media.duration_seconds,

              translations:
                media
                  .publication_media_translations
                  .map(
                    translation => ({
                      id:
                        translation.id,

                      locale:
                        translation.locale,

                      altText:
                        translation.alt_text,

                      caption:
                        translation.caption,
                    }),
                  ),
            }),
          ),

      expertiseCodes:
        publication
          .publication_expertise
          .map(
            relation =>
              relation.expertise_code,
          ),

      projects:
        publication
          .publication_projects
          .map(
            relation => ({
              id:
                relation.projects.id,

              titleFr:
                relation.projects.title_fr,

              titleEn:
                relation.projects.title_en,

              status:
                relation.projects.status,
            }),
          ),

      createdByUserId:
        publication.created_by_user_id,

      updatedByUserId:
        publication.updated_by_user_id,

      publishedByUserId:
        publication.published_by_user_id,

      createdAt:
        publication.created_at,

      updatedAt:
        publication.updated_at,
    };
  }

  private toNullableDate(
    value:
      string |
      undefined,
  ) {
    return value
      ? new Date(
          value,
        )
      : null;
  }

  private handleDatabaseError(
    error:
      unknown,
  ):
    never
  {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        'P2002'
    ) {
      throw new ConflictException(
        'Ce slug est déjà utilisé pour cette langue.',
      );
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        'P2003'
    ) {
      throw new BadRequestException(
        'Une relation associée à la publication est invalide.',
      );
    }

    throw error;
  }
}