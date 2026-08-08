'use client';

import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Link2,
  LoaderCircle,
  RotateCcw,
  Search,
  Send,
  Star,
  X,
  XCircle,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  toast,
} from 'sonner';

import {
  useAuth,
} from '@/components/admin/auth-provider';

import {
  AdminApiError,
} from '@/lib/admin-api';

type ReviewStatus =
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

type ReviewLocale =
  | 'fr'
  | 'en'
  | 'ar';

type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

type ReviewProject = {
  id:
    string;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  status:
    ProjectStatus;

  client: {
    id:
      string;

    name:
      string;

    isActive:
      boolean;
  } | null;
};

type ReviewItem = {
  id:
    string;

  invitationId:
    string;

  rating:
    number;

  comment:
    string;

  firstName:
    string;

  lastName:
    string;

  companyName:
    string;

  companyRole:
    string;

  locale:
    ReviewLocale;

  status:
    ReviewStatus;

  showOnHomepage:
    boolean;

  homepageSortOrder:
    number;

  project:
    ReviewProject | null;

  publishedAt:
    string | null;

  publishedByUserId:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type ReviewsResponse = {
  items:
    ReviewItem[];

  pagination: {
    page:
      number;

    limit:
      number;

    total:
      number;

    totalPages:
      number;
  };
};

type ProjectOption = {
  id:
    string;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  status:
    ProjectStatus;

  client: {
    id:
      string;

    name:
      string;
  } | null;
};

type AdminProjectListItem = {
  id:
    string;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  status:
    ProjectStatus;

  client: {
    id:
      string;

    name:
      string;
  } | null;
};

type AdminProjectsResponse = {
  items:
    AdminProjectListItem[];

  pagination: {
    page:
      number;

    limit:
      number;

    total:
      number;

    totalPages:
      number;
  };
};

type CreateInvitationResponse = {
  message:
    string;

  invitation: {
    id:
      string;

    token:
      string;

    expiresAt:
      string;

    createdAt:
      string;

    project:
      ReviewProject | null;
  };
};

type GeneratedInvitation = {
  id:
    string;

  token:
    string;

  url:
    string;

  expiresAt:
    string;

  project:
    ReviewProject | null;
};

const REVIEWS_PAGE_SIZE =
  10;

const PROJECTS_PAGE_SIZE =
  10;

const STATUS_OPTIONS:
  Array<{
    value:
      ReviewStatus | 'all';

    label:
      string;
  }> = [
    {
      value:
        'all',

      label:
        'Tous les statuts',
    },

    {
      value:
        'PENDING_REVIEW',

      label:
        'En attente',
    },

    {
      value:
        'PUBLISHED',

      label:
        'Publiés',
    },

    {
      value:
        'REJECTED',

      label:
        'Refusés',
    },

    {
      value:
        'ARCHIVED',

      label:
        'Archivés',
    },
  ];

const INVITATION_LOCALES:
  Array<{
    value:
      ReviewLocale;

    label:
      string;
  }> = [
    {
      value:
        'fr',

      label:
        'Français',
    },

    {
      value:
        'en',

      label:
        'English',
    },

    {
      value:
        'ar',

      label:
        'العربية',
    },
  ];

function getErrorMessage(
  error:
    unknown,
) {
  if (
    error instanceof
    AdminApiError
  ) {
    return error.message;
  }

  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return 'Une erreur est survenue.';
}

function getStatusLabel(
  status:
    ReviewStatus,
) {
  switch (
    status
  ) {
    case 'PENDING_REVIEW':
      return 'En attente';

    case 'PUBLISHED':
      return 'Publié';

    case 'REJECTED':
      return 'Refusé';

    case 'ARCHIVED':
      return 'Archivé';
  }
}

function getLocaleLabel(
  locale:
    ReviewLocale,
) {
  switch (
    locale
  ) {
    case 'fr':
      return 'FR';

    case 'en':
      return 'EN';

    case 'ar':
      return 'AR';
  }
}

function getProjectLabel(
  project:
    ProjectOption,
) {
  const title =
    project.titleFr ||
    project.titleEn ||
    project.titleAr ||
    'Réalisation sans titre';

  if (
    project.client?.name
  ) {
    return `${title} — ${project.client.name}`;
  }

  return title;
}

function formatDate(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return '—';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    date,
  );
}

