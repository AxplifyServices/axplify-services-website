import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

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
  AdminReviewQueryDto,
} from './dto/admin-review-query.dto';

import {
  CreateReviewInvitationDto,
} from './dto/create-review-invitation.dto';

import {
  CreateReviewDto,
} from './dto/create-review.dto';

import {
  PublicReviewQueryDto,
} from './dto/public-review-query.dto';

import {
  UpdateReviewModerationDto,
} from './dto/update-review-moderation.dto';

import type {
  ReviewLocale,
  ReviewStatus,
} from './review.constants';

/*
 * =========================================================
 * TYPES INTERNES
 * =========================================================
 */

type ReviewProjectRow = {
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

  status:
    string;
};

type ReviewClientRow = {
  id:
    string;

  name:
    string;

  is_active:
    boolean;
};

type ReviewProjectSummary = {
  id:
    string;

  clientId:
    string;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  status:
    string;

  client: {
    id:
      string;

    name:
      string;

    isActive:
      boolean;
  } | null;
};

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  /*
   * =========================================================
   * PUBLIC — LISTE DES REVIEWS
   * =========================================================
   */

  async findPublic(
    query:
      PublicReviewQueryDto,
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

    const where:
      Prisma.reviewsWhereInput =
      {
        status:
          'PUBLISHED',
      };

    const [
      reviews,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .reviews
            .findMany({
              where,

              orderBy: [
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
            .reviews
            .count({
              where,
            }),
        ]);

    const projects =
      await this.hydrateReviewProjects(
        reviews
          .map(
            review =>
              review.project_id,
          )
          .filter(
            (
              projectId,
            ): projectId is string =>
              Boolean(
                projectId,
              ),
          ),
      );

    return {
      items:
        reviews.map(
          review =>
            this.mapPublicReview(
              review,
              review.project_id
                ? projects.get(
                    review.project_id,
                  ) ??
                  null
                : null,
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

  /*
   * =========================================================
   * PUBLIC — REVIEWS SÉLECTIONNÉES POUR LA HOME
   * =========================================================
   */

  async findHomepage() {
    const reviews =
      await this.prisma
        .reviews
        .findMany({
          where: {
            status:
              'PUBLISHED',

            show_on_homepage:
              true,
          },

          orderBy: [
            {
              homepage_sort_order:
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
        });

    const projects =
      await this.hydrateReviewProjects(
        reviews
          .map(
            review =>
              review.project_id,
          )
          .filter(
            (
              projectId,
            ): projectId is string =>
              Boolean(
                projectId,
              ),
          ),
      );

    return {
      items:
        reviews.map(
          review =>
            this.mapPublicReview(
              review,
              review.project_id
                ? projects.get(
                    review.project_id,
                  ) ??
                  null
                : null,
            ),
        ),
    };
  }

  /*
   * =========================================================
   * PUBLIC — VALIDATION DU LIEN D'INVITATION
   * =========================================================
   */

  async validatePublicInvitation(
    token:
      string,
  ) {
    const invitation =
      await this.findUsableInvitation(
        token,
      );

    const project =
      invitation.project_id
        ? await this.findProjectSummary(
            invitation.project_id,
          )
        : null;

    return {
      valid:
        true,

      invitation: {
        expiresAt:
          invitation.expires_at,

        project:
          project
            ? {
                id:
                  project.id,

                titleFr:
                  project.titleFr,

                titleEn:
                  project.titleEn,

                titleAr:
                  project.titleAr,

                client:
                  project.client
                    ? {
                        id:
                          project.client.id,

                        name:
                          project.client.name,
                      }
                    : null,
              }
            : null,
      },
    };
  }

  /*
   * =========================================================
   * PUBLIC — SOUMISSION D'UNE REVIEW
   * =========================================================
   */

  async submitPublicReview(
    token:
      string,

    dto:
      CreateReviewDto,
  ) {
    const normalizedToken =
      this.normalizeToken(
        token,
      );

    const tokenHash =
      this.hashToken(
        normalizedToken,
      );

    const now =
      new Date();

    const createdReview =
      await this.prisma
        .$transaction(
          async (
            transaction,
          ) => {
            /*
             * On relit l'invitation dans la transaction.
             *
             * Cela empêche deux soumissions concurrentes
             * d'utiliser proprement le même lien.
             */
            const invitation =
              await transaction
                .review_invitations
                .findUnique({
                  where: {
                    token_hash:
                      tokenHash,
                  },
                });

            if (
              !invitation
            ) {
              throw new NotFoundException(
                'Ce lien d’avis est invalide ou n’est plus disponible.',
              );
            }

            if (
              invitation.revoked_at
            ) {
              throw new BadRequestException(
                'Ce lien d’avis n’est plus disponible.',
              );
            }

            if (
              invitation.used_at
            ) {
              throw new ConflictException(
                'Un avis a déjà été envoyé avec ce lien.',
              );
            }

            if (
              invitation.expires_at.getTime() <=
              now.getTime()
            ) {
              throw new BadRequestException(
                'Ce lien d’avis a expiré.',
              );
            }

            /*
             * On tente de consommer l'invitation.
             *
             * updateMany est volontaire :
             * la condition used_at = null garantit qu'une seule
             * requête concurrente peut réellement gagner.
             */
            const consumedInvitation =
              await transaction
                .review_invitations
                .updateMany({
                  where: {
                    id:
                      invitation.id,

                    used_at:
                      null,

                    revoked_at:
                      null,

                    expires_at: {
                      gt:
                        now,
                    },
                  },

                  data: {
                    used_at:
                      now,
                  },
                });

            if (
              consumedInvitation.count !==
              1
            ) {
              throw new ConflictException(
                'Ce lien d’avis a déjà été utilisé ou n’est plus disponible.',
              );
            }

            /*
             * Le projet proposé par l'invitation devient
             * automatiquement le projet initial de la review.
             *
             * L'administrateur pourra ensuite le modifier.
             */
            const review =
              await transaction
                .reviews
                .create({
                  data: {
                    invitation_id:
                      invitation.id,

                    project_id:
                      invitation.project_id,

                    rating:
                      dto.rating,

                    comment:
                      dto.comment.trim(),

                    first_name:
                      dto.firstName.trim(),

                    last_name:
                      dto.lastName.trim(),

                    company_name:
                      dto.companyName.trim(),

                    company_role:
                      dto.companyRole.trim(),

                    locale:
                      dto.locale,

                    status:
                      'PENDING_REVIEW',

                    show_on_homepage:
                      false,

                    homepage_sort_order:
                      0,

                    published_at:
                      null,

                    published_by_user_id:
                      null,
                  },
                });

            return review;
          },
        );

    return {
      message:
        'Merci. Votre avis a bien été envoyé et sera examiné avant publication.',

      review: {
        id:
          createdReview.id,

        status:
          createdReview.status,

        createdAt:
          createdReview.created_at,
      },
    };
  }

  /*
   * =========================================================
   * ADMIN — LISTE PAGINÉE
   * =========================================================
   */

  async findAllAdmin(
    query:
      AdminReviewQueryDto,
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
      Prisma.reviewsWhereInput =
      {
        ...(query.status
          ? {
              status:
                query.status,
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
                  company_role: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },

                {
                  comment: {
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
      reviews,
      total,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .reviews
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
            }),

          this.prisma
            .reviews
            .count({
              where,
            }),
        ]);

    const projects =
      await this.hydrateReviewProjects(
        reviews
          .map(
            review =>
              review.project_id,
          )
          .filter(
            (
              projectId,
            ): projectId is string =>
              Boolean(
                projectId,
              ),
          ),
      );

    return {
      items:
        reviews.map(
          review =>
            this.mapAdminReview(
              review,
              review.project_id
                ? projects.get(
                    review.project_id,
                  ) ??
                  null
                : null,
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

  /*
   * =========================================================
   * ADMIN — DÉTAIL D'UNE REVIEW
   * =========================================================
   */

  async findOneAdmin(
    id:
      string,
  ) {
    const review =
      await this.prisma
        .reviews
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !review
    ) {
      throw new NotFoundException(
        'Avis introuvable.',
      );
    }

    const project =
      review.project_id
        ? await this.findProjectSummary(
            review.project_id,
          )
        : null;

    const invitation =
      await this.prisma
        .review_invitations
        .findUnique({
          where: {
            id:
              review.invitation_id,
          },

          select: {
            id:
              true,

            expires_at:
              true,

            used_at:
              true,

            revoked_at:
              true,

            created_at:
              true,
          },
        });

    return {
      ...this.mapAdminReview(
        review,
        project,
      ),

      invitation:
        invitation
          ? {
              id:
                invitation.id,

              expiresAt:
                invitation.expires_at,

              usedAt:
                invitation.used_at,

              revokedAt:
                invitation.revoked_at,

              createdAt:
                invitation.created_at,
            }
          : null,
    };
  }

  /*
   * =========================================================
   * ADMIN — CRÉATION D'UNE INVITATION
   * =========================================================
   */

  async createInvitation(
    dto:
      CreateReviewInvitationDto,

    currentUser:
      AuthenticatedUser,
  ) {
    if (
      dto.projectId
    ) {
      await this.assertProjectExists(
        dto.projectId,
      );
    }

    const expiresInDays =
      dto.expiresInDays ??
      30;

    const token =
      this.generateToken();

    const tokenHash =
      this.hashToken(
        token,
      );

    const expiresAt =
      new Date();

    expiresAt.setUTCDate(
      expiresAt.getUTCDate() +
        expiresInDays,
    );

    const invitation =
      await this.prisma
        .review_invitations
        .create({
          data: {
            token_hash:
              tokenHash,

            project_id:
              dto.projectId ??
              null,

            expires_at:
              expiresAt,

            used_at:
              null,

            revoked_at:
              null,

            created_by_user_id:
              currentUser.id,
          },
        });

    const project =
      invitation.project_id
        ? await this.findProjectSummary(
            invitation.project_id,
          )
        : null;

    /*
     * IMPORTANT :
     *
     * token est volontairement renvoyé une seule fois ici.
     * La base ne conserve que token_hash.
     *
     * Le frontend devra construire l'URL complète à partir
     * de ce token.
     */
    return {
      message:
        'Le lien privé de dépôt d’avis a été créé.',

      invitation: {
        id:
          invitation.id,

        token,

        expiresAt:
          invitation.expires_at,

        createdAt:
          invitation.created_at,

        project:
          project
            ? this.mapAdminProjectSummary(
                project,
              )
            : null,
      },
    };
  }

  /*
   * =========================================================
   * ADMIN — RÉVOCATION D'UNE INVITATION
   * =========================================================
   */

  async revokeInvitation(
    id:
      string,
  ) {
    const invitation =
      await this.prisma
        .review_invitations
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !invitation
    ) {
      throw new NotFoundException(
        'Invitation introuvable.',
      );
    }

    if (
      invitation.used_at
    ) {
      throw new BadRequestException(
        'Cette invitation a déjà été utilisée et ne peut plus être révoquée.',
      );
    }

    if (
      invitation.revoked_at
    ) {
      return {
        message:
          'Cette invitation est déjà révoquée.',

        invitation: {
          id:
            invitation.id,

          revokedAt:
            invitation.revoked_at,
        },
      };
    }

    const updatedInvitation =
      await this.prisma
        .review_invitations
        .update({
          where: {
            id,
          },

          data: {
            revoked_at:
              new Date(),
          },
        });

    return {
      message:
        'L’invitation a été révoquée.',

      invitation: {
        id:
          updatedInvitation.id,

        revokedAt:
          updatedInvitation.revoked_at,
      },
    };
  }

  /*
   * =========================================================
   * ADMIN — MODÉRATION
   * =========================================================
   */

  async updateModeration(
    id:
      string,

    dto:
      UpdateReviewModerationDto,

    currentUser:
      AuthenticatedUser,
  ) {
    const existingReview =
      await this.prisma
        .reviews
        .findUnique({
          where: {
            id,
          },
        });

    if (
      !existingReview
    ) {
      throw new NotFoundException(
        'Avis introuvable.',
      );
    }

    /*
     * Si l'administrateur associe une réalisation,
     * on vérifie réellement qu'elle existe.
     */
    if (
      dto.projectId
    ) {
      await this.assertProjectExists(
        dto.projectId,
      );
    }

    const requestedStatus =
      dto.status ??
      existingReview.status;

    this.validateModerationTransition(
      existingReview.status as ReviewStatus,
      requestedStatus as ReviewStatus,
    );

    /*
     * Détermination de l'état Home final.
     *
     * Il faut raisonner sur l'état final et non uniquement
     * sur dto.showOnHomepage.
     */
    let finalShowOnHomepage =
      dto.showOnHomepage ??
      existingReview.show_on_homepage;

    if (
      requestedStatus !==
      'PUBLISHED'
    ) {
      finalShowOnHomepage =
        false;
    }

    if (
      dto.showOnHomepage ===
        true &&
      requestedStatus !==
        'PUBLISHED'
    ) {
      throw new BadRequestException(
        'Un avis doit être publié avant de pouvoir apparaître sur la page d’accueil.',
      );
    }

    const now =
      new Date();

    let publishedAt =
      existingReview.published_at;

    let publishedByUserId =
      existingReview.published_by_user_id;

    /*
     * Première publication ou republication.
     */
    if (
      requestedStatus ===
        'PUBLISHED' &&
      existingReview.status !==
        'PUBLISHED'
    ) {
      publishedAt =
        now;

      publishedByUserId =
        currentUser.id;
    }

    /*
     * Dès qu'un avis quitte PUBLISHED, les informations
     * de publication sont nettoyées.
     *
     * Cela respecte aussi le CHECK SQL défini dans
     * 015_create_reviews.sql.
     */
    if (
      requestedStatus !==
      'PUBLISHED'
    ) {
      publishedAt =
        null;

      publishedByUserId =
        null;
    }

    await this.prisma
      .reviews
      .update({
        where: {
          id,
        },

        data: {
          ...(dto.projectId !==
          undefined
            ? {
                project_id:
                  dto.projectId,
              }
            : {}),

          status:
            requestedStatus,

          show_on_homepage:
            finalShowOnHomepage,

          ...(dto.homepageSortOrder !==
          undefined
            ? {
                homepage_sort_order:
                  dto.homepageSortOrder,
              }
            : {}),

          published_at:
            publishedAt,

          published_by_user_id:
            publishedByUserId,
        },
      });

    return this.findOneAdmin(
      id,
    );
  }

  /*
   * =========================================================
   * INVITATIONS — HELPERS
   * =========================================================
   */

  private generateToken() {
    /*
     * 32 octets aléatoires = 256 bits.
     *
     * Représentation hexadécimale :
     * 64 caractères dans l'URL.
     */
    return randomBytes(
      32,
    ).toString(
      'hex',
    );
  }

  private hashToken(
    token:
      string,
  ) {
    return createHash(
      'sha256',
    )
      .update(
        token,
        'utf8',
      )
      .digest(
        'hex',
      );
  }

  private normalizeToken(
    token:
      string,
  ) {
    const normalizedToken =
      token
        .trim()
        .toLowerCase();

    /*
     * Les tokens générés par le serveur font exactement
     * 64 caractères hexadécimaux.
     *
     * On rejette immédiatement toute entrée bizarre
     * avant d'interroger la base.
     */
    if (
      !/^[a-f0-9]{64}$/.test(
        normalizedToken,
      )
    ) {
      throw new NotFoundException(
        'Ce lien d’avis est invalide ou n’est plus disponible.',
      );
    }

    return normalizedToken;
  }

  private async findUsableInvitation(
    token:
      string,
  ) {
    const normalizedToken =
      this.normalizeToken(
        token,
      );

    const tokenHash =
      this.hashToken(
        normalizedToken,
      );

    const invitation =
      await this.prisma
        .review_invitations
        .findUnique({
          where: {
            token_hash:
              tokenHash,
          },
        });

    if (
      !invitation
    ) {
      throw new NotFoundException(
        'Ce lien d’avis est invalide ou n’est plus disponible.',
      );
    }

    if (
      invitation.revoked_at
    ) {
      throw new BadRequestException(
        'Ce lien d’avis n’est plus disponible.',
      );
    }

    if (
      invitation.used_at
    ) {
      throw new ConflictException(
        'Un avis a déjà été envoyé avec ce lien.',
      );
    }

    if (
      invitation.expires_at.getTime() <=
      Date.now()
    ) {
      throw new BadRequestException(
        'Ce lien d’avis a expiré.',
      );
    }

    return invitation;
  }

  /*
   * =========================================================
   * PROJETS — HELPERS
   * =========================================================
   */

  private async assertProjectExists(
    projectId:
      string,
  ) {
    const project =
      await this.prisma
        .projects
        .findUnique({
          where: {
            id:
              projectId,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !project
    ) {
      throw new BadRequestException(
        'La réalisation sélectionnée est introuvable.',
      );
    }
  }

  private async findProjectSummary(
    projectId:
      string,
  ): Promise<
    ReviewProjectSummary | null
  > {
    const projects =
      await this.hydrateReviewProjects([
        projectId,
      ]);

    return projects.get(
      projectId,
    ) ??
      null;
  }

  private async hydrateReviewProjects(
    projectIds:
      string[],
  ) {
    const uniqueProjectIds =
      [
        ...new Set(
          projectIds,
        ),
      ];

    const result =
      new Map<
        string,
        ReviewProjectSummary
      >();

    if (
      uniqueProjectIds.length ===
      0
    ) {
      return result;
    }

    const projects:
      ReviewProjectRow[] =
      await this.prisma
        .projects
        .findMany({
          where: {
            id: {
              in:
                uniqueProjectIds,
            },
          },

          select: {
            id:
              true,

            client_id:
              true,

            title_fr:
              true,

            title_en:
              true,

            title_ar:
              true,

            status:
              true,
          },
        });

    const clientIds =
      [
        ...new Set(
          projects.map(
            project =>
              project.client_id,
          ),
        ),
      ];

    const clients:
      ReviewClientRow[] =
      clientIds.length >
      0
        ? await this.prisma
            .clients
            .findMany({
              where: {
                id: {
                  in:
                    clientIds,
                },
              },

              select: {
                id:
                  true,

                name:
                  true,

                is_active:
                  true,
              },
            })
        : [];

    const clientsById =
      new Map(
        clients.map(
          client => [
            client.id,
            client,
          ],
        ),
      );

    for (
      const project
      of projects
    ) {
      const client =
        clientsById.get(
          project.client_id,
        ) ??
        null;

      result.set(
        project.id,
        {
          id:
            project.id,

          clientId:
            project.client_id,

          titleFr:
            project.title_fr,

          titleEn:
            project.title_en,

          titleAr:
            project.title_ar,

          status:
            project.status,

          client:
            client
              ? {
                  id:
                    client.id,

                  name:
                    client.name,

                  isActive:
                    client.is_active,
                }
              : null,
        },
      );
    }

    return result;
  }

  /*
   * =========================================================
   * MODÉRATION — VALIDATION DES TRANSITIONS
   * =========================================================
   */

  private validateModerationTransition(
    currentStatus:
      ReviewStatus,

    requestedStatus:
      ReviewStatus,
  ) {
    if (
      currentStatus ===
      requestedStatus
    ) {
      return;
    }

    const allowedTransitions:
      Record<
        ReviewStatus,
        ReviewStatus[]
      > =
      {
        PENDING_REVIEW: [
          'PUBLISHED',
          'REJECTED',
          'ARCHIVED',
        ],

        PUBLISHED: [
          'ARCHIVED',
          'REJECTED',
        ],

        REJECTED: [
          'PUBLISHED',
          'ARCHIVED',
        ],

        ARCHIVED: [
          'PUBLISHED',
        ],
      };

    const allowed =
      allowedTransitions[
        currentStatus
      ];

    if (
      !allowed.includes(
        requestedStatus,
      )
    ) {
      throw new BadRequestException(
        `Le passage du statut ${currentStatus} vers ${requestedStatus} n’est pas autorisé.`,
      );
    }
  }

  /*
   * =========================================================
   * MAPPING — ADMIN
   * =========================================================
   */

  private mapAdminReview(
    review: {
      id:
        string;

      invitation_id:
        string;

      project_id:
        string | null;

      rating:
        number;

      comment:
        string;

      first_name:
        string;

      last_name:
        string;

      company_name:
        string;

      company_role:
        string;

      locale:
        string;

      status:
        string;

      show_on_homepage:
        boolean;

      homepage_sort_order:
        number;

      published_at:
        Date | null;

      published_by_user_id:
        string | null;

      created_at:
        Date;

      updated_at:
        Date;
    },

    project:
      ReviewProjectSummary | null,
  ) {
    return {
      id:
        review.id,

      invitationId:
        review.invitation_id,

      rating:
        review.rating,

      comment:
        review.comment,

      firstName:
        review.first_name,

      lastName:
        review.last_name,

      companyName:
        review.company_name,

      companyRole:
        review.company_role,

      locale:
        review.locale,

      status:
        review.status,

      showOnHomepage:
        review.show_on_homepage,

      homepageSortOrder:
        review.homepage_sort_order,

      project:
        project
          ? this.mapAdminProjectSummary(
              project,
            )
          : null,

      publishedAt:
        review.published_at,

      publishedByUserId:
        review.published_by_user_id,

      createdAt:
        review.created_at,

      updatedAt:
        review.updated_at,
    };
  }

  private mapAdminProjectSummary(
    project:
      ReviewProjectSummary,
  ) {
    return {
      id:
        project.id,

      titleFr:
        project.titleFr,

      titleEn:
        project.titleEn,

      titleAr:
        project.titleAr,

      status:
        project.status,

      client:
        project.client
          ? {
              id:
                project.client.id,

              name:
                project.client.name,

              isActive:
                project.client.isActive,
            }
          : null,
    };
  }

  /*
   * =========================================================
   * MAPPING — PUBLIC
   * =========================================================
   */

  private mapPublicReview(
    review: {
      id:
        string;

      project_id:
        string | null;

      rating:
        number;

      comment:
        string;

      first_name:
        string;

      last_name:
        string;

      company_name:
        string;

      company_role:
        string;

      locale:
        string;

      published_at:
        Date | null;

      created_at:
        Date;
    },

    project:
      ReviewProjectSummary | null,
  ) {
    /*
     * Une réalisation n'est exposée publiquement
     * que si :
     *
     * - elle est publiée ;
     * - son client est toujours actif.
     *
     * Une review reste publique même si la réalisation
     * associée n'est plus publiable. Dans ce cas, on
     * masque simplement les informations du projet.
     */
    const publicProject =
      project &&
      project.status ===
        'PUBLISHED' &&
      project.client?.isActive
        ? {
            id:
              project.id,

            titleFr:
              project.titleFr,

            titleEn:
              project.titleEn,

            titleAr:
              project.titleAr,

            client: {
              id:
                project.client.id,

              name:
                project.client.name,
            },
          }
        : null;

    return {
      id:
        review.id,

      rating:
        review.rating,

      comment:
        review.comment,

      firstName:
        review.first_name,

      lastName:
        review.last_name,

      companyName:
        review.company_name,

      companyRole:
        review.company_role,

      locale:
        review.locale as ReviewLocale,

      project:
        publicProject,

      publishedAt:
        review.published_at,

      createdAt:
        review.created_at,
    };
  }
}