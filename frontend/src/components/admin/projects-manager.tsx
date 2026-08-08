'use client';

import {
  Archive,
  BriefcaseBusiness,
  Building2,
  Check,
  Eye,
  FilePenLine,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
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

const EXPERTISE_CODES =
  [
    'digital',
    'automation',
    'data',
    'ai',
    'crm',
    'architecture',
    'analytics',
    'leadGeneration',
    'marketingStrategy',
  ] as const;

type ExpertiseCode =
  (typeof EXPERTISE_CODES)[number];

type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

type ClientOption = {
  id:
    string;

  name:
    string;

  industryFr:
    string;

  logoUrl:
    string;

  isActive:
    boolean;
};

type ProjectClient = {
  id:
    string;

  name:
    string;

  industryFr:
    string;

  industryEn:
    string | null;

  industryAr:
    string | null;

  logoUrl:
    string;

  logoAltFr:
    string | null;

  logoAltEn:
    string | null;

  logoAltAr:
    string | null;

  isActive:
    boolean;
};

type Project = {
  id:
    string;

  clientId:
    string;

  client:
    ProjectClient;

  titleFr:
    string;

  titleEn:
    string | null;

  titleAr:
    string | null;

  descriptionFr:
    string;

  descriptionEn:
    string | null;

  descriptionAr:
    string | null;

  expertiseCodes:
    ExpertiseCode[];

  status:
    ProjectStatus;

  sortOrder:
    number;

  publishedAt:
    string | null;

  createdByUserId:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type ProjectsResponse = {
  items:
    Project[];

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

type ProjectFormState = {
  clientId:
    string;

  titleFr:
    string;

  titleEn:
    string;

  titleAr:
    string;

  descriptionFr:
    string;

  descriptionEn:
    string;

  descriptionAr:
    string;

  expertiseCodes:
    ExpertiseCode[];

  status:
    ProjectStatus;

  sortOrder:
    string;
};

const EXPERTISE_LABELS:
  Record<
    ExpertiseCode,
    string
  > = {
    digital:
      'Sites, applications et plateformes',

    automation:
      'Automatisation des processus',

    data:
      'Exploitation des données',

    ai:
      'Intelligence artificielle',

    crm:
      'CRM et outils métiers',

    architecture:
      'Architecture et infrastructure',

    analytics:
      'Tableaux de bord et analytics',

    leadGeneration:
      'Génération de prospects',

    marketingStrategy:
      'Stratégie marketing',
  };

const STATUS_LABELS:
  Record<
    ProjectStatus,
    string
  > = {
    DRAFT:
      'Brouillon',

    PUBLISHED:
      'Publié',

    ARCHIVED:
      'Archivé',
  };

const EMPTY_FORM:
  ProjectFormState = {
    clientId:
      '',

    titleFr:
      '',

    titleEn:
      '',

    titleAr:
      '',

    descriptionFr:
      '',

    descriptionEn:
      '',

    descriptionAr:
      '',

    expertiseCodes:
      [],

    status:
      'DRAFT',

    sortOrder:
      '0',
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

function projectToForm(
  project:
    Project,
):
  ProjectFormState
{
  return {
    clientId:
      project.clientId,

    titleFr:
      project.titleFr,

    titleEn:
      project.titleEn ??
      '',

    titleAr:
      project.titleAr ??
      '',

    descriptionFr:
      project.descriptionFr,

    descriptionEn:
      project.descriptionEn ??
      '',

    descriptionAr:
      project.descriptionAr ??
      '',

    expertiseCodes:
      project.expertiseCodes,

    status:
      project.status,

    sortOrder:
      String(
        project.sortOrder,
      ),
  };
}

export function ProjectsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    projects,
    setProjects,
  ] =
    useState<
      Project[]
    >(
      [],
    );

  const [
    clients,
    setClients,
  ] =
    useState<
      ClientOption[]
    >(
      [],
    );

  const [
    form,
    setForm,
  ] =
    useState<
      ProjectFormState
    >(
      EMPTY_FORM,
    );

  const [
    editingProjectId,
    setEditingProjectId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isFormOpen,
    setIsFormOpen,
  ] =
    useState(
      false,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  const [
    deletingProjectId,
    setDeletingProjectId,
  ] =
    useState<
      string | null
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
    clientFilter,
    setClientFilter,
  ] =
    useState(
      'all',
    );

  const [
    expertiseFilter,
    setExpertiseFilter,
  ] =
    useState<
      ExpertiseCode | 'all'
    >(
      'all',
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      ProjectStatus | 'all'
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
        10,

      total:
        0,

      totalPages:
        0,
    });

  const activeClients =
    useMemo(
      () =>
        clients.filter(
          client =>
            client.isActive,
        ),
      [
        clients,
      ],
    );

  const loadClients =
    useCallback(
      async () => {
        try {
          const response =
            await authorizedFetch<
              ClientOption[]
            >(
              '/clients/admin',
            );

          setClients(
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

  const loadProjects =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

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
          '20',
        );

        if (
          search.trim()
        ) {
          parameters.set(
            'search',
            search.trim(),
          );
        }

        if (
          clientFilter !==
          'all'
        ) {
          parameters.set(
            'clientId',
            clientFilter,
          );
        }

        if (
          expertiseFilter !==
          'all'
        ) {
          parameters.set(
            'expertise',
            expertiseFilter,
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

        try {
          const response =
            await authorizedFetch<
              ProjectsResponse
            >(
              `/projects/admin?${parameters.toString()}`,
            );

          setProjects(
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
        clientFilter,
        expertiseFilter,
        page,
        search,
        statusFilter,
      ],
    );

  useEffect(
    () => {
      void loadClients();
    },
    [
      loadClients,
    ],
  );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadProjects();
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
      loadProjects,
    ],
  );

  useEffect(
    () => {
      setPage(
        1,
      );
    },
    [
      clientFilter,
      expertiseFilter,
      search,
      statusFilter,
    ],
  );

  function updateFormField<
    Key extends keyof ProjectFormState,
  >(
    key:
      Key,

    value:
      ProjectFormState[Key],
  ) {
    setForm(
      currentForm => ({
        ...currentForm,

        [key]:
          value,
      }),
    );
  }

  function toggleExpertise(
    expertiseCode:
      ExpertiseCode,
  ) {
    setForm(
      currentForm => {
        const isSelected =
          currentForm
            .expertiseCodes
            .includes(
              expertiseCode,
            );

        return {
          ...currentForm,

          expertiseCodes:
            isSelected
              ? currentForm
                  .expertiseCodes
                  .filter(
                    value =>
                      value !==
                      expertiseCode,
                  )
              : [
                  ...currentForm
                    .expertiseCodes,
                  expertiseCode,
                ],
        };
      },
    );
  }

  function openCreateForm() {
    setEditingProjectId(
      null,
    );

    setForm({
      ...EMPTY_FORM,

      clientId:
        activeClients[0]
          ?.id ??
        '',
    });

    setIsFormOpen(
      true,
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function openEditForm(
    project:
      Project,
  ) {
    setEditingProjectId(
      project.id,
    );

    setForm(
      projectToForm(
        project,
      ),
    );

    setIsFormOpen(
      true,
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function closeForm() {
    if (
      isSubmitting
    ) {
      return;
    }

    setEditingProjectId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setIsFormOpen(
      false,
    );
  }

  function validateForm() {
    if (
      !form.clientId
    ) {
      return 'Sélectionne un client.';
    }

    if (
      form.titleFr.trim().length <
      3
    ) {
      return 'Le titre français doit contenir au moins 3 caractères.';
    }

    if (
      form.descriptionFr.trim().length <
      10
    ) {
      return 'La description française doit contenir au moins 10 caractères.';
    }

    if (
      form.expertiseCodes.length ===
      0
    ) {
      return 'Sélectionne au moins un domaine d’expertise.';
    }

    const sortOrder =
      Number(
        form.sortOrder,
      );

    if (
      !Number.isInteger(
        sortOrder,
      ) ||
      sortOrder <
        0
    ) {
      return 'L’ordre d’affichage doit être un nombre entier positif.';
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      toast.error(
        validationError,
      );

      return;
    }

    const payload = {
      clientId:
        form.clientId,

      titleFr:
        form.titleFr.trim(),

      titleEn:
        form.titleEn.trim() ||
        undefined,

      titleAr:
        form.titleAr.trim() ||
        undefined,

      descriptionFr:
        form.descriptionFr.trim(),

      descriptionEn:
        form.descriptionEn.trim() ||
        undefined,

      descriptionAr:
        form.descriptionAr.trim() ||
        undefined,

      expertiseCodes:
        form.expertiseCodes,

      status:
        form.status,

      sortOrder:
        Number(
          form.sortOrder,
        ),
    };

    setIsSubmitting(
      true,
    );

    try {
      await authorizedFetch(
        editingProjectId
          ? `/projects/${editingProjectId}`
          : '/projects',
        {
          method:
            editingProjectId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      toast.success(
        editingProjectId
          ? 'La réalisation a été mise à jour.'
          : 'La réalisation a été ajoutée.',
      );

      closeForm();

      await loadProjects();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  async function handleDelete(
    project:
      Project,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer définitivement la réalisation « ${project.titleFr} » ?`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingProjectId(
      project.id,
    );

    try {
      await authorizedFetch(
        `/projects/${project.id}`,
        {
          method:
            'DELETE',
        },
      );

      toast.success(
        'La réalisation a été supprimée.',
      );

      await loadProjects();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setDeletingProjectId(
        null,
      );
    }
  }

  return (
    <section className="admin-projects">
      <header className="admin-projects__header">
        <div>
          <span className="admin-projects__eyebrow">
            Portfolio Axplify Services
          </span>

          <h1>
            Réalisations
          </h1>

          <p>
            Présentez les projets menés pour vos clients et les expertises mobilisées pour atteindre leurs objectifs.
          </p>
        </div>

        <button
          type="button"
          className="admin-projects__primary-button"
          disabled={
            activeClients.length ===
            0
          }
          title={
            activeClients.length ===
            0
              ? 'Ajoutez d’abord un client actif.'
              : undefined
          }
          onClick={
            openCreateForm
          }
        >
          <Plus
            size={
              18
            }
            aria-hidden="true"
          />

          Ajouter une réalisation
        </button>
      </header>

      {
        clients.length ===
        0
          ? (
              <div className="admin-projects__notice">
                <Building2
                  size={
                    22
                  }
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Aucun client disponible
                  </strong>

                  <p>
                    Ajoutez d’abord un client dans la rubrique Clients avant de créer une réalisation.
                  </p>
                </div>
              </div>
            )
          : null
      }

      {
        isFormOpen
          ? (
              <form
                className="admin-projects__form"
                onSubmit={
                  handleSubmit
                }
              >
                <div className="admin-projects__form-heading">
                  <div>
                    <span>
                      {
                        editingProjectId
                          ? 'Modification'
                          : 'Nouvelle réalisation'
                      }
                    </span>

                    <h2>
                      {
                        editingProjectId
                          ? 'Modifier la réalisation'
                          : 'Ajouter une réalisation'
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="admin-projects__icon-button"
                    aria-label="Fermer le formulaire"
                    onClick={
                      closeForm
                    }
                  >
                    <X
                      size={
                        20
                      }
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="admin-projects__form-content">
                  <div className="admin-projects__form-main">
                    <label className="admin-projects__field">
                      <span>
                        Client associé *
                      </span>

                      <select
                        value={
                          form.clientId
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'clientId',
                              event.target.value,
                            )
                        }
                      >
                        <option value="">
                          Sélectionner un client
                        </option>

                        {
                          clients.map(
                            client => (
                              <option
                                key={
                                  client.id
                                }
                                value={
                                  client.id
                                }
                              >
                                {
                                  client.name
                                }
                                {
                                  client.isActive
                                    ? ''
                                    : ' — inactif'
                                }
                              </option>
                            ),
                          )
                        }
                      </select>
                    </label>

                    <div className="admin-projects__language-grid">
                      <label className="admin-projects__field">
                        <span>
                          Titre — Français *
                        </span>

                        <input
                          type="text"
                          maxLength={
                            220
                          }
                          value={
                            form.titleFr
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'titleFr',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label className="admin-projects__field">
                        <span>
                          Title — English
                        </span>

                        <input
                          type="text"
                          maxLength={
                            220
                          }
                          value={
                            form.titleEn
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'titleEn',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label
                        className="admin-projects__field"
                        dir="rtl"
                      >
                        <span>
                          العنوان — العربية
                        </span>

                        <input
                          type="text"
                          maxLength={
                            220
                          }
                          value={
                            form.titleAr
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'titleAr',
                                event.target.value,
                              )
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-projects__language-grid">
                      <label className="admin-projects__field">
                        <span>
                          Description — Français *
                        </span>

                        <textarea
                          rows={
                            6
                          }
                          maxLength={
                            1200
                          }
                          value={
                            form.descriptionFr
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'descriptionFr',
                                event.target.value,
                              )
                          }
                        />

                        <small>
                          {
                            form.descriptionFr.length
                          } / 1 200
                        </small>
                      </label>

                      <label className="admin-projects__field">
                        <span>
                          Description — English
                        </span>

                        <textarea
                          rows={
                            6
                          }
                          maxLength={
                            1200
                          }
                          value={
                            form.descriptionEn
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'descriptionEn',
                                event.target.value,
                              )
                          }
                        />

                        <small>
                          {
                            form.descriptionEn.length
                          } / 1 200
                        </small>
                      </label>

                      <label
                        className="admin-projects__field"
                        dir="rtl"
                      >
                        <span>
                          الوصف — العربية
                        </span>

                        <textarea
                          rows={
                            6
                          }
                          maxLength={
                            1200
                          }
                          value={
                            form.descriptionAr
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'descriptionAr',
                                event.target.value,
                              )
                          }
                        />

                        <small>
                          {
                            form.descriptionAr.length
                          } / 1 200
                        </small>
                      </label>
                    </div>

                    <fieldset className="admin-projects__expertise-fieldset">
                      <legend>
                        Domaines d’expertise *
                      </legend>

                      <p>
                        Sélectionnez toutes les expertises mobilisées pour ce projet.
                      </p>

                      <div className="admin-projects__expertise-grid">
                        {
                          EXPERTISE_CODES.map(
                            expertiseCode => {
                              const isSelected =
                                form.expertiseCodes.includes(
                                  expertiseCode,
                                );

                              return (
                                <button
                                  key={
                                    expertiseCode
                                  }
                                  type="button"
                                  className="admin-projects__expertise-option"
                                  data-selected={
                                    isSelected
                                  }
                                  aria-pressed={
                                    isSelected
                                  }
                                  onClick={
                                    () =>
                                      toggleExpertise(
                                        expertiseCode,
                                      )
                                  }
                                >
                                  <span className="admin-projects__expertise-check">
                                    {
                                      isSelected
                                        ? (
                                            <Check
                                              size={
                                                15
                                              }
                                              aria-hidden="true"
                                            />
                                          )
                                        : null
                                    }
                                  </span>

                                  {
                                    EXPERTISE_LABELS[
                                      expertiseCode
                                    ]
                                  }
                                </button>
                              );
                            },
                          )
                        }
                      </div>
                    </fieldset>
                  </div>

                  <aside className="admin-projects__settings">
                    <label className="admin-projects__field">
                      <span>
                        Statut
                      </span>

                      <select
                        value={
                          form.status
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'status',
                              event.target.value as ProjectStatus,
                            )
                        }
                      >
                        <option value="DRAFT">
                          Brouillon
                        </option>

                        <option value="PUBLISHED">
                          Publié
                        </option>

                        <option value="ARCHIVED">
                          Archivé
                        </option>
                      </select>
                    </label>

                    <label className="admin-projects__field">
                      <span>
                        Ordre d’affichage
                      </span>

                      <input
                        type="number"
                        min={
                          0
                        }
                        max={
                          10000
                        }
                        value={
                          form.sortOrder
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'sortOrder',
                              event.target.value,
                            )
                        }
                      />

                      <small>
                        Les valeurs les plus basses sont affichées en premier.
                      </small>
                    </label>

                    <div className="admin-projects__publication-help">
                      {
                        form.status ===
                        'PUBLISHED'
                          ? (
                              <Eye
                                size={
                                  20
                                }
                                aria-hidden="true"
                              />
                            )
                          : form.status ===
                            'ARCHIVED'
                            ? (
                                <Archive
                                  size={
                                    20
                                  }
                                  aria-hidden="true"
                                />
                              )
                            : (
                                <FilePenLine
                                  size={
                                    20
                                  }
                                  aria-hidden="true"
                                />
                              )
                      }

                      <div>
                        <strong>
                          {
                            STATUS_LABELS[
                              form.status
                            ]
                          }
                        </strong>

                        <p>
                          {
                            form.status ===
                            'PUBLISHED'
                              ? 'La réalisation sera visible sur la page publique.'
                              : form.status ===
                                'ARCHIVED'
                                ? 'La réalisation sera conservée mais masquée du site.'
                                : 'La réalisation restera uniquement visible dans l’administration.'
                          }
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="admin-projects__form-actions">
                  <button
                    type="button"
                    className="admin-projects__secondary-button"
                    onClick={
                      closeForm
                    }
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="admin-projects__primary-button"
                    disabled={
                      isSubmitting
                    }
                  >
                    {
                      isSubmitting
                        ? (
                            <LoaderCircle
                              size={
                                18
                              }
                              className="admin-spinner"
                              aria-hidden="true"
                            />
                          )
                        : (
                            <Save
                              size={
                                18
                              }
                              aria-hidden="true"
                            />
                          )
                    }

                    Enregistrer
                  </button>
                </div>
              </form>
            )
          : null
      }

      <div className="admin-projects__filters">
        <label className="admin-projects__search">
          <Search
            size={
              18
            }
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Rechercher un projet, un client ou une description…"
            value={
              search
            }
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
            clientFilter
          }
          onChange={
            event =>
              setClientFilter(
                event.target.value,
              )
          }
        >
          <option value="all">
            Tous les clients
          </option>

          {
            clients.map(
              client => (
                <option
                  key={
                    client.id
                  }
                  value={
                    client.id
                  }
                >
                  {
                    client.name
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          value={
            expertiseFilter
          }
          onChange={
            event =>
              setExpertiseFilter(
                event.target.value as
                  ExpertiseCode |
                  'all',
              )
          }
        >
          <option value="all">
            Toutes les expertises
          </option>

          {
            EXPERTISE_CODES.map(
              expertiseCode => (
                <option
                  key={
                    expertiseCode
                  }
                  value={
                    expertiseCode
                  }
                >
                  {
                    EXPERTISE_LABELS[
                      expertiseCode
                    ]
                  }
                </option>
              ),
            )
          }
        </select>

        <select
          value={
            statusFilter
          }
          onChange={
            event =>
              setStatusFilter(
                event.target.value as
                  ProjectStatus |
                  'all',
              )
          }
        >
          <option value="all">
            Tous les statuts
          </option>

          <option value="DRAFT">
            Brouillons
          </option>

          <option value="PUBLISHED">
            Publiés
          </option>

          <option value="ARCHIVED">
            Archivés
          </option>
        </select>
      </div>

      {
        isLoading
          ? (
              <div className="admin-projects__loading">
                <LoaderCircle
                  size={
                    30
                  }
                  className="admin-spinner"
                  aria-hidden="true"
                />

                Chargement des réalisations…
              </div>
            )
          : projects.length ===
            0
            ? (
                <div className="admin-projects__empty">
                  <BriefcaseBusiness
                    size={
                      42
                    }
                    aria-hidden="true"
                  />

                  <h2>
                    Aucune réalisation trouvée
                  </h2>

                  <p>
                    Ajoutez votre première réalisation ou modifiez les filtres.
                  </p>
                </div>
              )
            : (
                <div className="admin-projects__grid">
                  {
                    projects.map(
                      project => (
                        <article
                          key={
                            project.id
                          }
                          className="admin-projects__card"
                        >
                          <div className="admin-projects__card-client">
                            <div className="admin-projects__card-logo">
                              <img
                                src={
                                  project.client.logoUrl
                                }
                                alt={
                                  project.client.logoAltFr ??
                                  `Logo ${project.client.name}`
                                }
                              />
                            </div>

                            <div>
                              <strong>
                                {
                                  project.client.name
                                }
                              </strong>

                              <span>
                                {
                                  project.client.industryFr
                                }
                              </span>
                            </div>

                            <span
                              className="admin-projects__status"
                              data-status={
                                project.status
                              }
                            >
                              {
                                STATUS_LABELS[
                                  project.status
                                ]
                              }
                            </span>
                          </div>

                          <div className="admin-projects__card-content">
                            <h2>
                              {
                                project.titleFr
                              }
                            </h2>

                            <p>
                              {
                                project.descriptionFr
                              }
                            </p>

                            <div className="admin-projects__card-expertise">
                              {
                                project.expertiseCodes.map(
                                  expertiseCode => (
                                    <span
                                      key={
                                        expertiseCode
                                      }
                                    >
                                      {
                                        EXPERTISE_LABELS[
                                          expertiseCode
                                        ]
                                      }
                                    </span>
                                  ),
                                )
                              }
                            </div>

                            <div className="admin-projects__card-meta">
                              <span>
                                Ordre {
                                  project.sortOrder
                                }
                              </span>

                              {
                                project.publishedAt
                                  ? (
                                      <span>
                                        Publié le{' '}
                                        {
                                          new Intl.DateTimeFormat(
                                            'fr-FR',
                                          ).format(
                                            new Date(
                                              project.publishedAt,
                                            ),
                                          )
                                        }
                                      </span>
                                    )
                                  : null
                              }
                            </div>
                          </div>

                          <div className="admin-projects__card-actions">
                            <button
                              type="button"
                              onClick={
                                () =>
                                  openEditForm(
                                    project,
                                  )
                              }
                            >
                              <Pencil
                                size={
                                  17
                                }
                                aria-hidden="true"
                              />

                              Modifier
                            </button>

                            <button
                              type="button"
                              className="admin-projects__delete-button"
                              disabled={
                                deletingProjectId ===
                                project.id
                              }
                              onClick={
                                () =>
                                  void handleDelete(
                                    project,
                                  )
                              }
                            >
                              {
                                deletingProjectId ===
                                project.id
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

                              Supprimer
                            </button>
                          </div>
                        </article>
                      ),
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
                className="admin-projects__pagination"
                aria-label="Pagination des réalisations"
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
                  Page {
                    pagination.page
                  } sur {
                    pagination.totalPages
                  }
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