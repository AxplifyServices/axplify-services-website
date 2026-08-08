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
  CreateProjectDto,
} from './dto/create-project.dto';

import {
  AdminProjectQueryDto,
  PublicProjectQueryDto,
} from './dto/project-query.dto';

import {
  UpdateProjectDto,
} from './dto/update-project.dto';

import {
  ProjectExpertiseCode,
  ProjectStatus,
  PublicLocale,
} from './project-expertise.constants';

type ProjectDatabaseRow = {
  id:
    string;

  client_id:
    string;

  title_fr:
    string;

  title_en:
    string | null;

  title_ar:
    string | null;

  description_fr:
    string;

  description_en:
    string | null;

  description_ar:
    string | null;

  status:
    string;

  sort_order:
    number;

  created_by_user_id:
    string | null;

  published_at:
    Date | null;

  created_at:
    Date;

  updated_at:
    Date;
};

type ClientDatabaseRow = {
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

  is_active:
    boolean;
};

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async findPublic(
    query:
      PublicProjectQueryDto,
  ) {
    const locale =
      query.locale ??
      'fr';

    const page =
      query.page ??
      1;

    const limit =
      query.limit ??
      12;

    const skip =
      (
        page -
        1
      ) *
      limit;

    const expertiseProjectIds =
      query.expertise
        ? await this.findProjectIdsByExpertise(
            query.expertise,
          )
        : undefined;

    if (
      query.expertise &&
      expertiseProjectIds?.length ===
        0
    ) {
      return {
        items:
          [],

        pagination: {
          page,

          limit,

          total:
            0,

          totalPages:
            0,
        },
      };
    }

    const where:
      Prisma.projectsWhereInput =
      {
        status:
          'PUBLISHED',

        clients: {
          is: {
            is_active:
              true,
          },
        },

        ...(expertiseProjectIds
          ? {
              id: {
                in:
                  expertiseProjectIds,
              },
            }
          : {}),
      };

    const [
      projects,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .projects
            .findMany({
              where,

              orderBy: [
                {
                  sort_order:
                    'asc',
                },

                {
                  published_at:
                    'desc',
                },

                {
                  created_at:
                    'desc',
                },
              ],

              skip,

              take:
                limit,
            }),

          this.prisma
            .projects
            .count({
              where,
            }),
        ]);

    const hydratedProjects =
      await this.hydrateProjects(
        projects,
      );

    return {
      items:
        hydratedProjects.map(
          (
            project,
          ) =>
            this.mapPublicProject(
              project.project,
              project.client,
              project.expertiseCodes,
              locale,
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

  async findAllAdmin(
    query:
      AdminProjectQueryDto,
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

    const expertiseProjectIds =
      query.expertise
        ? await this.findProjectIdsByExpertise(
            query.expertise,
          )
        : undefined;

    if (
      query.expertise &&
      expertiseProjectIds?.length ===
        0
    ) {
      return {
        items:
          [],

        pagination: {
          page,

          limit,

          total:
            0,

          totalPages:
            0,
        },
      };
    }

    const search =
      query.search?.trim();

    const where:
      Prisma.projectsWhereInput =
      {
        ...(query.clientId
          ? {
              client_id:
                query.clientId,
            }
          : {}),

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),

        ...(expertiseProjectIds
          ? {
              id: {
                in:
                  expertiseProjectIds,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  title_fr: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  title_en: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  title_ar: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  description_fr: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  description_en: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  description_ar: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  clients: {
                    is: {
                      name: {
                        contains:
                          search,

                        mode:
                          'insensitive',
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      };

    const [
      projects,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .projects
            .findMany({
              where,

              orderBy: [
                {
                  updated_at:
                    'desc',
                },

                {
                  created_at:
                    'desc',
                },
              ],

              skip,

              take:
                limit,
            }),

          this.prisma
            .projects
            .count({
              where,
            }),
        ]);

    const hydratedProjects =
      await this.hydrateProjects(
        projects,
      );

    return {
      items:
        hydratedProjects.map(
          (
            project,
          ) =>
            this.mapAdminProject(
              project.project,
              project.client,
              project.expertiseCodes,
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

  async findOneAdmin(
    id:
      string,
  ) {
    const project =
      await this.prisma
        .projects
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !project
    ) {
      throw new NotFoundException(
        'Réalisation introuvable.',
      );
    }

    const [
      hydratedProject,
    ] =
      await this.hydrateProjects([
        project,
      ]);

    if (
      !hydratedProject
    ) {
      throw new NotFoundException(
        'Le client associé à cette réalisation est introuvable.',
      );
    }

    return this.mapAdminProject(
      hydratedProject.project,
      hydratedProject.client,
      hydratedProject.expertiseCodes,
    );
  }

  async create(
    dto:
      CreateProjectDto,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.ensureClientExists(
      dto.clientId,
    );

    const status =
      dto.status ??
      'DRAFT';

    const now =
      new Date();

    try {
      const project =
        await this.prisma
          .$transaction(
            async (
              transaction,
            ) => {
              const createdProject =
                await transaction
                  .projects
                  .create({
                    data: {
                      client_id:
                        dto.clientId,

                      title_fr:
                        dto.titleFr.trim(),

                      title_en:
                        dto.titleEn?.trim() ??
                        null,

                      title_ar:
                        dto.titleAr?.trim() ??
                        null,

                      description_fr:
                        dto.descriptionFr.trim(),

                      description_en:
                        dto.descriptionEn?.trim() ??
                        null,

                      description_ar:
                        dto.descriptionAr?.trim() ??
                        null,

                      status,

                      sort_order:
                        dto.sortOrder ??
                        0,

                      created_by_user_id:
                        currentUser.id,

                      published_at:
                        status ===
                        'PUBLISHED'
                          ? now
                          : null,
                    },
                  });

              await transaction
                .project_expertise
                .createMany({
                  data:
                    dto.expertiseCodes.map(
                      (
                        expertiseCode,
                      ) => ({
                        project_id:
                          createdProject.id,

                        expertise_code:
                          expertiseCode,
                      }),
                    ),
                });

              return createdProject;
            },
          );

      return this.findOneAdmin(
        project.id,
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
      UpdateProjectDto,
  ) {
    const existingProject =
      await this.prisma
        .projects
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !existingProject
    ) {
      throw new NotFoundException(
        'Réalisation introuvable.',
      );
    }

    if (
      dto.clientId
    ) {
      await this.ensureClientExists(
        dto.clientId,
      );
    }

    const nextStatus =
      dto.status ??
      (existingProject.status as ProjectStatus);

    const nextPublishedAt =
      this.resolvePublishedAt(
        existingProject.status as ProjectStatus,
        nextStatus,
        existingProject.published_at,
      );

    try {
      await this.prisma
        .$transaction(
          async (
            transaction,
          ) => {
            await transaction
              .projects
              .update({
                where: {
                  id,
                },

                data: {
                  ...(dto.clientId !==
                  undefined
                    ? {
                        client_id:
                          dto.clientId,
                      }
                    : {}),

                  ...(dto.titleFr !==
                  undefined
                    ? {
                        title_fr:
                          dto.titleFr.trim(),
                      }
                    : {}),

                  ...(dto.titleEn !==
                  undefined
                    ? {
                        title_en:
                          dto.titleEn?.trim() ??
                          null,
                      }
                    : {}),

                  ...(dto.titleAr !==
                  undefined
                    ? {
                        title_ar:
                          dto.titleAr?.trim() ??
                          null,
                      }
                    : {}),

                  ...(dto.descriptionFr !==
                  undefined
                    ? {
                        description_fr:
                          dto.descriptionFr.trim(),
                      }
                    : {}),

                  ...(dto.descriptionEn !==
                  undefined
                    ? {
                        description_en:
                          dto.descriptionEn?.trim() ??
                          null,
                      }
                    : {}),

                  ...(dto.descriptionAr !==
                  undefined
                    ? {
                        description_ar:
                          dto.descriptionAr?.trim() ??
                          null,
                      }
                    : {}),

                  ...(dto.status !==
                  undefined
                    ? {
                        status:
                          dto.status,

                        published_at:
                          nextPublishedAt,
                      }
                    : {}),

                  ...(dto.sortOrder !==
                  undefined
                    ? {
                        sort_order:
                          dto.sortOrder,
                      }
                    : {}),
                },
              });

            if (
              dto.expertiseCodes !==
              undefined
            ) {
              await transaction
                .project_expertise
                .deleteMany({
                  where: {
                    project_id:
                      id,
                  },
                });

              await transaction
                .project_expertise
                .createMany({
                  data:
                    dto.expertiseCodes.map(
                      (
                        expertiseCode,
                      ) => ({
                        project_id:
                          id,

                        expertise_code:
                          expertiseCode,
                      }),
                    ),
                });
            }
          },
        );

      return this.findOneAdmin(
        id,
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
    const project =
      await this.prisma
        .projects
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
      !project
    ) {
      throw new NotFoundException(
        'Réalisation introuvable.',
      );
    }

    try {
      await this.prisma
        .projects
        .delete({
          where: {
            id,
          },
        });

      return {
        success:
          true,

        message:
          'La réalisation a été supprimée.',
      };
    } catch (
      error
    ) {
      this.handlePrismaError(
        error,
      );
    }
  }

  async getExpertiseOptions() {
    return [
      'digital',
      'automation',
      'data',
      'ai',
      'crm',
      'architecture',
      'analytics',
      'leadGeneration',
      'marketingStrategy',
    ];
  }

  private async ensureClientExists(
    clientId:
      string,
  ) {
    const client =
      await this.prisma
        .clients
        .findUnique({
          where: {
            id:
              clientId,
          },

          select: {
            id:
              true,

            is_active:
              true,
          },
        });

    if (
      !client
    ) {
      throw new BadRequestException(
        'Le client sélectionné est introuvable.',
      );
    }
  }

  private async findProjectIdsByExpertise(
    expertise:
      ProjectExpertiseCode,
  ) {
    const relations =
      await this.prisma
        .project_expertise
        .findMany({
          where: {
            expertise_code:
              expertise,
          },

          select: {
            project_id:
              true,
          },
        });

    return relations.map(
      (
        relation,
      ) =>
        relation.project_id,
    );
  }

  private async hydrateProjects(
    projects:
      ProjectDatabaseRow[],
  ) {
    if (
      projects.length ===
      0
    ) {
      return [];
    }

    const projectIds =
      projects.map(
        (
          project,
        ) =>
          project.id,
      );

    const clientIds =
      [
        ...new Set(
          projects.map(
            (
              project,
            ) =>
              project.client_id,
          ),
        ),
      ];

    const [
      clients,
      expertiseRelations,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .clients
            .findMany({
              where: {
                id: {
                  in:
                    clientIds,
                },
              },
            }),

          this.prisma
            .project_expertise
            .findMany({
              where: {
                project_id: {
                  in:
                    projectIds,
                },
              },

              orderBy: {
                created_at:
                  'asc',
              },
            }),
        ]);

    const clientById =
      new Map<
        string,
        ClientDatabaseRow
      >(
        clients.map(
          (
            client,
          ) => [
            client.id,
            client,
          ],
        ),
      );

    const expertiseByProjectId =
      new Map<
        string,
        ProjectExpertiseCode[]
      >();

    for (
      const relation of
      expertiseRelations
    ) {
      const currentValues =
        expertiseByProjectId.get(
          relation.project_id,
        ) ??
        [];

      currentValues.push(
        relation.expertise_code as ProjectExpertiseCode,
      );

      expertiseByProjectId.set(
        relation.project_id,
        currentValues,
      );
    }

    return projects
      .map(
        (
          project,
        ) => {
          const client =
            clientById.get(
              project.client_id,
            );

          if (
            !client
          ) {
            return null;
          }

          return {
            project,

            client,

            expertiseCodes:
              expertiseByProjectId.get(
                project.id,
              ) ??
              [],
          };
        },
      )
      .filter(
        (
          value,
        ): value is {
          project:
            ProjectDatabaseRow;

          client:
            ClientDatabaseRow;

          expertiseCodes:
            ProjectExpertiseCode[];
        } =>
          value !==
          null,
      );
  }

  private mapAdminProject(
    project:
      ProjectDatabaseRow,

    client:
      ClientDatabaseRow,

    expertiseCodes:
      ProjectExpertiseCode[],
  ) {
    return {
      id:
        project.id,

      clientId:
        project.client_id,

      client: {
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

        isActive:
          client.is_active,
      },

      titleFr:
        project.title_fr,

      titleEn:
        project.title_en,

      titleAr:
        project.title_ar,

      descriptionFr:
        project.description_fr,

      descriptionEn:
        project.description_en,

      descriptionAr:
        project.description_ar,

      expertiseCodes,

      status:
        project.status,

      sortOrder:
        project.sort_order,

      publishedAt:
        project.published_at,

      createdByUserId:
        project.created_by_user_id,

      createdAt:
        project.created_at,

      updatedAt:
        project.updated_at,
    };
  }

  private mapPublicProject(
    project:
      ProjectDatabaseRow,

    client:
      ClientDatabaseRow,

    expertiseCodes:
      ProjectExpertiseCode[],

    locale:
      PublicLocale,
  ) {
    return {
      id:
        project.id,

      title:
        this.resolveLocalizedValue(
          locale,
          project.title_fr,
          project.title_en,
          project.title_ar,
        ),

      description:
        this.resolveLocalizedValue(
          locale,
          project.description_fr,
          project.description_en,
          project.description_ar,
        ),

      expertiseCodes,

      client: {
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
              `Logo ${client.name}`,
            client.logo_alt_en,
            client.logo_alt_ar,
          ),
      },

      publishedAt:
        project.published_at,
    };
  }

  private resolvePublishedAt(
    previousStatus:
      ProjectStatus,

    nextStatus:
      ProjectStatus,

    currentPublishedAt:
      Date | null,
  ) {
    if (
      nextStatus !==
      'PUBLISHED'
    ) {
      return null;
    }

    if (
      previousStatus ===
        'PUBLISHED' &&
      currentPublishedAt
    ) {
      return currentPublishedAt;
    }

    return new Date();
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
          'Cette association existe déjà.',
        );
      }

      if (
        error.code ===
        'P2003'
      ) {
        throw new BadRequestException(
          'Le client ou le domaine d’expertise associé est invalide.',
        );
      }

      if (
        error.code ===
        'P2025'
      ) {
        throw new NotFoundException(
          'Réalisation introuvable.',
        );
      }
    }

    throw error;
  }
}