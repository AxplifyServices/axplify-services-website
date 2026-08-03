import {
  BadRequestException,
  ConflictException,
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
  StorageService,
} from '../storage/storage.service';

import {
  CreateClientDto,
} from './dto/create-client.dto';

import {
  UpdateClientDto,
} from './dto/update-client.dto';

type PublicLocale =
  | 'fr'
  | 'en'
  | 'ar';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly storageService:
      StorageService,
  ) {}

  async findHomepageClients(
    locale:
      PublicLocale,
  ) {
    const clients =
      await this.prisma
        .clients
        .findMany({
          where: {
            is_active:
              true,

            show_on_homepage:
              true,
          },

          orderBy: [
            {
              homepage_sort_order:
                'asc',
            },

            {
              name:
                'asc',
            },
          ],

          select: {
            id:
              true,

            name:
              true,

            industry_fr:
              true,

            industry_en:
              true,

            industry_ar:
              true,

            logo_url:
              true,

            logo_alt_fr:
              true,

            logo_alt_en:
              true,

            logo_alt_ar:
              true,
          },
        });

    /*
     * La section de la page d’accueil doit être totalement
     * masquée lorsqu’il y a moins de trois clients visibles.
     */
    if (
      clients.length <
      3
    ) {
      return [];
    }

    return clients.map(
      client => ({
        id:
          client.id,

        name:
          client.name,

        industry:
          this.resolveLocalizedValue(
            locale,
            client.industry_fr,
            client.industry_en,
            client.industry_ar,
          ),

        logoUrl:
          client.logo_url,

        logoAlt:
          this.resolveLocalizedValue(
            locale,
            client.logo_alt_fr ??
              `${client.name} — client Axplify Services`,
            client.logo_alt_en,
            client.logo_alt_ar,
          ),
      }),
    );
  }

  async findAllAdmin(
    search?:
      string,

    homepageVisibility?:
      string,

    activeStatus?:
      string,
  ) {
    const normalizedSearch =
      search?.trim();

    const showOnHomepage =
      homepageVisibility ===
      'visible'
        ? true
        : homepageVisibility ===
            'hidden'
          ? false
          : undefined;

    const isActive =
      activeStatus ===
      'active'
        ? true
        : activeStatus ===
            'inactive'
          ? false
          : undefined;

    const clients =
      await this.prisma
        .clients
        .findMany({
          where: {
            ...(normalizedSearch
              ? {
                  OR: [
                    {
                      name: {
                        contains:
                          normalizedSearch,

                        mode:
                          'insensitive',
                      },
                    },

                    {
                      industry_fr: {
                        contains:
                          normalizedSearch,

                        mode:
                          'insensitive',
                      },
                    },

                    {
                      industry_en: {
                        contains:
                          normalizedSearch,

                        mode:
                          'insensitive',
                      },
                    },

                    {
                      industry_ar: {
                        contains:
                          normalizedSearch,

                        mode:
                          'insensitive',
                      },
                    },
                  ],
                }
              : {}),

            ...(showOnHomepage ===
            undefined
              ? {}
              : {
                  show_on_homepage:
                    showOnHomepage,
                }),

            ...(isActive ===
            undefined
              ? {}
              : {
                  is_active:
                    isActive,
                }),
          },

          orderBy: [
            {
              homepage_sort_order:
                'asc',
            },

            {
              name:
                'asc',
            },
          ],
        });

    const projectCounts =
      await this.prisma
        .projects
        .groupBy({
          by: [
            'client_id',
          ],

          where: {
            client_id: {
              in:
                clients.map(
                  client =>
                    client.id,
                ),
            },
          },

          _count: {
            _all:
              true,
          },
        });

    const projectCountByClientId =
      new Map(
        projectCounts.map(
          count => [
            count.client_id,
            count._count._all,
          ],
        ),
      );

    return clients.map(
      client =>
        this.mapAdminClient(
          client,
          projectCountByClientId.get(
            client.id,
          ) ??
            0,
        ),
    );
  }

  async findOneAdmin(
    id:
      string,
  ) {
    const client =
      await this.prisma
        .clients
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !client
    ) {
      throw new NotFoundException(
        'Client introuvable.',
      );
    }

    const projectCount =
      await this.prisma
        .projects
        .count({
          where: {
            client_id:
              id,
          },
        });

    return this.mapAdminClient(
      client,
      projectCount,
    );
  }

  async create(
    dto:
      CreateClientDto,

    currentUser:
      AuthenticatedUser,
  ) {
    try {
      const client =
        await this.prisma
          .clients
          .create({
            data: {
              name:
                dto.name.trim(),

              industry_fr:
                dto.industryFr.trim(),

              industry_en:
                dto.industryEn?.trim() ??
                null,

              industry_ar:
                dto.industryAr?.trim() ??
                null,

              logo_url:
                dto.logoUrl.trim(),

              logo_alt_fr:
                dto.logoAltFr?.trim() ??
                null,

              logo_alt_en:
                dto.logoAltEn?.trim() ??
                null,

              logo_alt_ar:
                dto.logoAltAr?.trim() ??
                null,

              show_on_homepage:
                dto.showOnHomepage ??
                false,

              homepage_sort_order:
                dto.homepageSortOrder ??
                0,

              is_active:
                dto.isActive ??
                true,

              created_by_user_id:
                currentUser.id,
            },
          });

      return this.mapAdminClient(
        client,
        0,
      );
    } catch (
      error
    ) {
      this.handlePrismaError(
        error,
      );
    }
  }

  async update(
    id:
      string,

    dto:
      UpdateClientDto,
  ) {
    const existingClient =
      await this.prisma
        .clients
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !existingClient
    ) {
      throw new NotFoundException(
        'Client introuvable.',
      );
    }

    const nextLogoUrl =
      dto.logoUrl?.trim() ??
      existingClient.logo_url;

    try {
      const updatedClient =
        await this.prisma
          .clients
          .update({
            where: {
              id,
            },

            data: {
              ...(dto.name !==
              undefined
                ? {
                    name:
                      dto.name.trim(),
                  }
                : {}),

              ...(dto.industryFr !==
              undefined
                ? {
                    industry_fr:
                      dto.industryFr.trim(),
                  }
                : {}),

              ...(dto.industryEn !==
              undefined
                ? {
                    industry_en:
                      dto.industryEn?.trim() ??
                      null,
                  }
                : {}),

              ...(dto.industryAr !==
              undefined
                ? {
                    industry_ar:
                      dto.industryAr?.trim() ??
                      null,
                  }
                : {}),

              ...(dto.logoUrl !==
              undefined
                ? {
                    logo_url:
                      nextLogoUrl,
                  }
                : {}),

              ...(dto.logoAltFr !==
              undefined
                ? {
                    logo_alt_fr:
                      dto.logoAltFr?.trim() ??
                      null,
                  }
                : {}),

              ...(dto.logoAltEn !==
              undefined
                ? {
                    logo_alt_en:
                      dto.logoAltEn?.trim() ??
                      null,
                  }
                : {}),

              ...(dto.logoAltAr !==
              undefined
                ? {
                    logo_alt_ar:
                      dto.logoAltAr?.trim() ??
                      null,
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

              ...(dto.isActive !==
              undefined
                ? {
                    is_active:
                      dto.isActive,
                  }
                : {}),
            },
          });

      if (
        dto.logoUrl &&
        existingClient.logo_url !==
          dto.logoUrl
      ) {
        await this.storageService
          .deleteClientLogoByUrl(
            existingClient.logo_url,
          );
      }

      const projectCount =
        await this.prisma
          .projects
          .count({
            where: {
              client_id:
                id,
            },
          });

      return this.mapAdminClient(
        updatedClient,
        projectCount,
      );
    } catch (
      error
    ) {
      this.handlePrismaError(
        error,
      );
    }
  }

  async remove(
    id:
      string,
  ) {
    const client =
      await this.prisma
        .clients
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !client
    ) {
      throw new NotFoundException(
        'Client introuvable.',
      );
    }

    const projectCount =
      await this.prisma
        .projects
        .count({
          where: {
            client_id:
              id,
          },
        });

    if (
      projectCount >
      0
    ) {
      throw new BadRequestException(
        'Ce client possède des réalisations. Archivez ou supprimez d’abord les réalisations qui lui sont associées.',
      );
    }

    try {
      await this.prisma
        .clients
        .delete({
          where: {
            id,
          },
        });

      await this.storageService
        .deleteClientLogoByUrl(
          client.logo_url,
        );

      return {
        success:
          true,

        message:
          'Le client a été supprimé.',
      };
    } catch (
      error
    ) {
      this.handlePrismaError(
        error,
      );
    }
  }

  private resolveLocalizedValue(
    locale:
      PublicLocale,

    frenchValue:
      string | null,

    englishValue:
      string | null,

    arabicValue:
      string | null,
  ) {
    if (
      locale ===
      'en'
    ) {
      return englishValue ??
        frenchValue ??
        arabicValue ??
        '';
    }

    if (
      locale ===
      'ar'
    ) {
      return arabicValue ??
        frenchValue ??
        englishValue ??
        '';
    }

    return frenchValue ??
      englishValue ??
      arabicValue ??
      '';
  }

  private mapAdminClient(
    client: {
      id:
        string;

      name:
        string;

      industry_fr:
        string;

      industry_en:
        string | null;

      industry_ar:
        string | null;

      logo_url:
        string;

      logo_alt_fr:
        string | null;

      logo_alt_en:
        string | null;

      logo_alt_ar:
        string | null;

      show_on_homepage:
        boolean;

      homepage_sort_order:
        number;

      is_active:
        boolean;

      created_by_user_id:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },

    projectCount:
      number,
  ) {
    return {
      id:
        client.id,

      name:
        client.name,

      industryFr:
        client.industry_fr,

      industryEn:
        client.industry_en,

      industryAr:
        client.industry_ar,

      logoUrl:
        client.logo_url,

      logoAltFr:
        client.logo_alt_fr,

      logoAltEn:
        client.logo_alt_en,

      logoAltAr:
        client.logo_alt_ar,

      showOnHomepage:
        client.show_on_homepage,

      homepageSortOrder:
        client.homepage_sort_order,

      isActive:
        client.is_active,

      projectCount,

      createdByUserId:
        client.created_by_user_id,

      createdAt:
        client.created_at,

      updatedAt:
        client.updated_at,
    };
  }

  private handlePrismaError(
    error:
      unknown,
  ):
    never
  {
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code ===
        'P2002'
      ) {
        throw new ConflictException(
          'Un client portant ce nom existe déjà.',
        );
      }

      if (
        error.code ===
        'P2003'
      ) {
        throw new BadRequestException(
          'Ce client est encore utilisé par une ou plusieurs réalisations.',
        );
      }

      if (
        error.code ===
        'P2025'
      ) {
        throw new NotFoundException(
          'Client introuvable.',
        );
      }
    }

    throw error;
  }
}