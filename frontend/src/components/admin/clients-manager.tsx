'use client';

import {
  Building2,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

type Client = {
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

  showOnHomepage:
    boolean;

  homepageSortOrder:
    number;

  isActive:
    boolean;

  projectCount:
    number;

  createdByUserId:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type UploadedClientLogo = {
  url:
    string;

  objectName:
    string;

  mimeType:
    'image/webp';

  extension:
    'webp';

  width:
    number | null;

  height:
    number | null;

  size:
    number;
};

type ClientFormState = {
  name:
    string;

  industryFr:
    string;

  industryEn:
    string;

  industryAr:
    string;

  logoUrl:
    string;

  logoAltFr:
    string;

  logoAltEn:
    string;

  logoAltAr:
    string;

  showOnHomepage:
    boolean;

  homepageSortOrder:
    string;

  isActive:
    boolean;
};

type HomepageFilter =
  | 'all'
  | 'visible'
  | 'hidden';

type ActiveFilter =
  | 'all'
  | 'active'
  | 'inactive';

const EMPTY_FORM:
  ClientFormState = {
    name:
      '',

    industryFr:
      '',

    industryEn:
      '',

    industryAr:
      '',

    logoUrl:
      '',

    logoAltFr:
      '',

    logoAltEn:
      '',

    logoAltAr:
      '',

    showOnHomepage:
      false,

    homepageSortOrder:
      '0',

    isActive:
      true,
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

function clientToForm(
  client:
    Client,
):
  ClientFormState
{
  return {
    name:
      client.name,

    industryFr:
      client.industryFr,

    industryEn:
      client.industryEn ??
      '',

    industryAr:
      client.industryAr ??
      '',

    logoUrl:
      client.logoUrl,

    logoAltFr:
      client.logoAltFr ??
      '',

    logoAltEn:
      client.logoAltEn ??
      '',

    logoAltAr:
      client.logoAltAr ??
      '',

    showOnHomepage:
      client.showOnHomepage,

    homepageSortOrder:
      String(
        client.homepageSortOrder,
      ),

    isActive:
      client.isActive,
  };
}

export function ClientsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const fileInputRef =
    useRef<
      HTMLInputElement | null
    >(
      null,
    );

  const [
    clients,
    setClients,
  ] =
    useState<
      Client[]
    >(
      [],
    );

  const [
    allClients,
    setAllClients,
  ] =
    useState<
      Client[]
    >(
      [],
    );

  const [
    form,
    setForm,
  ] =
    useState<
      ClientFormState
    >(
      EMPTY_FORM,
    );

  const [
    editingClientId,
    setEditingClientId,
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
    isUploadingLogo,
    setIsUploadingLogo,
  ] =
    useState(
      false,
    );

  const [
    deletingClientId,
    setDeletingClientId,
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
    homepageFilter,
    setHomepageFilter,
  ] =
    useState<
      HomepageFilter
    >(
      'all',
    );

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<
      ActiveFilter
    >(
      'all',
    );

  const visibleHomepageCount =
    useMemo(
      () =>
        allClients.filter(
          client =>
            client.isActive &&
            client.showOnHomepage,
        ).length,
      [
        allClients,
      ],
    );

  const loadClients =
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
          homepageFilter !==
          'all'
        ) {
          parameters.set(
            'homepageVisibility',
            homepageFilter,
          );
        }

        if (
          activeFilter !==
          'all'
        ) {
          parameters.set(
            'activeStatus',
            activeFilter,
          );
        }

        const queryString =
          parameters.toString();

        try {
          const response =
            await authorizedFetch<
              Client[]
            >(
              `/clients/admin${
                queryString
                  ? `?${queryString}`
                  : ''
              }`,
            );

          setClients(
            response,
          );

          const unfilteredClients =
            queryString
              ? await authorizedFetch<
                  Client[]
                >(
                  '/clients/admin',
                )
              : response;

          setAllClients(
            unfilteredClients,
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
        activeFilter,
        authorizedFetch,
        homepageFilter,
        search,
      ],
    );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadClients();
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
      loadClients,
    ],
  );

  function updateFormField<
    Key extends keyof ClientFormState,
  >(
    key:
      Key,

    value:
      ClientFormState[Key],
  ) {
    setForm(
      currentForm => ({
        ...currentForm,

        [key]:
          value,
      }),
    );
  }

  function openCreateForm() {
    setEditingClientId(
      null,
    );

    setForm({
      ...EMPTY_FORM,

      homepageSortOrder:
        String(
          clients.length,
        ),
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
    client:
      Client,
  ) {
    setEditingClientId(
      client.id,
    );

    setForm(
      clientToForm(
        client,
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
      isSubmitting ||
      isUploadingLogo
    ) {
      return;
    }

    setEditingClientId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setIsFormOpen(
      false,
    );
  }

  async function handleLogoChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      '';

    if (
      !file
    ) {
      return;
    }

    const allowedTypes =
      new Set([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
      ]);

    if (
      !allowedTypes.has(
        file.type,
      )
    ) {
      toast.error(
        'Le logo doit être une image JPEG, PNG, WebP ou AVIF.',
      );

      return;
    }

    if (
      file.size >
      5 *
        1024 *
        1024
    ) {
      toast.error(
        'Le logo ne peut pas dépasser 5 Mo.',
      );

      return;
    }

    const uploadData =
      new FormData();

    uploadData.append(
      'file',
      file,
    );

    setIsUploadingLogo(
      true,
    );

    try {
      const uploadedLogo =
        await authorizedFetch<
          UploadedClientLogo
        >(
          '/clients/upload-logo',
          {
            method:
              'POST',

            body:
              uploadData,
          },
        );

      updateFormField(
        'logoUrl',
        uploadedLogo.url,
      );

      toast.success(
        'Le logo a été importé.',
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
      setIsUploadingLogo(
        false,
      );
    }
  }

  function validateForm() {
    if (
      form.name.trim().length <
      2
    ) {
      return 'Renseigne le nom du client.';
    }

    if (
      form.industryFr.trim().length <
      2
    ) {
      return 'Renseigne le secteur d’activité en français.';
    }

    if (
      !form.logoUrl.trim()
    ) {
      return 'Importe le logo du client.';
    }

    const sortOrder =
      Number(
        form.homepageSortOrder,
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

    setIsSubmitting(
      true,
    );

    const payload = {
      name:
        form.name.trim(),

      industryFr:
        form.industryFr.trim(),

      industryEn:
        form.industryEn.trim() ||
        undefined,

      industryAr:
        form.industryAr.trim() ||
        undefined,

      logoUrl:
        form.logoUrl.trim(),

      logoAltFr:
        form.logoAltFr.trim() ||
        undefined,

      logoAltEn:
        form.logoAltEn.trim() ||
        undefined,

      logoAltAr:
        form.logoAltAr.trim() ||
        undefined,

      showOnHomepage:
        form.showOnHomepage,

      homepageSortOrder:
        Number(
          form.homepageSortOrder,
        ),

      isActive:
        form.isActive,
    };

    try {
      await authorizedFetch(
        editingClientId
          ? `/clients/${editingClientId}`
          : '/clients',
        {
          method:
            editingClientId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      toast.success(
        editingClientId
          ? 'Le client a été mis à jour.'
          : 'Le client a été ajouté.',
      );

      closeForm();

      await loadClients();
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
    client:
      Client,
  ) {
    const confirmed =
      window.confirm(
        client.projectCount >
        0
          ? `Le client « ${client.name} » possède ${client.projectCount} réalisation(s) et ne peut pas être supprimé.`
          : `Supprimer définitivement le client « ${client.name} » ?`,
      );

    if (
      !confirmed ||
      client.projectCount >
        0
    ) {
      return;
    }

    setDeletingClientId(
      client.id,
    );

    try {
      await authorizedFetch(
        `/clients/${client.id}`,
        {
          method:
            'DELETE',
        },
      );

      toast.success(
        'Le client a été supprimé.',
      );

      await loadClients();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setDeletingClientId(
        null,
      );
    }
  }

  return (
    <section className="admin-clients">
      <header className="admin-clients__header">
        <div>
          <span className="admin-clients__eyebrow">
            Références clients
          </span>

          <h1>
            Clients
          </h1>

          <p>
            Gérez les entreprises clientes, leurs logos et leur présence sur la page d’accueil.
          </p>
        </div>

        <button
          type="button"
          className="admin-clients__primary-button"
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

          Ajouter un client
        </button>
      </header>

      <div
        className="admin-clients__homepage-status"
        data-ready={
          visibleHomepageCount >=
          3
        }
      >
        <div className="admin-clients__homepage-status-icon">
          {
            visibleHomepageCount >=
            3
              ? (
                  <Check
                    size={
                      21
                    }
                    aria-hidden="true"
                  />
                )
              : (
                  <EyeOff
                    size={
                      21
                    }
                    aria-hidden="true"
                  />
                )
          }
        </div>

        <div>
          <strong>
            {
              visibleHomepageCount
            } client{
              visibleHomepageCount >
              1
                ? 's'
                : ''
            } visible{
              visibleHomepageCount >
              1
                ? 's'
                : ''
            } sur l’accueil
          </strong>

          <p>
            {
              visibleHomepageCount >=
              3
                ? 'La section « Ils nous ont fait confiance » pourra être affichée.'
                : `Il faut encore sélectionner ${
                    3 -
                    visibleHomepageCount
                  } client(s) pour afficher la section sur la page d’accueil.`
            }
          </p>
        </div>
      </div>

      {
        isFormOpen
          ? (
              <form
                className="admin-clients__form"
                onSubmit={
                  handleSubmit
                }
              >
                <div className="admin-clients__form-heading">
                  <div>
                    <span>
                      {
                        editingClientId
                          ? 'Modification'
                          : 'Nouveau client'
                      }
                    </span>

                    <h2>
                      {
                        editingClientId
                          ? 'Modifier le client'
                          : 'Ajouter un client'
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="admin-clients__icon-button"
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

                <div className="admin-clients__form-grid">
                  <div className="admin-clients__fields">
                    <label className="admin-clients__field">
                      <span>
                        Nom de l’entreprise *
                      </span>

                      <input
                        type="text"
                        value={
                          form.name
                        }
                        maxLength={
                          180
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'name',
                              event.target.value,
                            )
                        }
                      />
                    </label>

                    <div className="admin-clients__language-grid">
                      <label className="admin-clients__field">
                        <span>
                          Secteur d’activité — Français *
                        </span>

                        <input
                          type="text"
                          value={
                            form.industryFr
                          }
                          maxLength={
                            180
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'industryFr',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label className="admin-clients__field">
                        <span>
                          Secteur d’activité — English
                        </span>

                        <input
                          type="text"
                          value={
                            form.industryEn
                          }
                          maxLength={
                            180
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'industryEn',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label
                        className="admin-clients__field"
                        dir="rtl"
                      >
                        <span>
                          قطاع النشاط — العربية
                        </span>

                        <input
                          type="text"
                          value={
                            form.industryAr
                          }
                          maxLength={
                            180
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'industryAr',
                                event.target.value,
                              )
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-clients__language-grid">
                      <label className="admin-clients__field">
                        <span>
                          Texte alternatif — Français
                        </span>

                        <input
                          type="text"
                          value={
                            form.logoAltFr
                          }
                          maxLength={
                            255
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'logoAltFr',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label className="admin-clients__field">
                        <span>
                          Alternative text — English
                        </span>

                        <input
                          type="text"
                          value={
                            form.logoAltEn
                          }
                          maxLength={
                            255
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'logoAltEn',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label
                        className="admin-clients__field"
                        dir="rtl"
                      >
                        <span>
                          النص البديل — العربية
                        </span>

                        <input
                          type="text"
                          value={
                            form.logoAltAr
                          }
                          maxLength={
                            255
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'logoAltAr',
                                event.target.value,
                              )
                          }
                        />
                      </label>
                    </div>

                    <label className="admin-clients__field admin-clients__field--small">
                      <span>
                        Ordre sur la page d’accueil
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
                          form.homepageSortOrder
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'homepageSortOrder',
                              event.target.value,
                            )
                        }
                      />
                    </label>

                    <div className="admin-clients__switches">
                      <label className="admin-clients__switch">
                        <input
                          type="checkbox"
                          checked={
                            form.showOnHomepage
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'showOnHomepage',
                                event.target.checked,
                              )
                          }
                        />

                        <span className="admin-clients__switch-control" />

                        <span>
                          Afficher sur la page d’accueil
                        </span>
                      </label>

                      <label className="admin-clients__switch">
                        <input
                          type="checkbox"
                          checked={
                            form.isActive
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'isActive',
                                event.target.checked,
                              )
                          }
                        />

                        <span className="admin-clients__switch-control" />

                        <span>
                          Client actif
                        </span>
                      </label>
                    </div>
                  </div>

                  <aside className="admin-clients__logo-panel">
                    <div className="admin-clients__logo-preview">
                      {
                        form.logoUrl
                          ? (
                              <img
                                src={
                                  form.logoUrl
                                }
                                alt=""
                              />
                            )
                          : (
                              <ImagePlus
                                size={
                                  44
                                }
                                aria-hidden="true"
                              />
                            )
                      }
                    </div>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      hidden
                      onChange={
                        handleLogoChange
                      }
                    />

                    <button
                      type="button"
                      className="admin-clients__upload-button"
                      disabled={
                        isUploadingLogo
                      }
                      onClick={
                        () =>
                          fileInputRef.current?.click()
                      }
                    >
                      {
                        isUploadingLogo
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
                              <Upload
                                size={
                                  18
                                }
                                aria-hidden="true"
                              />
                            )
                      }

                      {
                        form.logoUrl
                          ? 'Remplacer le logo'
                          : 'Importer le logo'
                      }
                    </button>

                    <p>
                      JPEG, PNG, WebP ou AVIF. Maximum 5 Mo. La transparence du logo est conservée.
                    </p>
                  </aside>
                </div>

                <div className="admin-clients__form-actions">
                  <button
                    type="button"
                    className="admin-clients__secondary-button"
                    onClick={
                      closeForm
                    }
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="admin-clients__primary-button"
                    disabled={
                      isSubmitting ||
                      isUploadingLogo
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

      <div className="admin-clients__filters">
        <label className="admin-clients__search">
          <Search
            size={
              18
            }
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Rechercher un client ou un secteur…"
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
            homepageFilter
          }
          onChange={
            event =>
              setHomepageFilter(
                event.target.value as HomepageFilter,
              )
          }
        >
          <option value="all">
            Tous les affichages
          </option>

          <option value="visible">
            Visibles sur l’accueil
          </option>

          <option value="hidden">
            Masqués de l’accueil
          </option>
        </select>

        <select
          value={
            activeFilter
          }
          onChange={
            event =>
              setActiveFilter(
                event.target.value as ActiveFilter,
              )
          }
        >
          <option value="all">
            Tous les statuts
          </option>

          <option value="active">
            Clients actifs
          </option>

          <option value="inactive">
            Clients inactifs
          </option>
        </select>
      </div>

      {
        isLoading
          ? (
              <div className="admin-clients__loading">
                <LoaderCircle
                  size={
                    30
                  }
                  className="admin-spinner"
                  aria-hidden="true"
                />

                Chargement des clients…
              </div>
            )
          : clients.length ===
            0
            ? (
                <div className="admin-clients__empty">
                  <Building2
                    size={
                      42
                    }
                    aria-hidden="true"
                  />

                  <h2>
                    Aucun client trouvé
                  </h2>

                  <p>
                    Ajoutez un premier client ou modifiez les filtres de recherche.
                  </p>
                </div>
              )
            : (
                <div className="admin-clients__grid">
                  {
                    clients.map(
                      client => (
                        <article
                          key={
                            client.id
                          }
                          className="admin-clients__card"
                          data-inactive={
                            !client.isActive
                          }
                        >
                          <div className="admin-clients__card-logo">
                            <img
                              src={
                                client.logoUrl
                              }
                              alt={
                                client.logoAltFr ??
                                `Logo ${client.name}`
                              }
                            />
                          </div>

                          <div className="admin-clients__card-content">
                            <div className="admin-clients__card-heading">
                              <div>
                                <h2>
                                  {
                                    client.name
                                  }
                                </h2>

                                <p>
                                  {
                                    client.industryFr
                                  }
                                </p>
                              </div>

                              <span
                                className="admin-clients__status"
                                data-active={
                                  client.isActive
                                }
                              >
                                {
                                  client.isActive
                                    ? 'Actif'
                                    : 'Inactif'
                                }
                              </span>
                            </div>

                            <div className="admin-clients__card-meta">
                              <span>
                                {
                                  client.projectCount
                                } réalisation{
                                  client.projectCount >
                                  1
                                    ? 's'
                                    : ''
                                }
                              </span>

                              <span>
                                Ordre {
                                  client.homepageSortOrder
                                }
                              </span>
                            </div>

                            <div className="admin-clients__homepage-badge">
                              {
                                client.showOnHomepage
                                  ? (
                                      <>
                                        <Eye
                                          size={
                                            15
                                          }
                                          aria-hidden="true"
                                        />

                                        Visible sur l’accueil
                                      </>
                                    )
                                  : (
                                      <>
                                        <EyeOff
                                          size={
                                            15
                                          }
                                          aria-hidden="true"
                                        />

                                        Masqué de l’accueil
                                      </>
                                    )
                              }
                            </div>
                          </div>

                          <div className="admin-clients__card-actions">
                            <button
                              type="button"
                              onClick={
                                () =>
                                  openEditForm(
                                    client,
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
                              className="admin-clients__delete-button"
                              disabled={
                                deletingClientId ===
                                  client.id ||
                                client.projectCount >
                                  0
                              }
                              title={
                                client.projectCount >
                                0
                                  ? 'Ce client possède des réalisations.'
                                  : 'Supprimer le client'
                              }
                              onClick={
                                () =>
                                  void handleDelete(
                                    client,
                                  )
                              }
                            >
                              {
                                deletingClientId ===
                                client.id
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
    </section>
  );
}