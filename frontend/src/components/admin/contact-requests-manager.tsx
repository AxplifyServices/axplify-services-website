'use client';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  ExternalLink,
  Inbox,
  LoaderCircle,
  Mail,
  MailQuestion,
  Phone,
  RefreshCw,
  Save,
  Search,
  UserRound,
  X,
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

type ContactRequestStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'PROCESSED'
  | 'CANCELLED';

type ContactRequestSource =
  | 'CONTACT_PAGE'
  | 'ASSIST_PAGE';

type UserSummary = {
  id:
    string;

  email:
    string;

  firstName:
    string | null;

  lastName:
    string | null;

  fullName:
    string;
};

type ContactRequestListItem = {
  id:
    string;

  source:
    ContactRequestSource;

  locale:
    'fr' | 'en' | 'ar';

  firstName:
    string;

  lastName:
    string;

  fullName:
    string;

  companyName:
    string;

  jobTitle:
    string;

  phoneNumber:
    string;

  email:
    string;

  status:
    ContactRequestStatus;

  statusChangedAt:
    string;

  wantsAppointment:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;

  assignedTo:
    UserSummary | null;

  counters: {
    availabilities:
      number;

    projects:
      number;

    services:
      number;
  };
};

type ContactRequestsResponse = {
  items:
    ContactRequestListItem[];

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

type ContactRequestAvailability = {
  id:
    string;

  startsAt:
    string;

  endsAt:
    string;

  timezone:
    string;

  note:
    string | null;

  sortOrder:
    number;

  createdAt:
    string;
};

type ContactRequestStatusHistory = {
  id:
    string;

  previousStatus:
    ContactRequestStatus | null;

  newStatus:
    ContactRequestStatus;

  note:
    string | null;

  changedAt:
    string;

  changedBy:
    UserSummary | null;
};

type ContactRequestDetail = {
  id:
    string;

  source:
    ContactRequestSource;

  locale:
    'fr' | 'en' | 'ar';

  firstName:
    string;

  lastName:
    string;

  fullName:
    string;

  companyName:
    string;

  jobTitle:
    string;

  needDescription:
    string;

  phoneNumber:
    string;

  email:
    string;

  status:
    ContactRequestStatus;

  allowedNextStatuses:
    ContactRequestStatus[];

  statusChangedAt:
    string;

  internalNote:
    string | null;

  wantsAppointment:
    boolean;

  privacyConsent:
    boolean;

  privacyConsentAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  assignedTo:
    UserSummary | null;

  lastUpdatedBy:
    UserSummary | null;

  availabilities:
    ContactRequestAvailability[];

  services: {
    code:
      string;

    linkedAt:
      string;

    linkedBy:
      UserSummary | null;
  }[];

  projects: {
    id:
      string;

    status:
      string;

    title: {
      fr:
        string;

      en:
        string | null;

      ar:
        string | null;
    };

    client: {
      id:
        string;

      name:
        string;
    };

    linkedAt:
      string;

    linkedBy:
      UserSummary | null;
  }[];

  statusHistory:
    ContactRequestStatusHistory[];
};

type AdminOptions = {
  statuses:
    ContactRequestStatus[];

  sources:
    ContactRequestSource[];

  serviceCodes:
    string[];

  administrators:
    UserSummary[];

  projects: {
    id:
      string;

    status:
      string;

    title: {
      fr:
        string;

      en:
        string | null;

      ar:
        string | null;
    };

    client: {
      id:
        string;

      name:
        string;
    };
  }[];
};

const STATUS_LABELS:
  Record<
    ContactRequestStatus,
    string
  > = {
    RECEIVED:
      'Reçu',

    IN_PROGRESS:
      'En cours de traitement',

    PROCESSED:
      'Traité',

    CANCELLED:
      'Annulé',
  };

const SOURCE_LABELS:
  Record<
    ContactRequestSource,
    string
  > = {
    CONTACT_PAGE:
      'Page Nous contacter',

    ASSIST_PAGE:
      'Page Comment pouvons-nous vous aider',
  };

const STATUS_ICONS = {
  RECEIVED:
    Inbox,

  IN_PROGRESS:
    Clock3,

  PROCESSED:
    CheckCircle2,

  CANCELLED:
    CircleX,
} satisfies Record<
  ContactRequestStatus,
  typeof Inbox
>;

const PAGE_SIZE =
  20;

function formatDateTime(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    new Date(
      value,
    ),
  );
}

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

