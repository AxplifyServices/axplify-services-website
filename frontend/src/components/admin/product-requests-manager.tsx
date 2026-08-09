'use client';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  ExternalLink,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Package,
  Phone,
  Presentation,
  RefreshCw,
  Save,
  Search,
  ShoppingCart,
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

type ProductRequestStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'PROCESSED'
  | 'CANCELLED';

type ProductRequestType =
  | 'CONTACT'
  | 'DEMO'
  | 'ORDER';

type Locale =
  | 'fr'
  | 'en'
  | 'ar';

type TranslatedValue = {
  fr:
    string | null;

  en:
    string | null;

  ar:
    string | null;
};

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

type ProductSummary = {
  id:
    string;

  integrationKey:
    string;

  name:
    TranslatedValue;
};

type ProductRequestListItem = {
  id:
    string;

  requestType:
    ProductRequestType;

  locale:
    Locale;

  firstName:
    string;

  lastName:
    string;

  fullName:
    string;

  companyName:
    string | null;

  email:
    string;

  phoneNumber:
    string | null;

  status:
    ProductRequestStatus;

  statusChangedAt:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  product:
    ProductSummary | null;

  assignedTo:
    UserSummary | null;
};

type ProductRequestsResponse = {
  items:
    ProductRequestListItem[];

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

type ProductRequestStatusHistory = {
  id:
    string;

  previousStatus:
    ProductRequestStatus | null;

  newStatus:
    ProductRequestStatus;

  note:
    string | null;

  changedAt:
    string;

  changedBy:
    UserSummary | null;
};

type ProductRequestDetail = {
  id:
    string;

  requestType:
    ProductRequestType;

  locale:
    Locale;

  firstName:
    string;

  lastName:
    string;

  fullName:
    string;

  companyName:
    string | null;

  email:
    string;

  phoneNumber:
    string | null;

  message:
    string;

  sourceUrl:
    string | null;

  status:
    ProductRequestStatus;

  allowedNextStatuses:
    ProductRequestStatus[];

  statusChangedAt:
    string;

  internalNote:
    string | null;

  privacyConsent:
    boolean;

  privacyConsentAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  product:
    | (
        ProductSummary & {
          isActive:
            boolean;

          linkUrl:
            string | null;

          title:
            TranslatedValue;
        }
      )
    | null;

  assignedTo:
    UserSummary | null;

  lastUpdatedBy:
    UserSummary | null;

  statusHistory:
    ProductRequestStatusHistory[];
};

type AdminOptions = {
  statuses:
    ProductRequestStatus[];

  requestTypes:
    ProductRequestType[];

  administrators:
    UserSummary[];

  products: Array<
    ProductSummary & {
      isActive:
        boolean;
    }
  >;
};

const STATUS_LABELS:
  Record<
    ProductRequestStatus,
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

const REQUEST_TYPE_LABELS:
  Record<
    ProductRequestType,
    string
  > = {
    CONTACT:
      'Contact',

    DEMO:
      'Demande de démo',

    ORDER:
      'Demande de commande',
  };

const REQUEST_TYPE_SHORT_LABELS:
  Record<
    ProductRequestType,
    string
  > = {
    CONTACT:
      'Contact',

    DEMO:
      'Démo',

    ORDER:
      'Commande',
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
  ProductRequestStatus,
  typeof Inbox
>;

const REQUEST_TYPE_ICONS = {
  CONTACT:
    MessageSquareText,

  DEMO:
    Presentation,

  ORDER:
    ShoppingCart,
} satisfies Record<
  ProductRequestType,
  typeof MessageSquareText
>;

const PAGE_SIZE =
  10;

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

function getTranslatedValue(
  value:
    TranslatedValue | null | undefined,

  locale:
    Locale = 'fr',
) {
  if (
    !value
  ) {
    return 'Produit indisponible';
  }

  return (
    value[
      locale
    ] ??
    value.fr ??
    value.en ??
    value.ar ??
    'Produit sans nom'
  );
}

function getLocaleLabel(
  locale:
    Locale,
) {
  switch (
    locale
  ) {
    case 'en':
      return 'Anglais';

    case 'ar':
      return 'Arabe';

    default:
      return 'Français';
  }
}

export function ProductRequestsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    requests,
    setRequests,
  ] =
    useState<
      ProductRequestListItem[]
    >(
      [],
    );

  const [
    selectedRequest,
    setSelectedRequest,
  ] =
    useState<
      ProductRequestDetail | null
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
      ProductRequestStatus | ''
    >(
      '',
    );

  const [
    requestTypeFilter,
    setRequestTypeFilter,
  ] =
    useState<
      ProductRequestType | ''
    >(
      '',
    );

  const [
    productFilter,
    setProductFilter,
  ] =
    useState(
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
              '/product-requests/admin/options',
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
          requestTypeFilter
        ) {
          parameters.set(
            'requestType',
            requestTypeFilter,
          );
        }

        if (
          productFilter
        ) {
          parameters.set(
            'productId',
            productFilter,
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
            await authorizedFetch<ProductRequestsResponse>(
              `/product-requests/admin?${parameters.toString()}`,
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
        productFilter,
        requestTypeFilter,
        search,
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
            await authorizedFetch<ProductRequestDetail>(
              `/product-requests/admin/${id}`,
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
      productFilter,
      requestTypeFilter,
      search,
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

  const visiblePendingCount =
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

  const visibleDemoCount =
    useMemo(
      () =>
        requests.filter(
          request =>
            request.requestType ===
            'DEMO',
        ).length,
      [
        requests,
      ],
    );

  const visibleOrderCount =
    useMemo(
      () =>
        requests.filter(
          request =>
            request.requestType ===
            'ORDER',
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
        await authorizedFetch<ProductRequestDetail>(
          `/product-requests/admin/${selectedRequest.id}`,
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
      ProductRequestStatus,
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
        await authorizedFetch<ProductRequestDetail>(
          `/product-requests/admin/${selectedRequest.id}/status`,
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

    setRequestTypeFilter(
      '',
    );

    setProductFilter(
      '',
    );

    setAssignedToFilter(
      '',
    );

    setPage(
      1,
    );
  }

  const hasActiveFilters =
    Boolean(
      search ||
        statusFilter ||
        requestTypeFilter ||
        productFilter ||
        assignedToFilter,
    );

  return (
    <section className="admin-product-requests">
      <header className="admin-product-requests__header">
        <div>
          <span className="admin-product-requests__eyebrow">
            Produits · Suivi commercial
          </span>

          <h1>
            Demandes produits
          </h1>

          <p>
            Centralisez les prises de contact, demandes de démonstration
            et intentions de commande provenant des landing pages de vos
            produits.
          </p>
        </div>

        <button
          type="button"
          className="admin-product-requests__refresh"
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

      <div className="admin-product-requests__stats">
        <article>
          <span>
            <Package
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
                visiblePendingCount
              }
            </strong>

            <small>
              À traiter sur cette page
            </small>
          </div>
        </article>

        <article>
          <span>
            <Presentation
              size={
                19
              }
              aria-hidden="true"
            />
          </span>

          <div>
            <strong>
              {
                visibleDemoCount
              }
            </strong>

            <small>
              Démos sur cette page
            </small>
          </div>
        </article>

        <article>
          <span>
            <ShoppingCart
              size={
                19
              }
              aria-hidden="true"
            />
          </span>

          <div>
            <strong>
              {
                visibleOrderCount
              }
            </strong>

            <small>
              Commandes sur cette page
            </small>
          </div>
        </article>
      </div>

      <div className="admin-product-requests__filters">
        <label className="admin-product-requests__search">
          <Search
            size={
              17
            }
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            placeholder="Client, entreprise, e-mail, téléphone ou message…"
            onChange={
              event =>
                setSearch(
                  event.target.value,
                )
            }
          />
        </label>

        <select
          aria-label="Filtrer par produit"
          value={
            productFilter
          }
          onChange={
            event =>
              setProductFilter(
                event.target.value,
              )
          }
        >
          <option value="">
            Tous les produits
          </option>

          {
            options?.products.map(
              product => (
                <option
                  key={
                    product.id
                  }
                  value={
                    product.id
                  }
                >
                  {
                    getTranslatedValue(
                      product.name,
                      'fr',
                    )
                  }
                  {
                    !product.isActive
                      ? ' — inactif'
                      : ''
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          aria-label="Filtrer par type de demande"
          value={
            requestTypeFilter
          }
          onChange={
            event =>
              setRequestTypeFilter(
                event.target.value as
                  ProductRequestType | '',
              )
          }
        >
          <option value="">
            Tous les types
          </option>

          {
            options?.requestTypes.map(
              requestType => (
                <option
                  key={
                    requestType
                  }
                  value={
                    requestType
                  }
                >
                  {
                    REQUEST_TYPE_LABELS[
                      requestType
                    ]
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          aria-label="Filtrer par statut"
          value={
            statusFilter
          }
          onChange={
            event =>
              setStatusFilter(
                event.target.value as
                  ProductRequestStatus | '',
              )
          }
        >
          <option value="">
            Tous les statuts
          </option>

          {
            options?.statuses.map(
              status => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {
                    STATUS_LABELS[
                      status
                    ]
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          aria-label="Filtrer par administrateur"
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
          disabled={
            !hasActiveFilters
          }
        >
          <X
            size={
              16
            }
            aria-hidden="true"
          />

          Effacer
        </button>
      </div>

      {
        isLoading
          ? (
              <div className="admin-product-requests__state">
                <LoaderCircle
                  size={
                    26
                  }
                  className="admin-spinner"
                  aria-hidden="true"
                />

                <strong>
                  Chargement des demandes…
                </strong>
              </div>
            )
          : requests.length ===
              0
            ? (
                <div className="admin-product-requests__state">
                  <Package
                    size={
                      28
                    }
                    aria-hidden="true"
                  />

                  <strong>
                    Aucune demande trouvée
                  </strong>

                  <span>
                    Modifiez vos filtres ou attendez les premières
                    demandes provenant des landing pages produits.
                  </span>
                </div>
              )
            : (
                <div className="admin-product-requests__list">
                  {
                    requests.map(
                      request => {
                        const StatusIcon =
                          STATUS_ICONS[
                            request.status
                          ];

                        const RequestTypeIcon =
                          REQUEST_TYPE_ICONS[
                            request.requestType
                          ];

                        return (
                          <button
                            key={
                              request.id
                            }
                            type="button"
                            className="admin-product-request-card"
                            data-status={
                              request.status
                            }
                            data-request-type={
                              request.requestType
                            }
                            onClick={
                              () =>
                                void loadRequestDetail(
                                  request.id,
                                )
                            }
                          >
                            <span className="admin-product-request-card__type-icon">
                              <RequestTypeIcon
                                size={
                                  19
                                }
                                aria-hidden="true"
                              />
                            </span>

                            <span className="admin-product-request-card__identity">
                              <strong>
                                {
                                  request.fullName
                                }
                              </strong>

                              <small>
                                {
                                  request.companyName ||
                                  request.email
                                }
                              </small>
                            </span>

                            <span className="admin-product-request-card__product">
                              <small>
                                Produit
                              </small>

                              <strong>
                                {
                                  getTranslatedValue(
                                    request.product?.name,
                                    request.locale,
                                  )
                                }
                              </strong>
                            </span>

                            <span className="admin-product-request-card__request-type">
                              <RequestTypeIcon
                                size={
                                  15
                                }
                                aria-hidden="true"
                              />

                              {
                                REQUEST_TYPE_SHORT_LABELS[
                                  request.requestType
                                ]
                              }
                            </span>

                            <span className="admin-product-request-card__status">
                              <StatusIcon
                                size={
                                  15
                                }
                                aria-hidden="true"
                              />

                              {
                                STATUS_LABELS[
                                  request.status
                                ]
                              }
                            </span>

                            <span className="admin-product-request-card__date">
                              {
                                formatDateTime(
                                  request.createdAt,
                                )
                              }
                            </span>

                            <ChevronRight
                              size={
                                18
                              }
                              aria-hidden="true"
                            />
                          </button>
                        );
                      },
                    )
                  }
                </div>
              )
      }

      {
        !isLoading &&
        total >
          0
          ? (
              <div className="admin-product-requests__pagination">
                <button
                  type="button"
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
                  disabled={
                    page <=
                    1
                  }
                >
                  <ChevronLeft
                    size={
                      16
                    }
                    aria-hidden="true"
                  />

                  Précédent
                </button>

                <span>
                  Page {page} sur {totalPages}
                  {' · '}
                  {total} demande
                  {
                    total >
                    1
                      ? 's'
                      : ''
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    () =>
                      setPage(
                        current =>
                          Math.min(
                            totalPages,
                            current +
                              1,
                          ),
                      )
                  }
                  disabled={
                    page >=
                    totalPages
                  }
                >
                  Suivant

                  <ChevronRight
                    size={
                      16
                    }
                    aria-hidden="true"
                  />
                </button>
              </div>
            )
          : null
      }

      {
        selectedRequest
          ? (
              <>
                <button
                  type="button"
                  className="admin-product-request-drawer__backdrop"
                  aria-label="Fermer le détail"
                  onClick={
                    () =>
                      setSelectedRequest(
                        null,
                      )
                  }
                />

                <aside
                  className="admin-product-request-drawer"
                  aria-label="Détail de la demande produit"
                >
                  <header className="admin-product-request-drawer__header">
                    <div>
                      <span>
                        {
                          REQUEST_TYPE_LABELS[
                            selectedRequest.requestType
                          ]
                        }
                      </span>

                      <h2>
                        {
                          getTranslatedValue(
                            selectedRequest.product?.name,
                            selectedRequest.locale,
                          )
                        }
                      </h2>

                      <p>
                        {
                          selectedRequest.fullName
                        }
                        {' · '}
                        {
                          formatDateTime(
                            selectedRequest.createdAt,
                          )
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Fermer"
                      onClick={
                        () =>
                          setSelectedRequest(
                            null,
                          )
                      }
                    >
                      <X
                        size={
                          20
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </header>

                  <div className="admin-product-request-drawer__content">
                    {
                      isLoadingDetail
                        ? (
                            <div className="admin-product-requests__state">
                              <LoaderCircle
                                size={
                                  25
                                }
                                className="admin-spinner"
                                aria-hidden="true"
                              />

                              <strong>
                                Chargement…
                              </strong>
                            </div>
                          )
                        : (
                            <>
                              <section className="admin-product-request-drawer__summary">
                                <div className="admin-product-request-drawer__summary-main">
                                  {
                                    (() => {
                                      const RequestIcon =
                                        REQUEST_TYPE_ICONS[
                                          selectedRequest.requestType
                                        ];

                                      return (
                                        <span
                                          data-request-type={
                                            selectedRequest.requestType
                                          }
                                        >
                                          <RequestIcon
                                            size={
                                              20
                                            }
                                            aria-hidden="true"
                                          />
                                        </span>
                                      );
                                    })()
                                  }

                                  <div>
                                    <small>
                                      Type de demande
                                    </small>

                                    <strong>
                                      {
                                        REQUEST_TYPE_LABELS[
                                          selectedRequest.requestType
                                        ]
                                      }
                                    </strong>
                                  </div>
                                </div>

                                <div>
                                  <small>
                                    Langue
                                  </small>

                                  <strong>
                                    {
                                      getLocaleLabel(
                                        selectedRequest.locale,
                                      )
                                    }
                                  </strong>
                                </div>
                              </section>

                              <section className="admin-product-request-drawer__status">
                                <div>
                                  <div>
                                    <small>
                                      Statut actuel
                                    </small>

                                    <span
                                      className="admin-product-request-drawer__status-badge"
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
                                  </div>

                                  <small>
                                    Modifié le{' '}
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
                                        <div className="admin-product-request-drawer__status-actions">
                                          <label>
                                            <span>
                                              Note de changement de statut
                                            </span>

                                            <textarea
                                              rows={
                                                3
                                              }
                                              value={
                                                statusNote
                                              }
                                              placeholder="Optionnel : contexte ou action réalisée…"
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
                                                                15
                                                              }
                                                              className="admin-spinner"
                                                              aria-hidden="true"
                                                            />
                                                          )
                                                        : (
                                                            <ArrowRight
                                                              size={
                                                                15
                                                              }
                                                              aria-hidden="true"
                                                            />
                                                          )
                                                    }

                                                    {
                                                      STATUS_LABELS[
                                                        nextStatus
                                                      ]
                                                    }
                                                  </button>
                                                ),
                                              )
                                            }
                                          </div>
                                        </div>
                                      )
                                    : (
                                        <p className="admin-product-request-drawer__terminal-status">
                                          Ce statut est définitif. Aucun retour vers une
                                          étape précédente n’est autorisé.
                                        </p>
                                      )
                                }
                              </section>

                              <section className="admin-product-request-drawer__section">
                                <h3>
                                  Produit concerné
                                </h3>

                                <div className="admin-product-request-drawer__product">
                                  <span>
                                    <Package
                                      size={
                                        21
                                      }
                                      aria-hidden="true"
                                    />
                                  </span>

                                  <div>
                                    <small>
                                      Produit
                                    </small>

                                    <strong>
                                      {
                                        getTranslatedValue(
                                          selectedRequest.product?.name,
                                          selectedRequest.locale,
                                        )
                                      }
                                    </strong>

                                    {
                                      selectedRequest.product?.title
                                        ? (
                                            <p>
                                              {
                                                getTranslatedValue(
                                                  selectedRequest.product.title,
                                                  selectedRequest.locale,
                                                )
                                              }
                                            </p>
                                          )
                                        : null
                                    }
                                  </div>

                                  {
                                    selectedRequest.product
                                      ? (
                                          <em
                                            data-active={
                                              selectedRequest.product.isActive
                                            }
                                          >
                                            {
                                              selectedRequest.product.isActive
                                                ? 'Actif'
                                                : 'Inactif'
                                            }
                                          </em>
                                        )
                                      : null
                                  }
                                </div>
                              </section>

                              <section className="admin-product-request-drawer__section">
                                <h3>
                                  Coordonnées
                                </h3>

                                <div className="admin-product-request-drawer__contact-grid">
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

                                  {
                                    selectedRequest.phoneNumber
                                      ? (
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
                                        )
                                      : (
                                          <div>
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
                                                Non renseigné
                                              </strong>
                                            </span>
                                          </div>
                                        )
                                  }

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
                                          selectedRequest.companyName ||
                                          'Non renseignée'
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
                                        Contact
                                      </small>

                                      <strong>
                                        {
                                          selectedRequest.fullName
                                        }
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                              </section>

                              <section className="admin-product-request-drawer__section">
                                <h3>
                                  Demande
                                </h3>

                                <p className="admin-product-request-drawer__message">
                                  {
                                    selectedRequest.message
                                  }
                                </p>
                              </section>

                              {
                                selectedRequest.sourceUrl
                                  ? (
                                      <section className="admin-product-request-drawer__section">
                                        <h3>
                                          Origine
                                        </h3>

                                        <a
                                          className="admin-product-request-drawer__source-link"
                                          href={
                                            selectedRequest.sourceUrl
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          <ExternalLink
                                            size={
                                              17
                                            }
                                            aria-hidden="true"
                                          />

                                          <span>
                                            <small>
                                              Landing page
                                            </small>

                                            <strong>
                                              {
                                                selectedRequest.sourceUrl
                                              }
                                            </strong>
                                          </span>
                                        </a>
                                      </section>
                                    )
                                  : null
                              }

                              <section className="admin-product-request-drawer__section">
                                <h3>
                                  Traitement interne
                                </h3>

                                <div className="admin-product-request-drawer__internal-form">
                                  <label>
                                    <span>
                                      Responsable
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
                                        Non affecté
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
                                      rows={
                                        5
                                      }
                                      value={
                                        internalNote
                                      }
                                      placeholder="Informations utiles au suivi de cette demande…"
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
                                                16
                                              }
                                              className="admin-spinner"
                                              aria-hidden="true"
                                            />
                                          )
                                        : (
                                            <Save
                                              size={
                                                16
                                              }
                                              aria-hidden="true"
                                            />
                                          )
                                    }

                                    Enregistrer
                                  </button>
                                </div>
                              </section>

                              <section className="admin-product-request-drawer__section">
                                <h3>
                                  Historique
                                </h3>

                                <div className="admin-product-request-drawer__history">
                                  {
                                    selectedRequest.statusHistory.map(
                                      historyItem => (
                                        <article
                                          key={
                                            historyItem.id
                                          }
                                        >
                                          <span
                                            data-status={
                                              historyItem.newStatus
                                            }
                                          />

                                          <div>
                                            <strong>
                                              {
                                                STATUS_LABELS[
                                                  historyItem.newStatus
                                                ]
                                              }
                                            </strong>

                                            <small>
                                              {
                                                formatDateTime(
                                                  historyItem.changedAt,
                                                )
                                              }

                                              {
                                                historyItem.changedBy
                                                  ? ` · ${historyItem.changedBy.fullName}`
                                                  : ''
                                              }
                                            </small>

                                            {
                                              historyItem.note
                                                ? (
                                                    <p>
                                                      {
                                                        historyItem.note
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
                            </>
                          )
                    }
                  </div>
                </aside>
              </>
            )
          : null
      }
    </section>
  );
}