function buildReviewInvitationPath(
  locale:
    ReviewLocale,

  token:
    string,
) {
  /*
   * Cette route sera créée dans le prochain lot.
   *
   * Elle reste volontairement absente des navigations
   * publiques et du sitemap.
   */
  return `/${locale}/reviews/donner-mon-avis/${token}`;
}

function RatingStars({
  rating,
}: {
  rating:
    number;
}) {
  return (
    <div
      className="admin-reviews__stars"
      aria-label={`${rating} étoiles sur 5`}
    >
      {Array.from({
        length:
          5,
      }).map(
        (
          _,
          index,
        ) => {
          const filled =
            index <
            rating;

          return (
            <Star
              key={
                index
              }
              size={18}
              aria-hidden="true"
              fill={
                filled
                  ? 'currentColor'
                  : 'none'
              }
            />
          );
        },
      )}
    </div>
  );
}

export function ReviewsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    reviews,
    setReviews,
  ] =
    useState<
      ReviewItem[]
    >(
      [],
    );

  const [
    projects,
    setProjects,
  ] =
    useState<
      ProjectOption[]
    >(
      [],
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isLoadingProjects,
    setIsLoadingProjects,
  ] =
    useState(
      true,
    );

  const [
    busyReviewId,
    setBusyReviewId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isCreatingInvitation,
    setIsCreatingInvitation,
  ] =
    useState(
      false,
    );

  const [
    showInvitationForm,
    setShowInvitationForm,
  ] =
    useState(
      false,
    );

  const [
    generatedInvitation,
    setGeneratedInvitation,
  ] =
    useState<
      GeneratedInvitation | null
    >(
      null,
    );

  const [
    invitationProjectId,
    setInvitationProjectId,
  ] =
    useState(
      '',
    );

  const [
    invitationLocale,
    setInvitationLocale,
  ] =
    useState<ReviewLocale>(
      'fr',
    );

  const [
    invitationExpiration,
    setInvitationExpiration,
  ] =
    useState(
      '30',
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      ReviewStatus | 'all'
    >(
      'all',
    );

  const [
    page,
    setPage,
  ] =
    useState(
      1,
    );

  const [
    pagination,
    setPagination,
  ] =
    useState({
      page:
        1,

      limit:
        REVIEWS_PAGE_SIZE,

      total:
        0,

      totalPages:
        0,
    });

  /*
   * On garde localement les valeurs modifiables.
   *
   * Cela permet de ne pas sauvegarder à chaque clic
   * dans un select ou un input.
   */
  const [
    moderationDrafts,
    setModerationDrafts,
  ] =
    useState<
      Record<
        string,
        {
          projectId:
            string;

          showOnHomepage:
            boolean;

          homepageSortOrder:
            string;
        }
      >
    >(
      {},
    );

  const projectOptions =
    useMemo(
      () =>
        projects
          .slice()
          .sort(
            (
              first,
              second,
            ) => {
              const firstName =
                getProjectLabel(
                  first,
                );

              const secondName =
                getProjectLabel(
                  second,
                );

              return firstName.localeCompare(
                secondName,
                'fr',
              );
            },
          ),
      [
        projects,
      ],
    );

  const loadProjects =
    useCallback(
      async () => {
        setIsLoadingProjects(
          true,
        );

        try {
          let currentPage =
            1;

          let totalPages =
            1;

          const loadedProjects:
            ProjectOption[] =
            [];

          /*
           * L'admin est paginé.
           *
           * Pour le select des réalisations, on récupère
           * donc les pages successivement au lieu de
           * demander une limite énorme non supportée.
           */
          do {
            const parameters =
              new URLSearchParams();

            parameters.set(
              'page',
              String(
                currentPage,
              ),
            );

            parameters.set(
              'limit',
              String(
                PROJECTS_PAGE_SIZE,
              ),
            );

            const response =
              await authorizedFetch<
                AdminProjectsResponse
              >(
                `/projects/admin?${parameters.toString()}`,
              );

            for (
              const project
              of response.items
            ) {
              loadedProjects.push({
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
                      }
                    : null,
              });
            }

            totalPages =
              Math.max(
                response.pagination.totalPages,
                1,
              );

            currentPage +=
              1;
          } while (
            currentPage <=
            totalPages
          );

          setProjects(
            loadedProjects,
          );
        } catch (
          error
        ) {
          toast.error(
            `Impossible de charger les réalisations. ${getErrorMessage(
              error,
            )}`,
          );
        } finally {
          setIsLoadingProjects(
            false,
          );
        }
      },
      [
        authorizedFetch,
      ],
    );

  const loadReviews =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const parameters =
            new URLSearchParams();

          parameters.set(
            'page',
            String(
              page,
            ),
          );

          parameters.set(
            'limit',
            String(
              REVIEWS_PAGE_SIZE,
            ),
          );

          const normalizedSearch =
            search.trim();

          if (
            normalizedSearch
          ) {
            parameters.set(
              'search',
              normalizedSearch,
            );
          }

          if (
            statusFilter !==
            'all'
          ) {
            parameters.set(
              'status',
              statusFilter,
            );
          }

          const response =
            await authorizedFetch<
              ReviewsResponse
            >(
              `/reviews/admin?${parameters.toString()}`,
            );

          setReviews(
            response.items,
          );

          setPagination(
            response.pagination,
          );

          setModerationDrafts(
            current => {
              const next = {
                ...current,
              };

              for (
                const review
                of response.items
              ) {
                /*
                 * On ne remplace pas un brouillon déjà
                 * modifié par l'utilisateur.
                 */
                if (
                  !next[
                    review.id
                  ]
                ) {
                  next[
                    review.id
                  ] = {
                    projectId:
                      review.project?.id ??
                      '',

                    showOnHomepage:
                      review.showOnHomepage,

                    homepageSortOrder:
                      String(
                        review.homepageSortOrder,
                      ),
                  };
                }
              }

              return next;
            },
          );
        } catch (
          error
        ) {
          toast.error(
            getErrorMessage(
              error,
            ),
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        authorizedFetch,
        page,
        search,
        statusFilter,
      ],
    );

  useEffect(
    () => {
      void loadProjects();
    },
    [
      loadProjects,
    ],
  );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadReviews();
          },
          250,
        );

      return () => {
        window.clearTimeout(
          timeout,
        );
      };
    },
    [
      loadReviews,
    ],
  );

  useEffect(
    () => {
      setPage(
        1,
      );
    },
    [
      search,
      statusFilter,
    ],
  );

  function updateDraft(
    reviewId:
      string,

    patch:
      Partial<{
        projectId:
          string;

        showOnHomepage:
          boolean;

        homepageSortOrder:
          string;
      }>,
  ) {
    setModerationDrafts(
      current => ({
        ...current,

        [reviewId]: {
          projectId:
            current[
              reviewId
            ]?.projectId ??
            '',

          showOnHomepage:
            current[
              reviewId
            ]?.showOnHomepage ??
            false,

          homepageSortOrder:
            current[
              reviewId
            ]?.homepageSortOrder ??
            '0',

          ...patch,
        },
      }),
    );
  }

  async function createInvitation() {
    const expiresInDays =
      Number.parseInt(
        invitationExpiration,
        10,
      );

    if (
      !Number.isInteger(
        expiresInDays,
      ) ||
      expiresInDays <
        1 ||
      expiresInDays >
        90
    ) {
      toast.error(
        'La durée de validité doit être comprise entre 1 et 90 jours.',
      );

      return;
    }

    setIsCreatingInvitation(
      true,
    );

    try {
      const response =
        await authorizedFetch<
          CreateInvitationResponse
        >(
          '/reviews/admin/invitations',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                ...(invitationProjectId
                  ? {
                      projectId:
                        invitationProjectId,
                    }
                  : {}),

                expiresInDays,
              }),
          },
        );

      const relativePath =
        buildReviewInvitationPath(
          invitationLocale,
          response.invitation.token,
        );

      const absoluteUrl =
        typeof window !==
        'undefined'
          ? new URL(
              relativePath,
              window.location.origin,
            ).toString()
          : relativePath;

      setGeneratedInvitation({
        id:
          response.invitation.id,

        token:
          response.invitation.token,

        url:
          absoluteUrl,

        expiresAt:
          response.invitation.expiresAt,

        project:
          response.invitation.project,
      });

      toast.success(
        'Lien privé généré.',
      );
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsCreatingInvitation(
        false,
      );
    }
  }

  async function copyInvitationUrl() {
    if (
      !generatedInvitation
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedInvitation.url,
      );

      toast.success(
        'Lien copié.',
      );
    } catch {
      toast.error(
        'Impossible de copier automatiquement le lien.',
      );
    }
  }

  async function revokeGeneratedInvitation() {
    if (
      !generatedInvitation
    ) {
      return;
    }

    try {
      await authorizedFetch(
        `/reviews/admin/invitations/${generatedInvitation.id}/revoke`,
        {
          method:
            'PATCH',
        },
      );

      setGeneratedInvitation(
        null,
      );

      toast.success(
        'Invitation révoquée.',
      );
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    }
  }

  async function updateReview(
    review:
      ReviewItem,

    status?:
      ReviewStatus,
  ) {
    const draft =
      moderationDrafts[
        review.id
      ];

    if (
      !draft
    ) {
      return;
    }

    const homepageSortOrder =
      Number.parseInt(
        draft.homepageSortOrder,
        10,
      );

    if (
      !Number.isInteger(
        homepageSortOrder,
      ) ||
      homepageSortOrder <
        0
    ) {
      toast.error(
        'L’ordre Home doit être un entier positif.',
      );

      return;
    }

    const finalStatus =
      status ??
      review.status;

    if (
      draft.showOnHomepage &&
      finalStatus !==
        'PUBLISHED'
    ) {
      toast.error(
        'Publie d’abord cet avis avant de l’afficher sur la Home.',
      );

      return;
    }

    setBusyReviewId(
      review.id,
    );

    try {
      await authorizedFetch(
        `/reviews/admin/${review.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              projectId:
                draft.projectId ||
                null,

              showOnHomepage:
                draft.showOnHomepage,

              homepageSortOrder,

              ...(status
                ? {
                    status,
                  }
                : {}),
            }),
        },
      );

      toast.success(
        status ===
          'PUBLISHED'
          ? 'Avis publié.'
          : status ===
              'REJECTED'
            ? 'Avis refusé.'
            : status ===
                'ARCHIVED'
              ? 'Avis archivé.'
              : 'Avis mis à jour.',
      );

      setModerationDrafts(
        current => {
          const next = {
            ...current,
          };

          delete next[
            review.id
          ];

          return next;
        },
      );

      await loadReviews();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setBusyReviewId(
        null,
      );
    }
  }

  function resetDraft(
    review:
      ReviewItem,
  ) {
    setModerationDrafts(
      current => ({
        ...current,

        [review.id]: {
          projectId:
            review.project?.id ??
            '',

          showOnHomepage:
            review.showOnHomepage,

          homepageSortOrder:
            String(
              review.homepageSortOrder,
            ),
        },
      }),
    );
  }

  return (
    <section className="admin-reviews">
      <header className="admin-reviews__header">
        <div>
          <span className="admin-reviews__eyebrow">
            Témoignages clients
          </span>

          <h1>
            Reviews
          </h1>

          <p>
            Gérez les avis reçus, leur publication,
            leur réalisation associée et leur présence
            sur la page d’accueil.
          </p>
        </div>

        <button
          type="button"
          className="admin-reviews__primary-button"
          onClick={
            () =>
              setShowInvitationForm(
                current =>
                  !current,
              )
          }
        >
          {showInvitationForm ? (
            <X
              size={18}
              aria-hidden="true"
            />
          ) : (
            <Link2
              size={18}
              aria-hidden="true"
            />
          )}

          <span>
            {showInvitationForm
              ? 'Fermer'
              : 'Créer un lien d’avis'}
          </span>
        </button>
      </header>

      {showInvitationForm ? (
        <section className="admin-reviews__invitation">
          <header className="admin-reviews__section-heading">
            <div>
              <h2>
                Invitation privée
              </h2>

              <p>
                Génère un lien unique que tu pourras
                transmettre directement au client.
              </p>
            </div>
          </header>

          <div className="admin-reviews__invitation-grid">
            <label>
              <span>
                Réalisation associée
              </span>

              <select
                value={
                  invitationProjectId
                }
                disabled={
                  isLoadingProjects ||
                  isCreatingInvitation
                }
                onChange={
                  event =>
                    setInvitationProjectId(
                      event.target.value,
                    )
                }
              >
                <option value="">
                  Aucune réalisation
                </option>

                {projectOptions.map(
                  project => (
                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >
                      {getProjectLabel(
                        project,
                      )}
                    </option>
                  ),
                )}
              </select>

              <small>
                Facultatif. L’administrateur pourra
                changer cette association après réception.
              </small>
            </label>

            <label>
              <span>
                Langue du lien
              </span>

              <select
                value={
                  invitationLocale
                }
                disabled={
                  isCreatingInvitation
                }
                onChange={
                  event =>
                    setInvitationLocale(
                      event.target
                        .value as ReviewLocale,
                    )
                }
              >
                {INVITATION_LOCALES.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>
                Validité
              </span>

              <div className="admin-reviews__duration-field">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={
                    invitationExpiration
                  }
                  disabled={
                    isCreatingInvitation
                  }
                  onChange={
                    event =>
                      setInvitationExpiration(
                        event.target.value,
                      )
                  }
                />

                <span>
                  jours
                </span>
              </div>
            </label>
          </div>

          <div className="admin-reviews__invitation-actions">
            <button
              type="button"
              className="admin-reviews__primary-button"
              disabled={
                isCreatingInvitation
              }
              onClick={
                () => {
                  void createInvitation();
                }
              }
            >
              {isCreatingInvitation ? (
                <LoaderCircle
                  size={18}
                  className="admin-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Send
                  size={18}
                  aria-hidden="true"
                />
              )}

              Générer le lien
            </button>
          </div>

          {generatedInvitation ? (
            <div className="admin-reviews__generated-link">
              <div className="admin-reviews__generated-link-heading">
                <Check
                  size={20}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Lien prêt à être envoyé
                  </strong>

                  <span>
                    Expire le{' '}
                    {formatDate(
                      generatedInvitation.expiresAt,
                    )}
                  </span>
                </div>
              </div>

              <div className="admin-reviews__generated-link-value">
                <input
                  type="text"
                  readOnly
                  value={
                    generatedInvitation.url
                  }
                  aria-label="Lien privé de dépôt d’avis"
                />

                <button
                  type="button"
                  aria-label="Copier le lien"
                  title="Copier"
                  onClick={
                    () => {
                      void copyInvitationUrl();
                    }
                  }
                >
                  <Clipboard
                    size={18}
                    aria-hidden="true"
                  />
                </button>

                <a
                  href={
                    generatedInvitation.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ouvrir le lien"
                  title="Ouvrir"
                >
                  <ExternalLink
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div className="admin-reviews__generated-link-footer">
                <p>
                  Pour des raisons de sécurité, le token
                  n’est pas stocké en clair dans la base.
                  Conserve ou envoie ce lien maintenant.
                </p>

                <button
                  type="button"
                  className="admin-reviews__danger-text-button"
                  onClick={
                    () => {
                      void revokeGeneratedInvitation();
                    }
                  }
                >
                  <XCircle
                    size={17}
                    aria-hidden="true"
                  />

                  Révoquer ce lien
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="admin-reviews__filters">
        <label className="admin-reviews__search">
          <Search
            size={18}
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            placeholder="Rechercher un client, une entreprise ou un commentaire…"
            onChange={
              event =>
                setSearch(
                  event.target.value,
                )
            }
          />
        </label>

        <label className="admin-reviews__filter">
          <span className="sr-only">
            Filtrer par statut
          </span>

          <select
            value={
              statusFilter
            }
            onChange={
              event =>
                setStatusFilter(
                  event.target
                    .value as
                    | ReviewStatus
                    | 'all',
                )
            }
          >
            {STATUS_OPTIONS.map(
              option => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </label>
      </section>

      <div className="admin-reviews__summary">
        <strong>
          {pagination.total}
        </strong>

        <span>
          {pagination.total >
          1
            ? 'avis'
            : 'avis'}
        </span>
      </div>

      {isLoading ? (
        <div className="admin-reviews__loading">
          <LoaderCircle
            size={28}
            className="admin-spinner"
            aria-hidden="true"
          />

          Chargement des avis…
        </div>
      ) : reviews.length ===
        0 ? (
        <div className="admin-reviews__empty">
          <Star
            size={28}
            aria-hidden="true"
          />

          <h2>
            Aucun avis
          </h2>

          <p>
            Aucun avis ne correspond aux critères actuels.
          </p>
        </div>
      ) : (
        <div className="admin-reviews__list">
          {reviews.map(
            review => {
              const draft =
                moderationDrafts[
                  review.id
                ] ?? {
                  projectId:
                    review.project
                      ?.id ??
                    '',

                  showOnHomepage:
                    review.showOnHomepage,

                  homepageSortOrder:
                    String(
                      review.homepageSortOrder,
                    ),
                };

              const isBusy =
                busyReviewId ===
                review.id;

              const canShowOnHomepage =
                review.status ===
                  'PUBLISHED';

              return (
                <article
                  key={
                    review.id
                  }
                  className="admin-reviews__card"
                  data-status={
                    review.status
                  }
                >
                  <header className="admin-reviews__card-header">
                    <div className="admin-reviews__identity">
                      <RatingStars
                        rating={
                          review.rating
                        }
                      />

                      <div>
                        <h2>
                          {review.firstName}{' '}
                          {review.lastName}
                        </h2>

                        <p>
                          {review.companyRole}
                          {' · '}
                          {review.companyName}
                        </p>
                      </div>
                    </div>

                    <div className="admin-reviews__badges">
                      <span
                        className="admin-reviews__locale"
                      >
                        {getLocaleLabel(
                          review.locale,
                        )}
                      </span>

                      <span
                        className="admin-reviews__status"
                        data-status={
                          review.status
                        }
                      >
                        {getStatusLabel(
                          review.status,
                        )}
                      </span>
                    </div>
                  </header>

                  <blockquote className="admin-reviews__comment">
                    {review.comment}
                  </blockquote>

                  <dl className="admin-reviews__dates">
                    <div>
                      <dt>
                        Reçu
                      </dt>

                      <dd>
                        {formatDate(
                          review.createdAt,
                        )}
                      </dd>
                    </div>

                    {review.publishedAt ? (
                      <div>
                        <dt>
                          Publié
                        </dt>

                        <dd>
                          {formatDate(
                            review.publishedAt,
                          )}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="admin-reviews__moderation">
                    <label className="admin-reviews__field admin-reviews__field--project">
                      <span>
                        Réalisation associée
                      </span>

                      <select
                        value={
                          draft.projectId
                        }
                        disabled={
                          isBusy ||
                          isLoadingProjects
                        }
                        onChange={
                          event =>
                            updateDraft(
                              review.id,
                              {
                                projectId:
                                  event.target.value,
                              },
                            )
                        }
                      >
                        <option value="">
                          Aucune réalisation
                        </option>

                        {projectOptions.map(
                          project => (
                            <option
                              key={
                                project.id
                              }
                              value={
                                project.id
                              }
                            >
                              {getProjectLabel(
                                project,
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label className="admin-reviews__homepage-toggle">
                      <input
                        type="checkbox"
                        checked={
                          draft.showOnHomepage
                        }
                        disabled={
                          isBusy ||
                          !canShowOnHomepage
                        }
                        onChange={
                          event =>
                            updateDraft(
                              review.id,
                              {
                                showOnHomepage:
                                  event.target
                                    .checked,
                              },
                            )
                        }
                      />

                      <span>
                        Afficher sur la Home
                      </span>
                    </label>

                    <label className="admin-reviews__field admin-reviews__field--order">
                      <span>
                        Ordre Home
                      </span>

                      <input
                        type="number"
                        min="0"
                        max="10000"
                        value={
                          draft.homepageSortOrder
                        }
                        disabled={
                          isBusy ||
                          !draft.showOnHomepage
                        }
                        onChange={
                          event =>
                            updateDraft(
                              review.id,
                              {
                                homepageSortOrder:
                                  event.target.value,
                              },
                            )
                        }
                      />
                    </label>
                  </div>

                  {!canShowOnHomepage ? (
                    <p className="admin-reviews__homepage-hint">
                      L’avis doit être publié avant de pouvoir
                      être sélectionné pour la Home.
                    </p>
                  ) : null}

                  <footer className="admin-reviews__card-footer">
                    <div className="admin-reviews__secondary-actions">
                      <button
                        type="button"
                        disabled={
                          isBusy
                        }
                        onClick={
                          () =>
                            resetDraft(
                              review,
                            )
                        }
                      >
                        <RotateCcw
                          size={17}
                          aria-hidden="true"
                        />

                        Réinitialiser
                      </button>

                      <button
                        type="button"
                        disabled={
                          isBusy
                        }
                        onClick={
                          () => {
                            void updateReview(
                              review,
                            );
                          }
                        }
                      >
                        <Check
                          size={17}
                          aria-hidden="true"
                        />

                        Enregistrer
                      </button>
                    </div>

                    <div className="admin-reviews__moderation-actions">
                      {review.status !==
                      'PUBLISHED' ? (
                        <button
                          type="button"
                          className="admin-reviews__publish-button"
                          disabled={
                            isBusy
                          }
                          onClick={
                            () => {
                              void updateReview(
                                review,
                                'PUBLISHED',
                              );
                            }
                          }
                        >
                          {isBusy ? (
                            <LoaderCircle
                              size={17}
                              className="admin-spinner"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check
                              size={17}
                              aria-hidden="true"
                            />
                          )}

                          Publier
                        </button>
                      ) : null}

                      {review.status !==
                        'REJECTED' &&
                      review.status !==
                        'ARCHIVED' ? (
                        <button
                          type="button"
                          className="admin-reviews__reject-button"
                          disabled={
                            isBusy
                          }
                          onClick={
                            () => {
                              void updateReview(
                                review,
                                'REJECTED',
                              );
                            }
                          }
                        >
                          <X
                            size={17}
                            aria-hidden="true"
                          />

                          Refuser
                        </button>
                      ) : null}

                      {review.status !==
                      'ARCHIVED' ? (
                        <button
                          type="button"
                          className="admin-reviews__archive-button"
                          disabled={
                            isBusy
                          }
                          onClick={
                            () => {
                              void updateReview(
                                review,
                                'ARCHIVED',
                              );
                            }
                          }
                        >
                          <Archive
                            size={17}
                            aria-hidden="true"
                          />

                          Archiver
                        </button>
                      ) : null}
                    </div>
                  </footer>
                </article>
              );
            },
          )}
        </div>
      )}

      {pagination.totalPages >
      1 ? (
        <nav
          className="admin-reviews__pagination"
          aria-label="Pagination des avis"
        >
          <button
            type="button"
            disabled={
              pagination.page <=
              1
            }
            aria-label="Page précédente"
            onClick={
              () =>
                setPage(
                  current =>
                    Math.max(
                      1,
                      current -
                        1,
                    ),
                )
            }
          >
            <ChevronLeft
              size={18}
              aria-hidden="true"
            />

            Précédent
          </button>

          <span>
            Page{' '}
            <strong>
              {pagination.page}
            </strong>{' '}
            sur{' '}
            <strong>
              {pagination.totalPages}
            </strong>
          </span>

          <button
            type="button"
            disabled={
              pagination.page >=
              pagination.totalPages
            }
            aria-label="Page suivante"
            onClick={
              () =>
                setPage(
                  current =>
                    Math.min(
                      pagination.totalPages,
                      current +
                        1,
                    ),
                )
            }
          >
            Suivant

            <ChevronRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </nav>
      ) : null}
    </section>
  );
}