export function ContactRequestsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    requests,
    setRequests,
  ] =
    useState<
      ContactRequestListItem[]
    >(
      [],
    );

  const [
    selectedRequest,
    setSelectedRequest,
  ] =
    useState<
      ContactRequestDetail | null
    >(
      null,
    );

  const [
    options,
    setOptions,
  ] =
    useState<
      AdminOptions | null
    >(
      null,
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
      ContactRequestStatus | ''
    >(
      '',
    );

  const [
    sourceFilter,
    setSourceFilter,
  ] =
    useState<
      ContactRequestSource | ''
    >(
      '',
    );

  const [
    assignedToFilter,
    setAssignedToFilter,
  ] =
    useState(
      '',
    );

  const [
    page,
    setPage,
  ] =
    useState(
      1,
    );

  const [
    total,
    setTotal,
  ] =
    useState(
      0,
    );

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(
      1,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isLoadingDetail,
    setIsLoadingDetail,
  ] =
    useState(
      false,
    );

  const [
    isSavingAdminFields,
    setIsSavingAdminFields,
  ] =
    useState(
      false,
    );

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] =
    useState(
      false,
    );

  const [
    assignedToUserId,
    setAssignedToUserId,
  ] =
    useState(
      '',
    );

  const [
    internalNote,
    setInternalNote,
  ] =
    useState(
      '',
    );

  const [
    statusNote,
    setStatusNote,
  ] =
    useState(
      '',
    );

  const loadOptions =
    useCallback(
      async () => {
        try {
          const response =
            await authorizedFetch<AdminOptions>(
              '/contact-requests/admin/options',
            );

          setOptions(
            response,
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
      },
      [
        authorizedFetch,
      ],
    );

  const loadRequests =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        const parameters =
          new URLSearchParams();

        if (
          search.trim()
        ) {
          parameters.set(
            'search',
            search.trim(),
          );
        }

        if (
          statusFilter
        ) {
          parameters.set(
            'status',
            statusFilter,
          );
        }

        if (
          sourceFilter
        ) {
          parameters.set(
            'source',
            sourceFilter,
          );
        }

        if (
          assignedToFilter
        ) {
          parameters.set(
            'assignedToUserId',
            assignedToFilter,
          );
        }

        parameters.set(
          'page',
          String(
            page,
          ),
        );

        parameters.set(
          'limit',
          String(
            PAGE_SIZE,
          ),
        );

        try {
          const response =
            await authorizedFetch<ContactRequestsResponse>(
              `/contact-requests/admin?${parameters.toString()}`,
            );

          setRequests(
            response.items,
          );

          setTotal(
            response.pagination.total,
          );

          setTotalPages(
            Math.max(
              response.pagination.totalPages,
              1,
            ),
          );

          if (
            page >
            response.pagination.totalPages &&
            response.pagination.totalPages >
            0
          ) {
            setPage(
              response.pagination.totalPages,
            );
          }
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
        assignedToFilter,
        authorizedFetch,
        page,
        search,
        sourceFilter,
        statusFilter,
      ],
    );

  const loadRequestDetail =
    useCallback(
      async (
        id:
          string,
      ) => {
        setIsLoadingDetail(
          true,
        );

        try {
          const response =
            await authorizedFetch<ContactRequestDetail>(
              `/contact-requests/admin/${id}`,
            );

          setSelectedRequest(
            response,
          );

          setAssignedToUserId(
            response.assignedTo?.id ??
            '',
          );

          setInternalNote(
            response.internalNote ??
            '',
          );

          setStatusNote(
            '',
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
          setIsLoadingDetail(
            false,
          );
        }
      },
      [
        authorizedFetch,
      ],
    );

  useEffect(
    () => {
      void loadOptions();
    },
    [
      loadOptions,
    ],
  );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadRequests();
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
      loadRequests,
    ],
  );

  useEffect(
    () => {
      setPage(
        1,
      );
    },
    [
      assignedToFilter,
      search,
      sourceFilter,
      statusFilter,
    ],
  );

  useEffect(
    () => {
      if (
        !selectedRequest
      ) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        'hidden';

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setSelectedRequest(
            null,
          );
        }
      }

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          previousOverflow;

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      selectedRequest,
    ],
  );

  const pendingCount =
    useMemo(
      () =>
        requests.filter(
          request =>
            request.status ===
              'RECEIVED' ||
            request.status ===
              'IN_PROGRESS',
        ).length,
      [
        requests,
      ],
    );

  async function saveAdminFields() {
    if (
      !selectedRequest
    ) {
      return;
    }

    setIsSavingAdminFields(
      true,
    );

    try {
      const response =
        await authorizedFetch<ContactRequestDetail>(
          `/contact-requests/admin/${selectedRequest.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                assignedToUserId:
                  assignedToUserId ||
                  null,

                internalNote:
                  internalNote.trim() ||
                  null,
              }),
          },
        );

      setSelectedRequest(
        response,
      );

      toast.success(
        'Les informations internes ont été enregistrées.',
      );

      await loadRequests();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSavingAdminFields(
        false,
      );
    }
  }

  async function updateStatus(
    status:
      ContactRequestStatus,
  ) {
    if (
      !selectedRequest
    ) {
      return;
    }

    setIsUpdatingStatus(
      true,
    );

    try {
      const response =
        await authorizedFetch<ContactRequestDetail>(
          `/contact-requests/admin/${selectedRequest.id}/status`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                status,

                ...(statusNote.trim()
                  ? {
                      note:
                        statusNote.trim(),
                    }
                  : {}),
              }),
          },
        );

      setSelectedRequest(
        response,
      );

      setStatusNote(
        '',
      );

      toast.success(
        `La demande est maintenant « ${STATUS_LABELS[status]} ».`,
      );

      await loadRequests();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsUpdatingStatus(
        false,
      );
    }
  }

  function clearFilters() {
    setSearch(
      '',
    );

    setStatusFilter(
      '',
    );

    setSourceFilter(
      '',
    );

    setAssignedToFilter(
      '',
    );

    setPage(
      1,
    );
  }

  return (
    <section className="admin-contact-requests">
      <header className="admin-contact-requests__header">
        <div>
          <span className="admin-contact-requests__eyebrow">
            Suivi commercial
          </span>

          <h1>
            Demandes de contact
          </h1>

          <p>
            Consultez les besoins reçus depuis le site,
            affectez-les et faites progresser leur traitement.
          </p>
        </div>

        <button
          type="button"
          className="admin-contact-requests__refresh"
          onClick={
            () =>
              void loadRequests()
          }
          disabled={
            isLoading
          }
        >
          <RefreshCw
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

          Actualiser
        </button>
      </header>

      <div className="admin-contact-requests__stats">
        <article>
          <span>
            <MailQuestion
              size={
                19
              }
              aria-hidden="true"
            />
          </span>

          <div>
            <strong>
              {
                total
              }
            </strong>

            <small>
              Demandes trouvées
            </small>
          </div>
        </article>

        <article>
          <span>
            <Clock3
              size={
                19
              }
              aria-hidden="true"
            />
          </span>

          <div>
            <strong>
              {
                pendingCount
              }
            </strong>

            <small>
              À traiter sur cette page
            </small>
          </div>
        </article>
      </div>

      <div className="admin-contact-requests__filters">
        <label className="admin-contact-requests__search">
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
            placeholder="Rechercher un nom, une entreprise, un e-mail…"
            onChange={
              event =>
                setSearch(
                  event.target.value,
                )
            }
          />
        </label>

        <select
          value={
            statusFilter
          }
          onChange={
            event =>
              setStatusFilter(
                event.target.value as
                  | ContactRequestStatus
                  | '',
              )
          }
        >
          <option value="">
            Tous les statuts
          </option>

          {
            Object.entries(
              STATUS_LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {
                    label
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          value={
            sourceFilter
          }
          onChange={
            event =>
              setSourceFilter(
                event.target.value as
                  | ContactRequestSource
                  | '',
              )
          }
        >
          <option value="">
            Toutes les origines
          </option>

          {
            Object.entries(
              SOURCE_LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {
                    label
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          value={
            assignedToFilter
          }
          onChange={
            event =>
              setAssignedToFilter(
                event.target.value,
              )
          }
        >
          <option value="">
            Tous les responsables
          </option>

          {
            options?.administrators.map(
              administrator => (
                <option
                  key={
                    administrator.id
                  }
                  value={
                    administrator.id
                  }
                >
                  {
                    administrator.fullName
                  }
                </option>
              ),
            )
          }
        </select>

        <button
          type="button"
          onClick={
            clearFilters
          }
        >
          Réinitialiser
        </button>
      </div>

      <div className="admin-contact-requests__list">
        {
          isLoading
            ? (
                <div className="admin-contact-requests__state">
                  <LoaderCircle
                    size={
                      28
                    }
                    className="admin-spinner"
                    aria-hidden="true"
                  />

                  <span>
                    Chargement des demandes…
                  </span>
                </div>
              )
            : requests.length ===
              0
              ? (
                  <div className="admin-contact-requests__state">
                    <Inbox
                      size={
                        34
                      }
                      aria-hidden="true"
                    />

                    <strong>
                      Aucune demande trouvée
                    </strong>

                    <span>
                      Modifiez les filtres ou attendez une nouvelle demande.
                    </span>
                  </div>
                )
              : requests.map(
                  request => {
                    const StatusIcon =
                      STATUS_ICONS[
                        request.status
                      ];

                    return (
                      <button
                        key={
                          request.id
                        }
                        type="button"
                        className="admin-contact-request-card"
                        data-status={
                          request.status
                        }
                        onClick={
                          () =>
                            void loadRequestDetail(
                              request.id,
                            )
                        }
                      >
                        <span className="admin-contact-request-card__status-icon">
                          <StatusIcon
                            size={
                              18
                            }
                            aria-hidden="true"
                          />
                        </span>

                        <span className="admin-contact-request-card__identity">
                          <strong>
                            {
                              request.fullName
                            }
                          </strong>

                          <small>
                            {
                              request.jobTitle
                            }
                            {' · '}
                            {
                              request.companyName
                            }
                          </small>
                        </span>

                        <span className="admin-contact-request-card__contact">
                          <small>
                            {
                              request.email
                            }
                          </small>

                          <small>
                            {
                              request.phoneNumber
                            }
                          </small>
                        </span>

                        <span className="admin-contact-request-card__source">
                          {
                            SOURCE_LABELS[
                              request.source
                            ]
                          }
                        </span>

                        <span
                          className="admin-contact-request-card__badge"
                          data-status={
                            request.status
                          }
                        >
                          {
                            STATUS_LABELS[
                              request.status
                            ]
                          }
                        </span>

                        <span className="admin-contact-request-card__date">
                          {
                            formatDateTime(
                              request.createdAt,
                            )
                          }
                        </span>

                        <ChevronRight
                          size={
                            19
                          }
                          aria-hidden="true"
                        />
                      </button>
                    );
                  },
                )
        }
      </div>

      {
        totalPages >
        1
          ? (
              <footer className="admin-contact-requests__pagination">
                <button
                  type="button"
                  disabled={
                    page <=
                    1
                  }
                  onClick={
                    () =>
                      setPage(
                        current =>
                          Math.max(
                            current -
                              1,
                            1,
                          ),
                      )
                  }
                >
                  <ChevronLeft
                    size={
                      18
                    }
                    aria-hidden="true"
                  />

                  Précédent
                </button>

                <span>
                  Page {
                    page
                  } sur {
                    totalPages
                  }
                </span>

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={
                    () =>
                      setPage(
                        current =>
                          Math.min(
                            current +
                              1,
                            totalPages,
                          ),
                      )
                  }
                >
                  Suivant

                  <ChevronRight
                    size={
                      18
                    }
                    aria-hidden="true"
                  />
                </button>
              </footer>
            )
          : null
      }

      {
        selectedRequest ||
        isLoadingDetail
          ? (
              <>
                <button
                  type="button"
                  className="admin-contact-request-drawer__backdrop"
                  aria-label="Fermer le détail"
                  onClick={
                    () =>
                      setSelectedRequest(
                        null,
                      )
                  }
                />

                <aside className="admin-contact-request-drawer">
                  {
                    isLoadingDetail &&
                    !selectedRequest
                      ? (
                          <div className="admin-contact-requests__state">
                            <LoaderCircle
                              size={
                                30
                              }
                              className="admin-spinner"
                              aria-hidden="true"
                            />

                            <span>
                              Chargement du détail…
                            </span>
                          </div>
                        )
                      : selectedRequest
                        ? (
                            <>
                              <header className="admin-contact-request-drawer__header">
                                <div>
                                  <span>
                                    {
                                      SOURCE_LABELS[
                                        selectedRequest.source
                                      ]
                                    }
                                  </span>

                                  <h2>
                                    {
                                      selectedRequest.fullName
                                    }
                                  </h2>

                                  <p>
                                    {
                                      selectedRequest.jobTitle
                                    }
                                    {' · '}
                                    {
                                      selectedRequest.companyName
                                    }
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  aria-label="Fermer le détail"
                                  onClick={
                                    () =>
                                      setSelectedRequest(
                                        null,
                                      )
                                  }
                                >
                                  <X
                                    size={
                                      21
                                    }
                                    aria-hidden="true"
                                  />
                                </button>
                              </header>

                              <div className="admin-contact-request-drawer__content">
                                <section className="admin-contact-request-drawer__status">
                                  <div>
                                    <span
                                      className="admin-contact-request-card__badge"
                                      data-status={
                                        selectedRequest.status
                                      }
                                    >
                                      {
                                        STATUS_LABELS[
                                          selectedRequest.status
                                        ]
                                      }
                                    </span>

                                    <small>
                                      Mise à jour le{' '}
                                      {
                                        formatDateTime(
                                          selectedRequest.statusChangedAt,
                                        )
                                      }
                                    </small>
                                  </div>

                                  {
                                    selectedRequest.allowedNextStatuses.length >
                                    0
                                      ? (
                                          <div className="admin-contact-request-drawer__status-actions">
                                            <label>
                                              <span>
                                                Note liée au changement
                                              </span>

                                              <textarea
                                                value={
                                                  statusNote
                                                }
                                                maxLength={
                                                  500
                                                }
                                                rows={
                                                  2
                                                }
                                                placeholder="Ex. Premier échange téléphonique effectué."
                                                onChange={
                                                  event =>
                                                    setStatusNote(
                                                      event.target.value,
                                                    )
                                                }
                                              />
                                            </label>

                                            <div>
                                              {
                                                selectedRequest.allowedNextStatuses.map(
                                                  nextStatus => (
                                                    <button
                                                      key={
                                                        nextStatus
                                                      }
                                                      type="button"
                                                      data-status={
                                                        nextStatus
                                                      }
                                                      disabled={
                                                        isUpdatingStatus
                                                      }
                                                      onClick={
                                                        () =>
                                                          void updateStatus(
                                                            nextStatus,
                                                          )
                                                      }
                                                    >
                                                      {
                                                        isUpdatingStatus
                                                          ? (
                                                              <LoaderCircle
                                                                size={
                                                                  16
                                                                }
                                                                className="admin-spinner"
                                                                aria-hidden="true"
                                                              />
                                                            )
                                                          : (
                                                              <ArrowRight
                                                                size={
                                                                  16
                                                                }
                                                                aria-hidden="true"
                                                              />
                                                            )
                                                      }

                                                      Passer à « {
                                                        STATUS_LABELS[
                                                          nextStatus
                                                        ]
                                                      } »
                                                    </button>
                                                  ),
                                                )
                                              }
                                            </div>
                                          </div>
                                        )
                                      : (
                                          <p className="admin-contact-request-drawer__terminal-status">
                                            Ce statut est définitif. Aucun retour vers une étape précédente n’est autorisé.
                                          </p>
                                        )
                                  }
                                </section>

                                <section className="admin-contact-request-drawer__section">
                                  <h3>
                                    Coordonnées
                                  </h3>

                                  <div className="admin-contact-request-drawer__contact-grid">
                                    <a
                                      href={
                                        `mailto:${selectedRequest.email}`
                                      }
                                    >
                                      <Mail
                                        size={
                                          18
                                        }
                                        aria-hidden="true"
                                      />

                                      <span>
                                        <small>
                                          E-mail
                                        </small>

                                        <strong>
                                          {
                                            selectedRequest.email
                                          }
                                        </strong>
                                      </span>

                                      <ExternalLink
                                        size={
                                          15
                                        }
                                        aria-hidden="true"
                                      />
                                    </a>

                                    <a
                                      href={
                                        `tel:${selectedRequest.phoneNumber.replace(
                                          /\s/g,
                                          '',
                                        )}`
                                      }
                                    >
                                      <Phone
                                        size={
                                          18
                                        }
                                        aria-hidden="true"
                                      />

                                      <span>
                                        <small>
                                          Téléphone
                                        </small>

                                        <strong>
                                          {
                                            selectedRequest.phoneNumber
                                          }
                                        </strong>
                                      </span>

                                      <ExternalLink
                                        size={
                                          15
                                        }
                                        aria-hidden="true"
                                      />
                                    </a>

                                    <div>
                                      <Building2
                                        size={
                                          18
                                        }
                                        aria-hidden="true"
                                      />

                                      <span>
                                        <small>
                                          Entreprise
                                        </small>

                                        <strong>
                                          {
                                            selectedRequest.companyName
                                          }
                                        </strong>
                                      </span>
                                    </div>

                                    <div>
                                      <UserRound
                                        size={
                                          18
                                        }
                                        aria-hidden="true"
                                      />

                                      <span>
                                        <small>
                                          Fonction
                                        </small>

                                        <strong>
                                          {
                                            selectedRequest.jobTitle
                                          }
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                </section>

                                <section className="admin-contact-request-drawer__section">
                                  <h3>
                                    Besoin exprimé
                                  </h3>

                                  <p className="admin-contact-request-drawer__need">
                                    {
                                      selectedRequest.needDescription
                                    }
                                  </p>
                                </section>

                                {
                                  selectedRequest.wantsAppointment
                                    ? (
                                        <section className="admin-contact-request-drawer__section">
                                          <h3>
                                            Disponibilités proposées
                                          </h3>

                                          <div className="admin-contact-request-drawer__availabilities">
                                            {
                                              selectedRequest.availabilities.map(
                                                availability => (
                                                  <article
                                                    key={
                                                      availability.id
                                                    }
                                                  >
                                                    <CalendarDays
                                                      size={
                                                        18
                                                      }
                                                      aria-hidden="true"
                                                    />

                                                    <div>
                                                      <strong>
                                                        {
                                                          formatDateTime(
                                                            availability.startsAt,
                                                          )
                                                        }
                                                      </strong>

                                                      <span>
                                                        jusqu’au{' '}
                                                        {
                                                          formatDateTime(
                                                            availability.endsAt,
                                                          )
                                                        }
                                                      </span>

                                                      <small>
                                                        {
                                                          availability.timezone
                                                        }
                                                      </small>

                                                      {
                                                        availability.note
                                                          ? (
                                                              <p>
                                                                {
                                                                  availability.note
                                                                }
                                                              </p>
                                                            )
                                                          : null
                                                      }
                                                    </div>
                                                  </article>
                                                ),
                                              )
                                            }
                                          </div>
                                        </section>
                                      )
                                    : null
                                }

                                <section className="admin-contact-request-drawer__section">
                                  <h3>
                                    Traitement interne
                                  </h3>

                                  <div className="admin-contact-request-drawer__internal-form">
                                    <label>
                                      <span>
                                        Responsable de la demande
                                      </span>

                                      <select
                                        value={
                                          assignedToUserId
                                        }
                                        onChange={
                                          event =>
                                            setAssignedToUserId(
                                              event.target.value,
                                            )
                                        }
                                      >
                                        <option value="">
                                          Non affectée
                                        </option>

                                        {
                                          options?.administrators.map(
                                            administrator => (
                                              <option
                                                key={
                                                  administrator.id
                                                }
                                                value={
                                                  administrator.id
                                                }
                                              >
                                                {
                                                  administrator.fullName
                                                }
                                              </option>
                                            ),
                                          )
                                        }
                                      </select>
                                    </label>

                                    <label>
                                      <span>
                                        Note interne
                                      </span>

                                      <textarea
                                        value={
                                          internalNote
                                        }
                                        maxLength={
                                          5000
                                        }
                                        rows={
                                          5
                                        }
                                        placeholder="Cette note est visible uniquement dans l’administration."
                                        onChange={
                                          event =>
                                            setInternalNote(
                                              event.target.value,
                                            )
                                        }
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      disabled={
                                        isSavingAdminFields
                                      }
                                      onClick={
                                        () =>
                                          void saveAdminFields()
                                      }
                                    >
                                      {
                                        isSavingAdminFields
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
                                              <Save
                                                size={
                                                  17
                                                }
                                                aria-hidden="true"
                                              />
                                            )
                                      }

                                      Enregistrer
                                    </button>
                                  </div>
                                </section>

                                <section className="admin-contact-request-drawer__section">
                                  <h3>
                                    Historique du traitement
                                  </h3>

                                  <div className="admin-contact-request-drawer__history">
                                    {
                                      selectedRequest.statusHistory.map(
                                        history => (
                                          <article
                                            key={
                                              history.id
                                            }
                                          >
                                            <span
                                              data-status={
                                                history.newStatus
                                              }
                                            />

                                            <div>
                                              <strong>
                                                {
                                                  STATUS_LABELS[
                                                    history.newStatus
                                                  ]
                                                }
                                              </strong>

                                              <small>
                                                {
                                                  formatDateTime(
                                                    history.changedAt,
                                                  )
                                                }

                                                {
                                                  history.changedBy
                                                    ? ` · ${history.changedBy.fullName}`
                                                    : ''
                                                }
                                              </small>

                                              {
                                                history.note
                                                  ? (
                                                      <p>
                                                        {
                                                          history.note
                                                        }
                                                      </p>
                                                    )
                                                  : null
                                              }
                                            </div>
                                          </article>
                                        ),
                                      )
                                    }
                                  </div>
                                </section>
                              </div>
                            </>
                          )
                        : null
                  }
                </aside>
              </>
            )
          : null
      }
    </section>
  );
}