'use client';

import {
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';

import Link from 'next/link';

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

const PUBLICATION_CONTENT_TYPES =
  [
    'ARTICLE',
    'CASE_STUDY',
    'NEWS',
    'EVENT',
    'PRESS_RELEASE',
    'ANNOUNCEMENT',
    'GUIDE',
    'RESOURCE',
  ] as const;

type PublicationContentType =
  (
    typeof PUBLICATION_CONTENT_TYPES
  )[number];

type PublicationState =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';

type PublicationTranslation = {
  id:
    string;

  locale:
    'fr' |
    'en';

  title:
    string;

  slug:
    string;

  excerpt:
    string | null;

  body:
    string | null;

  coverAltText:
    string | null;

  seoTitle:
    string | null;

  seoDescription:
    string | null;

  canonicalUrl:
    string | null;
};

type PublicationMedia = {
  id:
    string;

  mediaType:
    'IMAGE' |
    'VIDEO';

  mediaUrl:
    string;

  isCardCover:
    boolean;

  posterUrl:
    string | null;

  sortOrder:
    number;

  width:
    number | null;

  height:
    number | null;

  durationSeconds:
    number | null;
};

type AdminPublication = {
  id:
    string;

  contentType:
    PublicationContentType;

  status:
    'DRAFT' |
    'PUBLISHED' |
    'ARCHIVED';

  state:
    PublicationState;

  isFeatured:
    boolean;

  featuredSortOrder:
    number;

  allowIndexing:
    boolean;

  scheduledAt:
    string | null;

  publishedAt:
    string | null;

  translations:
    PublicationTranslation[];

  media:
    PublicationMedia[];

  expertiseCodes:
    string[];

  projects:
    Array<{
      id:
        string;

      titleFr:
        string;

      titleEn:
        string | null;

      status:
        string;
    }>;

  createdAt:
    string;

  updatedAt:
    string;
};

type AdminPublicationsResponse = {
  items:
    AdminPublication[];

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

const CONTENT_TYPE_LABELS:
  Record<
    PublicationContentType,
    string
  > = {
    ARTICLE:
      'Article',

    CASE_STUDY:
      'Cas d’étude',

    NEWS:
      'Actualité',

    EVENT:
      'Événement',

    PRESS_RELEASE:
      'Communiqué',

    ANNOUNCEMENT:
      'Annonce',

    GUIDE:
      'Guide',

    RESOURCE:
      'Ressource',
  };

const STATE_LABELS:
  Record<
    PublicationState,
    string
  > = {
    DRAFT:
      'Brouillon',

    SCHEDULED:
      'Programmée',

    PUBLISHED:
      'Publiée',

    ARCHIVED:
      'Archivée',
  };

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

function formatAdminDate(
  value:
    string |
    null,
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

function getPrimaryTranslation(
  publication:
    AdminPublication,
) {
  return (
    publication
      .translations
      .find(
        translation =>
          translation.locale ===
          'fr',
      ) ??
    publication
      .translations
      .find(
        translation =>
          translation.locale ===
          'en',
      ) ??
    null
  );
}

function getCoverImage(
  publication:
    AdminPublication,
) {
  const cover =
    publication
      .media
      .find(
        media =>
          media.isCardCover,
      ) ??
    publication.media[0];

  if (
    !cover
  ) {
    return null;
  }

  if (
    cover.mediaType ===
    'VIDEO'
  ) {
    return cover.posterUrl;
  }

  return cover.mediaUrl;
}

export function PublicationsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    publications,
    setPublications,
  ] =
    useState<
      AdminPublication[]
    >(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    contentType,
    setContentType,
  ] =
    useState<
      PublicationContentType |
      'all'
    >(
      'all',
    );

  const [
    state,
    setState,
  ] =
    useState<
      PublicationState |
      'all'
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
        20,

      total:
        0,

      totalPages:
        0,
    });

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    actionPublicationId,
    setActionPublicationId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const normalizedSearch =
    useMemo(
      () =>
        search.trim(),
      [
        search,
      ],
    );

  const loadPublications =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const parameters =
            new URLSearchParams({
              page:
                String(
                  page,
                ),

              limit:
                '20',

              sort:
                'UPDATED_DESC',
            });

          if (
            normalizedSearch
          ) {
            parameters.set(
              'search',
              normalizedSearch,
            );
          }

          if (
            contentType !==
            'all'
          ) {
            parameters.set(
              'contentType',
              contentType,
            );
          }

          if (
            state !==
            'all'
          ) {
            parameters.set(
              'state',
              state,
            );
          }

          const response =
            await authorizedFetch<
              AdminPublicationsResponse
            >(
              `/publications/admin?${parameters.toString()}`,
            );

          setPublications(
            response.items,
          );

          setPagination(
            response.pagination,
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
        contentType,
        normalizedSearch,
        page,
        state,
      ],
    );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadPublications();
          },
          normalizedSearch
            ? 350
            : 0,
        );

      return () => {
        window.clearTimeout(
          timeout,
        );
      };
    },
    [
      loadPublications,
      normalizedSearch,
    ],
  );

  useEffect(
    () => {
      setPage(
        1,
      );
    },
    [
      contentType,
      normalizedSearch,
      state,
    ],
  );

  async function executeAction({
    publication,
    endpoint,
    successMessage,
    confirmationMessage,
    method = 'PATCH',
  }: {
    publication:
      AdminPublication;

    endpoint:
      string;

    successMessage:
      string;

    confirmationMessage?:
      string;

    method?:
      'PATCH' |
      'DELETE';
  }) {
    if (
      confirmationMessage &&
      !window.confirm(
        confirmationMessage,
      )
    ) {
      return;
    }

    setActionPublicationId(
      publication.id,
    );

    try {
      await authorizedFetch(
        endpoint,
        {
          method,
        },
      );

      toast.success(
        successMessage,
      );

      await loadPublications();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setActionPublicationId(
        null,
      );
    }
  }

  return (
    <section className="admin-publications">
      <header className="admin-publications__header">
        <div>
          <span className="admin-publications__eyebrow">
            Contenus éditoriaux
          </span>

          <h1>
            Articles et actualités
          </h1>

          <p>
            Gérez les articles, cas d’étude,
            actualités, événements, communiqués,
            annonces, guides et ressources du site.
          </p>
        </div>

        <Link
          href="/admin/publications/new"
          className="admin-publications__primary-button"
        >
          <Plus
            size={
              19
            }
            aria-hidden="true"
          />

          <span>
            Nouvelle publication
          </span>
        </Link>
      </header>

      <div className="admin-publications__summary">
        <div className="admin-publications__summary-card">
          <FileText
            size={
              22
            }
            aria-hidden="true"
          />

          <div>
            <strong>
              {
                pagination.total
              }
            </strong>

            <span>
              Publications
            </span>
          </div>
        </div>

        <div className="admin-publications__summary-card">
          <CheckCircle2
            size={
              22
            }
            aria-hidden="true"
          />

          <div>
            <strong>
              {
                publications.filter(
                  publication =>
                    publication.state ===
                    'PUBLISHED',
                ).length
              }
            </strong>

            <span>
              Publiées sur cette page
            </span>
          </div>
        </div>

        <div className="admin-publications__summary-card">
          <CalendarClock
            size={
              22
            }
            aria-hidden="true"
          />

          <div>
            <strong>
              {
                publications.filter(
                  publication =>
                    publication.state ===
                    'SCHEDULED',
                ).length
              }
            </strong>

            <span>
              Programmées sur cette page
            </span>
          </div>
        </div>
      </div>

      <div className="admin-publications__filters">
        <label className="admin-publications__search">
          <Search
            size={
              18
            }
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            placeholder="Rechercher par titre, résumé ou slug…"
            onChange={
              event =>
                setSearch(
                  event.target.value,
                )
            }
          />
        </label>

        <label className="admin-publications__filter">
          <span>
            Type
          </span>

          <select
            value={
              contentType
            }
            onChange={
              event =>
                setContentType(
                  event.target.value as
                    PublicationContentType |
                    'all',
                )
            }
          >
            <option value="all">
              Tous les types
            </option>

            {
              PUBLICATION_CONTENT_TYPES.map(
                type => (
                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >
                    {
                      CONTENT_TYPE_LABELS[
                        type
                      ]
                    }
                  </option>
                ),
              )
            }
          </select>
        </label>

        <label className="admin-publications__filter">
          <span>
            État
          </span>

          <select
            value={
              state
            }
            onChange={
              event =>
                setState(
                  event.target.value as
                    PublicationState |
                    'all',
                )
            }
          >
            <option value="all">
              Tous les états
            </option>

            <option value="DRAFT">
              Brouillons
            </option>

            <option value="SCHEDULED">
              Programmées
            </option>

            <option value="PUBLISHED">
              Publiées
            </option>

            <option value="ARCHIVED">
              Archivées
            </option>
          </select>
        </label>

        <button
          type="button"
          className="admin-publications__refresh"
          aria-label="Actualiser la liste"
          title="Actualiser la liste"
          onClick={
            () =>
              void loadPublications()
          }
          disabled={
            isLoading
          }
        >
          <RefreshCcw
            size={
              18
            }
            className={
              isLoading
                ? 'admin-spinner'
                : undefined
            }
            aria-hidden="true"
          />
        </button>
      </div>

      {
        isLoading
          ? (
              <div className="admin-publications__loading">
                <LoaderCircle
                  size={
                    30
                  }
                  className="admin-spinner"
                  aria-hidden="true"
                />

                <span>
                  Chargement des publications…
                </span>
              </div>
            )
          : publications.length ===
            0
            ? (
                <div className="admin-publications__empty">
                  <FileText
                    size={
                      36
                    }
                    aria-hidden="true"
                  />

                  <h2>
                    Aucune publication trouvée
                  </h2>

                  <p>
                    Modifiez les filtres ou créez
                    votre première publication.
                  </p>
                </div>
              )
            : (
                <div className="admin-publications__grid">
                  {
                    publications.map(
                      publication => {
                        const translation =
                          getPrimaryTranslation(
                            publication,
                          );

                        const coverImage =
                          getCoverImage(
                            publication,
                          );

                        const isActing =
                          actionPublicationId ===
                          publication.id;

                        return (
                          <article
                            key={
                              publication.id
                            }
                            className="admin-publications__card"
                          >
                            <div className="admin-publications__card-media">
                              {
                                coverImage
                                  ? (
                                      <img
                                        src={
                                          coverImage
                                        }
                                        alt=""
                                      />
                                    )
                                  : (
                                      <div className="admin-publications__card-placeholder">
                                        <FileText
                                          size={
                                            32
                                          }
                                          aria-hidden="true"
                                        />
                                      </div>
                                    )
                              }

                              <span
                                className="admin-publications__state"
                                data-state={
                                  publication.state
                                }
                              >
                                {
                                  publication.state ===
                                  'SCHEDULED'
                                    ? (
                                        <Clock3
                                          size={
                                            14
                                          }
                                          aria-hidden="true"
                                        />
                                      )
                                    : null
                                }

                                {
                                  STATE_LABELS[
                                    publication.state
                                  ]
                                }
                              </span>

                              {
                                publication.isFeatured
                                  ? (
                                      <span className="admin-publications__featured">
                                        Accueil
                                      </span>
                                    )
                                  : null
                              }
                            </div>

                            <div className="admin-publications__card-content">
                              <div className="admin-publications__card-meta">
                                <strong>
                                  {
                                    CONTENT_TYPE_LABELS[
                                      publication
                                        .contentType
                                    ]
                                  }
                                </strong>

                                <span>
                                  {
                                    publication
                                      .translations
                                      .map(
                                        item =>
                                          item.locale.toUpperCase(),
                                      )
                                      .join(
                                        ' · ',
                                      )
                                  }
                                </span>
                              </div>

                              <h2>
                                {
                                  translation?.title ??
                                  'Publication sans titre'
                                }
                              </h2>

                              <p>
                                {
                                  translation?.excerpt ??
                                  'Aucun résumé renseigné.'
                                }
                              </p>

                              <dl className="admin-publications__dates">
                                <div>
                                  <dt>
                                    Mise à jour
                                  </dt>

                                  <dd>
                                    {
                                      formatAdminDate(
                                        publication.updatedAt,
                                      )
                                    }
                                  </dd>
                                </div>

                                {
                                  publication.state ===
                                  'SCHEDULED'
                                    ? (
                                        <div>
                                          <dt>
                                            Publication prévue
                                          </dt>

                                          <dd>
                                            {
                                              formatAdminDate(
                                                publication.scheduledAt,
                                              )
                                            }
                                          </dd>
                                        </div>
                                      )
                                    : null
                                }

                                {
                                  publication.state ===
                                  'PUBLISHED'
                                    ? (
                                        <div>
                                          <dt>
                                            Publiée
                                          </dt>

                                          <dd>
                                            {
                                              formatAdminDate(
                                                publication.publishedAt,
                                              )
                                            }
                                          </dd>
                                        </div>
                                      )
                                    : null
                                }
                              </dl>
                            </div>

                            <div className="admin-publications__card-actions">
                              <Link
                                href={
                                  `/admin/publications/${publication.id}`
                                }
                                className="admin-publications__action"
                              >
                                <Eye
                                  size={
                                    17
                                  }
                                  aria-hidden="true"
                                />

                                <span>
                                  Modifier
                                </span>
                              </Link>

                              {
                                publication.state ===
                                'DRAFT'
                                  ? (
                                      <button
                                        type="button"
                                        className="admin-publications__action"
                                        disabled={
                                          isActing
                                        }
                                        onClick={
                                          () =>
                                            void executeAction({
                                              publication,

                                              endpoint:
                                                `/publications/${publication.id}/publish`,

                                              successMessage:
                                                'La publication est maintenant en ligne.',
                                            })
                                        }
                                      >
                                        <Eye
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />

                                        Publier
                                      </button>
                                    )
                                  : null
                              }

                              {
                                publication.state ===
                                'SCHEDULED'
                                  ? (
                                      <button
                                        type="button"
                                        className="admin-publications__action"
                                        disabled={
                                          isActing
                                        }
                                        onClick={
                                          () =>
                                            void executeAction({
                                              publication,

                                              endpoint:
                                                `/publications/${publication.id}/cancel-schedule`,

                                              successMessage:
                                                'La programmation a été annulée.',
                                            })
                                        }
                                      >
                                        <Clock3
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />

                                        Annuler
                                      </button>
                                    )
                                  : null
                              }

                              {
                                publication.state ===
                                'PUBLISHED'
                                  ? (
                                      <button
                                        type="button"
                                        className="admin-publications__action"
                                        disabled={
                                          isActing
                                        }
                                        onClick={
                                          () =>
                                            void executeAction({
                                              publication,

                                              endpoint:
                                                `/publications/${publication.id}/unpublish`,

                                              successMessage:
                                                'La publication est revenue en brouillon.',

                                              confirmationMessage:
                                                'Retirer cette publication du site public ?',
                                            })
                                        }
                                      >
                                        <EyeOff
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />

                                        Dépublier
                                      </button>
                                    )
                                  : null
                              }

                              {
                                publication.state !==
                                'ARCHIVED'
                                  ? (
                                      <button
                                        type="button"
                                        className="admin-publications__action"
                                        disabled={
                                          isActing
                                        }
                                        onClick={
                                          () =>
                                            void executeAction({
                                              publication,

                                              endpoint:
                                                `/publications/${publication.id}/archive`,

                                              successMessage:
                                                'La publication a été archivée.',

                                              confirmationMessage:
                                                'Archiver cette publication ?',
                                            })
                                        }
                                      >
                                        <Archive
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />

                                        Archiver
                                      </button>
                                    )
                                  : (
                                      <button
                                        type="button"
                                        className="admin-publications__action"
                                        disabled={
                                          isActing
                                        }
                                        onClick={
                                          () =>
                                            void executeAction({
                                              publication,

                                              endpoint:
                                                `/publications/${publication.id}/restore`,

                                              successMessage:
                                                'La publication a été restaurée.',
                                            })
                                        }
                                      >
                                        <RefreshCcw
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />

                                        Restaurer
                                      </button>
                                    )
                              }

                              <button
                                type="button"
                                className="admin-publications__delete"
                                disabled={
                                  isActing
                                }
                                onClick={
                                  () =>
                                    void executeAction({
                                      publication,

                                      endpoint:
                                        `/publications/${publication.id}`,

                                      method:
                                        'DELETE',

                                      successMessage:
                                        'La publication a été supprimée.',

                                      confirmationMessage:
                                        'Supprimer cette publication ? Cette action la retirera de l’administration courante.',
                                    })
                                }
                              >
                                {
                                  isActing
                                    ? (
                                        <LoaderCircle
                                          size={
                                            17
                                          }
                                          className="admin-spinner"
                                          aria-hidden="true"
                                        />
                                      )
                                    : (
                                        <Trash2
                                          size={
                                            17
                                          }
                                          aria-hidden="true"
                                        />
                                      )
                                }

                                <span>
                                  Supprimer
                                </span>
                              </button>
                            </div>
                          </article>
                        );
                      },
                    )
                  }
                </div>
              )
      }

      {
        pagination.totalPages >
        1
          ? (
              <nav
                className="admin-publications__pagination"
                aria-label="Pagination des publications"
              >
                <button
                  type="button"
                  disabled={
                    page <=
                    1
                  }
                  onClick={
                    () =>
                      setPage(
                        currentPage =>
                          Math.max(
                            1,
                            currentPage -
                              1,
                          ),
                      )
                  }
                >
                  Précédent
                </button>

                <span>
                  Page {pagination.page} sur{' '}
                  {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={
                    () =>
                      setPage(
                        currentPage =>
                          Math.min(
                            pagination.totalPages,
                            currentPage +
                              1,
                          ),
                      )
                  }
                >
                  Suivant
                </button>
              </nav>
            )
          : null
      }
    </section>
  );
}