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
  CONTACT_REQUEST_ALLOWED_TRANSITIONS,
  CONTACT_REQUEST_SERVICE_CODES,
  CONTACT_REQUEST_SOURCES,
  CONTACT_REQUEST_STATUSES,
} from './contact-request.constants';

import type {
  ContactRequestStatus,
} from './contact-request.constants';

import {
  AdminContactRequestQueryDto,
} from './dto/admin-contact-request-query.dto';

import {
  CreateContactRequestDto,
} from './dto/create-contact-request.dto';

import {
  UpdateContactRequestAdminDto,
} from './dto/update-contact-request-admin.dto';

import {
  UpdateContactRequestLinksDto,
} from './dto/update-contact-request-links.dto';

import {
  UpdateContactRequestStatusDto,
} from './dto/update-contact-request-status.dto';

import {
  TelegramNotificationService,
} from '../notifications/telegram-notification.service';

@Injectable()
export class ContactRequestsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly telegramNotificationService:
      TelegramNotificationService,
  ) {}

  /**
   * Enregistre une nouvelle demande provenant
   * d'une page publique du site.
   *
   * Le visiteur ne peut définir ni le statut,
   * ni l'affectation, ni les notes internes.
   */
  async createPublic(
    dto:
      CreateContactRequestDto,

    userAgent?:
      string,
  ) {
    this.validateHoneypot(
      dto.website,
    );

    this.validatePrivacyConsent(
      dto.privacyConsent,
    );

    const availabilities =
      dto.availabilities ??
      [];

    this.validateAppointmentAvailabilities(
      dto.wantsAppointment,
      availabilities,
    );

    const createdRequest =
      await this.prisma
        .$transaction(
          async (
            transaction,
          ) => {
            return transaction
              .contact_requests
              .create({
                data: {
                  source:
                    dto.source,

                  locale:
                    dto.locale,

                  first_name:
                    dto.firstName,

                  last_name:
                    dto.lastName,

                  company_name:
                    dto.companyName,

                  job_title:
                    dto.jobTitle,

                  need_description:
                    dto.needDescription,

                  phone_number:
                    dto.phoneNumber,

                  email:
                    dto.email,

                  status:
                    'RECEIVED',

                  wants_appointment:
                    dto.wantsAppointment,

                  privacy_consent:
                    true,

                  privacy_consent_at:
                    new Date(),

                  user_agent:
                    this.normalizeUserAgent(
                      userAgent,
                    ),

                  ...(availabilities.length >
                  0
                    ? {
                        contact_request_availabilities: {
                          create:
                            availabilities.map(
                              (
                                availability,
                                index,
                              ) => ({
                                starts_at:
                                  new Date(
                                    availability.startsAt,
                                  ),

                                ends_at:
                                  new Date(
                                    availability.endsAt,
                                  ),

                                timezone:
                                  availability.timezone ??
                                  'Africa/Casablanca',

                                note:
                                  availability.note ??
                                  null,

                                sort_order:
                                  index,
                              }),
                            ),
                        },
                      }
                    : {}),
                },

                select: {
                  id:
                    true,

                  status:
                    true,

                  source:
                    true,

                  created_at:
                    true,
                },
              });
          },
        );
    await this.telegramNotificationService
      .notifyNewContactRequest({
        id:
          createdRequest.id,

        createdAt:
          createdRequest.created_at,

        contact:
          dto,
      });        

    return {
      message:
        'Votre demande a bien été enregistrée.',

      request: {
        id:
          createdRequest.id,

        status:
          createdRequest.status,

        source:
          createdRequest.source,

        createdAt:
          createdRequest.created_at,
      },
    };
  }

  /**
   * Retourne la liste paginée des demandes
   * pour l'administration.
   */
  async findAllAdmin(
    query:
      AdminContactRequestQueryDto,
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
      query.search?.trim();

    const where:
      Prisma.contact_requestsWhereInput =
      {
        archived_at:
          null,

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),

        ...(query.source
          ? {
              source:
                query.source,
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
                  job_title: {
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
            .contact_requests
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

                source:
                  true,

                locale:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                company_name:
                  true,

                job_title:
                  true,

                phone_number:
                  true,

                email:
                  true,

                status:
                  true,

                status_changed_at:
                  true,

                wants_appointment:
                  true,

                created_at:
                  true,

                updated_at:
                  true,

                assigned_to_user_id:
                  true,

                users_contact_requests_assigned_to_user_idTousers: {
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
                },

                _count: {
                  select: {
                    contact_request_availabilities:
                      true,

                    contact_request_project_links:
                      true,

                    contact_request_service_links:
                      true,
                  },
                },
              },
            }),

          this.prisma
            .contact_requests
            .count({
              where,
            }),
        ]);

    return {
      items:
        requests.map(
          (
            request,
          ) => ({
            id:
              request.id,

            source:
              request.source,

            locale:
              request.locale,

            firstName:
              request.first_name,

            lastName:
              request.last_name,

            fullName:
              this.buildFullName(
                request.first_name,
                request.last_name,
              ),

            companyName:
              request.company_name,

            jobTitle:
              request.job_title,

            phoneNumber:
              request.phone_number,

            email:
              request.email,

            status:
              request.status,

            statusChangedAt:
              request.status_changed_at,

            wantsAppointment:
              request.wants_appointment,

            createdAt:
              request.created_at,

            updatedAt:
              request.updated_at,

            assignedTo:
              this.mapUserSummary(
                request
                  .users_contact_requests_assigned_to_user_idTousers,
              ),

            counters: {
              availabilities:
                request._count
                  .contact_request_availabilities,

              projects:
                request._count
                  .contact_request_project_links,

              services:
                request._count
                  .contact_request_service_links,
            },
          }),
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

  /**
   * Retourne toutes les données nécessaires
   * aux listes déroulantes de l'administration.
   */
  async getAdminOptions() {
    const [
      administrators,
      projects,
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
            .projects
            .findMany({
              where: {
                status:
                  'PUBLISHED',

                clients: {
                  is: {
                    is_active:
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
                  published_at:
                    'desc',
                },

                {
                  created_at:
                    'desc',
                },
              ],

              select: {
                id:
                  true,

                title_fr:
                  true,

                title_en:
                  true,

                title_ar:
                  true,

                status:
                  true,

                clients: {
                  select: {
                    id:
                      true,

                    name:
                      true,

                    is_active:
                      true,
                  },
                },
              },
            }),
        ]);

    return {
      statuses:
        CONTACT_REQUEST_STATUSES,

      sources:
        CONTACT_REQUEST_SOURCES,

      serviceCodes:
        CONTACT_REQUEST_SERVICE_CODES,

      administrators:
        administrators.map(
          (
            administrator,
          ) => ({
            id:
              administrator.id,

            email:
              administrator.email,

            firstName:
              administrator.first_name,

            lastName:
              administrator.last_name,

            fullName:
              this.buildUserDisplayName(
                administrator,
              ),
          }),
        ),

      projects:
        projects.map(
          (
            project,
          ) => ({
            id:
              project.id,

            status:
              project.status,

            title: {
              fr:
                project.title_fr,

              en:
                project.title_en,

              ar:
                project.title_ar,
            },

            client: {
              id:
                project.clients.id,

              name:
                project.clients.name,
            },
          }),
        ),
    };
  }

  /**
   * Retourne le détail complet d'une demande.
   */
  async findOneAdmin(
    id:
      string,
  ) {
    const request =
      await this.prisma
        .contact_requests
        .findFirst({
          where: {
            id,

            archived_at:
              null,
          },

          select: {
            id:
              true,

            source:
              true,

            locale:
              true,

            first_name:
              true,

            last_name:
              true,

            company_name:
              true,

            job_title:
              true,

            need_description:
              true,

            phone_number:
              true,

            email:
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

            wants_appointment:
              true,

            privacy_consent:
              true,

            privacy_consent_at:
              true,

            created_at:
              true,

            updated_at:
              true,

            users_contact_requests_assigned_to_user_idTousers: {
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
            },

            users_contact_requests_updated_by_user_idTousers: {
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
            },

            contact_request_availabilities: {
              orderBy: [
                {
                  sort_order:
                    'asc',
                },

                {
                  starts_at:
                    'asc',
                },
              ],

              select: {
                id:
                  true,

                starts_at:
                  true,

                ends_at:
                  true,

                timezone:
                  true,

                note:
                  true,

                sort_order:
                  true,

                created_at:
                  true,
              },
            },

            contact_request_service_links: {
              orderBy: {
                created_at:
                  'asc',
              },

              select: {
                service_code:
                  true,

                created_at:
                  true,

                users: {
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
                },
              },
            },

            contact_request_project_links: {
              orderBy: {
                created_at:
                  'asc',
              },

              select: {
                created_at:
                  true,

                projects: {
                  select: {
                    id:
                      true,

                    title_fr:
                      true,

                    title_en:
                      true,

                    title_ar:
                      true,

                    status:
                      true,

                    clients: {
                      select: {
                        id:
                          true,

                        name:
                          true,
                      },
                    },
                  },
                },

                users: {
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
                },
              },
            },

            contact_request_status_history: {
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

                change_note:
                  true,

                created_at:
                  true,

                users: {
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
                },
              },
            },
          },
        });

    if (
      !request
    ) {
      throw new NotFoundException(
        'La demande de contact est introuvable.',
      );
    }

    const currentStatus =
      request.status as ContactRequestStatus;

    return {
      id:
        request.id,

      source:
        request.source,

      locale:
        request.locale,

      firstName:
        request.first_name,

      lastName:
        request.last_name,

      fullName:
        this.buildFullName(
          request.first_name,
          request.last_name,
        ),

      companyName:
        request.company_name,

      jobTitle:
        request.job_title,

      needDescription:
        request.need_description,

      phoneNumber:
        request.phone_number,

      email:
        request.email,

      status:
        currentStatus,

      allowedNextStatuses:
        CONTACT_REQUEST_ALLOWED_TRANSITIONS[
          currentStatus
        ] ??
        [],

      statusChangedAt:
        request.status_changed_at,

      internalNote:
        request.internal_note,

      wantsAppointment:
        request.wants_appointment,

      privacyConsent:
        request.privacy_consent,

      privacyConsentAt:
        request.privacy_consent_at,

      createdAt:
        request.created_at,

      updatedAt:
        request.updated_at,

      assignedTo:
        this.mapUserSummary(
          request
            .users_contact_requests_assigned_to_user_idTousers,
        ),

      lastUpdatedBy:
        this.mapUserSummary(
          request
            .users_contact_requests_updated_by_user_idTousers,
        ),

      availabilities:
        request
          .contact_request_availabilities
          .map(
            (
              availability,
            ) => ({
              id:
                availability.id,

              startsAt:
                availability.starts_at,

              endsAt:
                availability.ends_at,

              timezone:
                availability.timezone,

              note:
                availability.note,

              sortOrder:
                availability.sort_order,

              createdAt:
                availability.created_at,
            }),
          ),

      services:
        request
          .contact_request_service_links
          .map(
            (
              link,
            ) => ({
              code:
                link.service_code,

              linkedAt:
                link.created_at,

              linkedBy:
                this.mapUserSummary(
                  link.users,
                ),
            }),
          ),

      projects:
        request
          .contact_request_project_links
          .map(
            (
              link,
            ) => ({
              id:
                link.projects.id,

              status:
                link.projects.status,

              title: {
                fr:
                  link.projects
                    .title_fr,

                en:
                  link.projects
                    .title_en,

                ar:
                  link.projects
                    .title_ar,
              },

              client: {
                id:
                  link.projects
                    .clients.id,

                name:
                  link.projects
                    .clients.name,
              },

              linkedAt:
                link.created_at,

              linkedBy:
                this.mapUserSummary(
                  link.users,
                ),
            }),
          ),

      statusHistory:
        request
          .contact_request_status_history
          .map(
            (
              history,
            ) => ({
              id:
                history.id,

              previousStatus:
                history.previous_status,

              newStatus:
                history.new_status,

              note:
                history.change_note,

              changedAt:
                history.created_at,

              changedBy:
                this.mapUserSummary(
                  history.users,
                ),
            }),
          ),
    };
  }

  /**
   * Change le statut en respectant strictement
   * la progression métier.
   */
  async updateStatus(
    id:
      string,

    dto:
      UpdateContactRequestStatusDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingRequest =
      await this.findExistingRequestForUpdate(
        id,
      );

    const currentStatus =
      existingRequest.status as ContactRequestStatus;

    const newStatus =
      dto.status;

    if (
      currentStatus ===
      newStatus
    ) {
      throw new BadRequestException(
        'La demande possède déjà ce statut.',
      );
    }

    const allowedStatuses =
      CONTACT_REQUEST_ALLOWED_TRANSITIONS[
        currentStatus
      ] ??
      [];

    if (
      !allowedStatuses.includes(
        newStatus,
      )
    ) {
      throw new BadRequestException(
        `La transition du statut ${currentStatus} vers ${newStatus} est interdite.`,
      );
    }

    await this.prisma
      .$transaction(
        async (
          transaction,
        ) => {
          await transaction
            .contact_requests
            .update({
              where: {
                id,
              },

              data: {
                status:
                  newStatus,

                updated_by_user_id:
                  currentUser.id,
              },
            });

          /*
           * Le trigger PostgreSQL crée automatiquement
           * l'entrée d'historique.
           *
           * Nous récupérons cette entrée pour lui ajouter
           * la note facultative fournie par l'administrateur.
           */
          if (
            dto.note
          ) {
            const historyEntry =
              await transaction
                .contact_request_status_history
                .findFirst({
                  where: {
                    contact_request_id:
                      id,

                    previous_status:
                      currentStatus,

                    new_status:
                      newStatus,

                    changed_by_user_id:
                      currentUser.id,

                    change_note:
                      null,
                  },

                  orderBy: {
                    created_at:
                      'desc',
                  },

                  select: {
                    id:
                      true,
                  },
                });

            if (
              historyEntry
            ) {
              await transaction
                .contact_request_status_history
                .update({
                  where: {
                    id:
                      historyEntry.id,
                  },

                  data: {
                    change_note:
                      dto.note,
                  },
                });
            }
          }
        },
      );

    return this.findOneAdmin(
      id,
    );
  }

  /**
   * Met à jour l'affectation et la note interne.
   */
  async updateAdminFields(
    id:
      string,

    dto:
      UpdateContactRequestAdminDto,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.findExistingRequestForUpdate(
      id,
    );

    if (
      dto.assignedToUserId
    ) {
      await this.ensureAssignableAdministratorExists(
        dto.assignedToUserId,
      );
    }

const data:
  Prisma.contact_requestsUncheckedUpdateInput =
  {
    updated_by_user_id:
      currentUser.id,
  };

    if (
      Object.prototype.hasOwnProperty.call(
        dto,
        'assignedToUserId',
      )
    ) {
      data.assigned_to_user_id =
        dto.assignedToUserId ??
        null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        dto,
        'internalNote',
      )
    ) {
      data.internal_note =
        dto.internalNote ??
        null;
    }

    await this.prisma
      .contact_requests
      .update({
        where: {
          id,
        },

        data,
      });

    return this.findOneAdmin(
      id,
    );
  }

  /**
   * Remplace les associations de la demande
   * avec les services et projets.
   */
  async updateLinks(
    id:
      string,

    dto:
      UpdateContactRequestLinksDto,

    currentUser:
      AuthenticatedUser,
  ) {
    await this.findExistingRequestForUpdate(
      id,
    );

    await this.validateProjectIds(
      dto.projectIds,
    );

    await this.prisma
      .$transaction(
        async (
          transaction,
        ) => {
          await transaction
            .contact_request_service_links
            .deleteMany({
              where: {
                contact_request_id:
                  id,
              },
            });

          await transaction
            .contact_request_project_links
            .deleteMany({
              where: {
                contact_request_id:
                  id,
              },
            });

          if (
            dto.serviceCodes.length >
            0
          ) {
            await transaction
              .contact_request_service_links
              .createMany({
                data:
                  dto.serviceCodes.map(
                    (
                      serviceCode,
                    ) => ({
                      contact_request_id:
                        id,

                      service_code:
                        serviceCode,

                      linked_by_user_id:
                        currentUser.id,
                    }),
                  ),
              });
          }

          if (
            dto.projectIds.length >
            0
          ) {
            await transaction
              .contact_request_project_links
              .createMany({
                data:
                  dto.projectIds.map(
                    (
                      projectId,
                    ) => ({
                      contact_request_id:
                        id,

                      project_id:
                        projectId,

                      linked_by_user_id:
                        currentUser.id,
                    }),
                  ),
              });
          }

          await transaction
            .contact_requests
            .update({
              where: {
                id,
              },

              data: {
                updated_by_user_id:
                  currentUser.id,
              },
            });
        },
      );

    return this.findOneAdmin(
      id,
    );
  }

  private async findExistingRequestForUpdate(
    id:
      string,
  ) {
    const request =
      await this.prisma
        .contact_requests
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
      !request
    ) {
      throw new NotFoundException(
        'La demande de contact est introuvable.',
      );
    }

    return request;
  }

  private async ensureAssignableAdministratorExists(
    userId:
      string,
  ) {
    const administrator =
      await this.prisma
        .users
        .findFirst({
          where: {
            id:
              userId,

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
      !administrator
    ) {
      throw new BadRequestException(
        'L’administrateur sélectionné est invalide ou inactif.',
      );
    }
  }

  private async validateProjectIds(
    projectIds:
      string[],
  ) {
    if (
      projectIds.length ===
      0
    ) {
      return;
    }

    const projects =
      await this.prisma
        .projects
        .findMany({
          where: {
            id: {
              in:
                projectIds,
            },

            status:
              'PUBLISHED',

            clients: {
              is: {
                is_active:
                  true,
              },
            },
          },

          select: {
            id:
              true,
          },
        });

    const existingProjectIds =
      new Set(
        projects.map(
          (
            project,
          ) =>
            project.id,
        ),
      );

    const missingProjectIds =
      projectIds.filter(
        (
          projectId,
        ) =>
          !existingProjectIds.has(
            projectId,
          ),
      );

    if (
      missingProjectIds.length >
      0
    ) {
      throw new BadRequestException(
        'Un ou plusieurs projets sélectionnés sont introuvables, inactifs ou non publiés.',
      );
    }
  }

  private validateHoneypot(
    website?:
      string,
  ) {
    if (
      website &&
      website.trim().length >
        0
    ) {
      throw new BadRequestException(
        'La demande ne peut pas être envoyée.',
      );
    }
  }

  private validatePrivacyConsent(
    privacyConsent:
      boolean,
  ) {
    if (
      privacyConsent !==
      true
    ) {
      throw new BadRequestException(
        'Vous devez accepter la politique de confidentialité avant d’envoyer la demande.',
      );
    }
  }

  private validateAppointmentAvailabilities(
    wantsAppointment:
      boolean,

    availabilities:
      CreateContactRequestDto['availabilities'] extends
        infer T
        ? NonNullable<T>
        : never,
  ) {
    if (
      !wantsAppointment &&
      availabilities.length >
        0
    ) {
      throw new BadRequestException(
        'Des disponibilités ne peuvent être proposées que lorsqu’un rendez-vous est demandé.',
      );
    }

    if (
      wantsAppointment &&
      availabilities.length ===
        0
    ) {
      throw new BadRequestException(
        'Veuillez proposer au moins une disponibilité pour le rendez-vous.',
      );
    }

    const now =
      new Date();

    const normalizedRanges =
      availabilities.map(
        (
          availability,
        ) => {
          const startsAt =
            new Date(
              availability.startsAt,
            );

          const endsAt =
            new Date(
              availability.endsAt,
            );

          if (
            Number.isNaN(
              startsAt.getTime(),
            ) ||
            Number.isNaN(
              endsAt.getTime(),
            )
          ) {
            throw new BadRequestException(
              'Une disponibilité contient une date invalide.',
            );
          }

          if (
            endsAt <=
            startsAt
          ) {
            throw new BadRequestException(
              'La fin d’une disponibilité doit être postérieure à son début.',
            );
          }

          if (
            startsAt <=
            now
          ) {
            throw new BadRequestException(
              'Les disponibilités proposées doivent être situées dans le futur.',
            );
          }

          const durationInMilliseconds =
            endsAt.getTime() -
            startsAt.getTime();

          const maximumDuration =
            12 *
            60 *
            60 *
            1000;

          if (
            durationInMilliseconds >
            maximumDuration
          ) {
            throw new BadRequestException(
              'Une disponibilité ne peut pas dépasser douze heures.',
            );
          }

          return {
            startsAt,

            endsAt,
          };
        },
      );

    const sortedRanges =
      normalizedRanges.sort(
        (
          first,
          second,
        ) =>
          first.startsAt.getTime() -
          second.startsAt.getTime(),
      );

    for (
      let index =
        1;
      index <
      sortedRanges.length;
      index +=
        1
    ) {
      const previousRange =
        sortedRanges[
          index -
          1
        ];

      const currentRange =
        sortedRanges[
          index
        ];

      if (
        currentRange.startsAt <
        previousRange.endsAt
      ) {
        throw new BadRequestException(
          'Les disponibilités proposées ne doivent pas se chevaucher.',
        );
      }
    }
  }

  private normalizeUserAgent(
    userAgent?:
      string,
  ) {
    if (
      !userAgent
    ) {
      return null;
    }

    const normalized =
      userAgent.trim();

    if (
      normalized.length ===
      0
    ) {
      return null;
    }

    return normalized.slice(
      0,
      1000,
    );
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
      );
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
    const fullName =
      [
        user.first_name,
        user.last_name,
      ]
        .filter(
          (
            value,
          ) =>
            Boolean(
              value?.trim(),
            ),
        )
        .join(
          ' ',
        );

    return fullName ||
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
      | null,
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
}