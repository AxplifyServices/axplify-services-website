'use client';

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  FormEvent,
  useCallback,
  useEffect,
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

type FaqLocale =
  | 'fr'
  | 'en'
  | 'ar';

type FaqCategoryCode =
  | 'OFFER'
  | 'METHODOLOGY'
  | 'PROTOTYPE'
  | 'DELIVERY'
  | 'BUDGET'
  | 'TECHNICAL'
  | 'SUPPORT'
  | 'GENERAL';

type FaqTranslation = {
  locale:
    FaqLocale;

  question:
    string;

  answer:
    string;
};

type FaqItem = {
  id:
    string;

  categoryCode:
    FaqCategoryCode;

  sortOrder:
    number;

  isVisible:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;

  translations:
    FaqTranslation[];
};

type FaqFormState = {
  categoryCode:
    FaqCategoryCode;

  sortOrder:
    string;

  isVisible:
    boolean;

  frQuestion:
    string;

  frAnswer:
    string;

  enQuestion:
    string;

  enAnswer:
    string;

  arQuestion:
    string;

  arAnswer:
    string;
};

type VisibilityFilter =
  | 'all'
  | 'visible'
  | 'hidden';

type FaqPagination = {
  page:
    number;

  limit:
    number;

  total:
    number;

  totalPages:
    number;
};

type FaqListResponse = {
  items:
    FaqItem[];

  pagination:
    FaqPagination;
};

const FAQ_PAGE_SIZE =
  10;

const CATEGORY_OPTIONS:
  Array<{
    value:
      FaqCategoryCode;

    label:
      string;
  }> = [
    {
      value:
        'OFFER',

      label:
        'Offre et solutions',
    },

    {
      value:
        'METHODOLOGY',

      label:
        'Méthodologie',
    },

    {
      value:
        'PROTOTYPE',

      label:
        'Démo, POC et MVP',
    },

    {
      value:
        'DELIVERY',

      label:
        'Réalisation et suivi',
    },

    {
      value:
        'BUDGET',

      label:
        'Budget et délais',
    },

    {
      value:
        'TECHNICAL',

      label:
        'Technique et intégrations',
    },

    {
      value:
        'SUPPORT',

      label:
        'Support et accompagnement',
    },

    {
      value:
        'GENERAL',

      label:
        'Général',
    },
  ];

const EMPTY_FORM:
  FaqFormState = {
    categoryCode:
      'GENERAL',

    sortOrder:
      '0',

    isVisible:
      false,

    frQuestion:
      '',

    frAnswer:
      '',

    enQuestion:
      '',

    enAnswer:
      '',

    arQuestion:
      '',

    arAnswer:
      '',
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

function getTranslation(
  item:
    FaqItem,

  locale:
    FaqLocale,
) {
  return (
    item.translations.find(
      translation =>
        translation.locale ===
        locale,
    ) ??
    null
  );
}

function getCategoryLabel(
  code:
    FaqCategoryCode,
) {
  return (
    CATEGORY_OPTIONS.find(
      option =>
        option.value ===
        code,
    )?.label ??
    code
  );
}

function faqToForm(
  item:
    FaqItem,
):
  FaqFormState
{
  const fr =
    getTranslation(
      item,
      'fr',
    );

  const en =
    getTranslation(
      item,
      'en',
    );

  const ar =
    getTranslation(
      item,
      'ar',
    );

  return {
    categoryCode:
      item.categoryCode,

    sortOrder:
      String(
        item.sortOrder,
      ),

    isVisible:
      item.isVisible,

    frQuestion:
      fr?.question ??
      '',

    frAnswer:
      fr?.answer ??
      '',

    enQuestion:
      en?.question ??
      '',

    enAnswer:
      en?.answer ??
      '',

    arQuestion:
      ar?.question ??
      '',

    arAnswer:
      ar?.answer ??
      '',
  };
}

export function FaqsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    items,
    setItems,
  ] =
    useState<
      FaqItem[]
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
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    expandedId,
    setExpandedId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<
      FaqFormState
    >(
      EMPTY_FORM,
    );

  const [
    showForm,
    setShowForm,
  ] =
    useState(
      false,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState<
      FaqCategoryCode |
      'all'
    >(
      'all',
    );

  const [
    visibilityFilter,
    setVisibilityFilter,
  ] =
    useState<
      VisibilityFilter
    >(
      'all',
    );

  const [
    pagination,
    setPagination,
  ] =
    useState<FaqPagination>({
      page:
        1,

      limit:
        FAQ_PAGE_SIZE,

      total:
        0,

      totalPages:
        0,
    });

  const loadFaqs =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const params =
            new URLSearchParams();

          params.set(
            'page',
            String(
              pagination.page,
            ),
          );

          params.set(
            'limit',
            String(
              FAQ_PAGE_SIZE,
            ),
          );

          const normalizedSearch =
            search.trim();

          if (
            normalizedSearch
          ) {
            params.set(
              'search',
              normalizedSearch,
            );
          }

          if (
            categoryFilter !==
            'all'
          ) {
            params.set(
              'categoryCode',
              categoryFilter,
            );
          }

          if (
            visibilityFilter !==
            'all'
          ) {
            params.set(
              'visibility',
              visibilityFilter,
            );
          }

          const response =
            await authorizedFetch<
              FaqListResponse
            >(
              `/faqs/admin?${params.toString()}`,
            );

          setItems(
            response.items,
          );

          setPagination(
            response.pagination,
          );

          setExpandedId(
            current =>
              response.items.some(
                item =>
                  item.id ===
                  current,
              )
                ? current
                : null,
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
        categoryFilter,
        pagination.page,
        search,
        visibilityFilter,
      ],
    );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadFaqs();
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
      loadFaqs,
    ],
  );

  function resetToFirstPage() {
    setPagination(
      current => ({
        ...current,

        page:
          1,
      }),
    );
  }

  function openCreateForm() {
    setEditingId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setShowForm(
      true,
    );
  }

  function openEditForm(
    item:
      FaqItem,
  ) {
    setEditingId(
      item.id,
    );

    setForm(
      faqToForm(
        item,
      ),
    );

    setShowForm(
      true,
    );
  }

  function closeForm() {
    if (
      isSaving
    ) {
      return;
    }

    setEditingId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setShowForm(
      false,
    );
  }

  function updateForm<
    Key extends keyof
      FaqFormState,
  >(
    key:
      Key,

    value:
      FaqFormState[Key],
  ) {
    setForm(
      current => ({
        ...current,

        [key]:
          value,
      }),
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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
      toast.error(
        'L’ordre doit être un nombre entier positif.',
      );

      return;
    }

    const payload = {
      categoryCode:
        form.categoryCode,

      sortOrder,

      isVisible:
        form.isVisible,

      translations: [
        {
          locale:
            'fr',

          question:
            form.frQuestion.trim(),

          answer:
            form.frAnswer.trim(),
        },

        {
          locale:
            'en',

          question:
            form.enQuestion.trim(),

          answer:
            form.enAnswer.trim(),
        },

        {
          locale:
            'ar',

          question:
            form.arQuestion.trim(),

          answer:
            form.arAnswer.trim(),
        },
      ],
    };

    setIsSaving(
      true,
    );

    try {
      if (
        editingId
      ) {
        await authorizedFetch(
          `/faqs/${editingId}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

        toast.success(
          'La FAQ a été mise à jour.',
        );
      } else {
        await authorizedFetch(
          '/faqs',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

        toast.success(
          'La FAQ a été créée.',
        );
      }

      setEditingId(
        null,
      );

      setForm(
        EMPTY_FORM,
      );

      setShowForm(
        false,
      );

      await loadFaqs();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }

  async function toggleVisibility(
    item:
      FaqItem,
  ) {
    try {
      await authorizedFetch(
        `/faqs/${item.id}/visibility`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              isVisible:
                !item.isVisible,
            }),
        },
      );

      toast.success(
        item.isVisible
          ? 'La FAQ est maintenant masquée.'
          : 'La FAQ est maintenant visible sur le site.',
      );

      /*
       * On recharge la page depuis l'API plutôt que de
       * modifier uniquement le tableau local.
       *
       * C'est nécessaire lorsque le filtre "visible" ou
       * "masquée" est actif : l'élément peut devoir
       * disparaître immédiatement de la page et le total
       * doit également être recalculé.
       */
      await loadFaqs();
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

  async function handleDelete(
    item:
      FaqItem,
  ) {
    const fr =
      getTranslation(
        item,
        'fr',
      );

    const confirmed =
      window.confirm(
        `Supprimer définitivement la question « ${
          fr?.question ??
          'FAQ'
        } » ?`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await authorizedFetch(
        `/faqs/${item.id}`,
        {
          method:
            'DELETE',
        },
      );

      if (
        expandedId ===
        item.id
      ) {
        setExpandedId(
          null,
        );
      }

      toast.success(
        'La FAQ a été supprimée.',
      );

      /*
       * Si on supprime le dernier élément d'une page
       * supérieure à 1, on revient à la page précédente.
       *
       * Sinon on recharge simplement la page courante.
       */
      if (
        items.length ===
          1 &&
        pagination.page >
          1
      ) {
        setPagination(
          current => ({
            ...current,

            page:
              current.page -
              1,
          }),
        );

        return;
      }

      await loadFaqs();
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

  function goToPage(
    page:
      number,
  ) {
    if (
      page <
        1 ||
      page >
        pagination.totalPages ||
      page ===
        pagination.page
    ) {
      return;
    }

    setExpandedId(
      null,
    );

    setPagination(
      current => ({
        ...current,

        page,
      }),
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  return (
    <section className="admin-faqs">
      <header className="admin-faqs__header">
        <div>
          <p className="admin-faqs__eyebrow">
            Contenu du site
          </p>

          <h1>
            Questions fréquentes
          </h1>

          <p>
            Créez les questions en français,
            anglais et arabe puis choisissez
            celles qui doivent être publiées.
          </p>
        </div>

        <button
          type="button"
          className="admin-faqs__primary-button"
          onClick={
            openCreateForm
          }
        >
          <Plus
            size={17}
            aria-hidden="true"
          />

          <span>
            Nouvelle question
          </span>
        </button>
      </header>

      <div className="admin-faqs__summary">
        <span>
          <strong>
            {
              pagination.total
            }
          </strong>

          {' '}
          question
          {pagination.total >
          1
            ? 's'
            : ''}
        </span>

        <span>
          Page{' '}
          <strong>
            {
              pagination.page
            }
          </strong>

          {' '}sur{' '}

          <strong>
            {Math.max(
              1,
              pagination.totalPages,
            )}
          </strong>
        </span>
      </div>

      {showForm ? (
        <form
          className="admin-faqs__form"
          onSubmit={
            event =>
              void handleSubmit(
                event,
              )
          }
        >
          <div className="admin-faqs__form-header">
            <div>
              <span>
                {editingId
                  ? 'Modification'
                  : 'Nouvelle FAQ'}
              </span>

              <h2>
                {editingId
                  ? 'Modifier la question'
                  : 'Créer une question'}
              </h2>
            </div>

            <button
              type="button"
              className="admin-faqs__icon-button"
              aria-label="Fermer le formulaire"
              onClick={
                closeForm
              }
            >
              <X
                size={18}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="admin-faqs__settings">
            <label>
              <span>
                Catégorie
              </span>

              <select
                value={
                  form.categoryCode
                }
                onChange={
                  event =>
                    updateForm(
                      'categoryCode',
                      event.target
                        .value as
                        FaqCategoryCode,
                    )
                }
              >
                {CATEGORY_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="admin-faqs__order-field">
              <span>
                Ordre
              </span>

              <input
                type="number"
                min="0"
                max="10000"
                value={
                  form.sortOrder
                }
                onChange={
                  event =>
                    updateForm(
                      'sortOrder',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label className="admin-faqs__visibility-switch">
              <input
                type="checkbox"
                checked={
                  form.isVisible
                }
                onChange={
                  event =>
                    updateForm(
                      'isVisible',
                      event.target
                        .checked,
                    )
                }
              />

              <span className="admin-faqs__visibility-control" />

              <span>
                Afficher sur le site
              </span>
            </label>
          </div>

          <div className="admin-faqs__languages">
            <section className="admin-faqs__language-card">
              <div className="admin-faqs__language-heading">
                <span>
                  FR
                </span>

                <strong>
                  Français
                </strong>
              </div>

              <label>
                <span>
                  Question
                </span>

                <input
                  required
                  minLength={5}
                  maxLength={300}
                  value={
                    form.frQuestion
                  }
                  onChange={
                    event =>
                      updateForm(
                        'frQuestion',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label>
                <span>
                  Réponse
                </span>

                <textarea
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={5}
                  value={
                    form.frAnswer
                  }
                  onChange={
                    event =>
                      updateForm(
                        'frAnswer',
                        event.target
                          .value,
                      )
                  }
                />
              </label>
            </section>

            <section className="admin-faqs__language-card">
              <div className="admin-faqs__language-heading">
                <span>
                  EN
                </span>

                <strong>
                  English
                </strong>
              </div>

              <label>
                <span>
                  Question
                </span>

                <input
                  required
                  minLength={5}
                  maxLength={300}
                  value={
                    form.enQuestion
                  }
                  onChange={
                    event =>
                      updateForm(
                        'enQuestion',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label>
                <span>
                  Answer
                </span>

                <textarea
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={5}
                  value={
                    form.enAnswer
                  }
                  onChange={
                    event =>
                      updateForm(
                        'enAnswer',
                        event.target
                          .value,
                      )
                  }
                />
              </label>
            </section>

            <section
              className="admin-faqs__language-card"
              dir="rtl"
            >
              <div className="admin-faqs__language-heading">
                <span>
                  AR
                </span>

                <strong>
                  العربية
                </strong>
              </div>

              <label>
                <span>
                  السؤال
                </span>

                <input
                  required
                  minLength={5}
                  maxLength={300}
                  value={
                    form.arQuestion
                  }
                  onChange={
                    event =>
                      updateForm(
                        'arQuestion',
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label>
                <span>
                  الجواب
                </span>

                <textarea
                  required
                  minLength={10}
                  maxLength={10000}
                  rows={5}
                  value={
                    form.arAnswer
                  }
                  onChange={
                    event =>
                      updateForm(
                        'arAnswer',
                        event.target
                          .value,
                      )
                  }
                />
              </label>
            </section>
          </div>

          <div className="admin-faqs__form-actions">
            <button
              type="button"
              className="admin-faqs__secondary-button"
              disabled={
                isSaving
              }
              onClick={
                closeForm
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="admin-faqs__primary-button"
              disabled={
                isSaving
              }
            >
              {isSaving ? (
                <LoaderCircle
                  size={17}
                  className="admin-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Save
                  size={17}
                  aria-hidden="true"
                />
              )}

              <span>
                {editingId
                  ? 'Enregistrer'
                  : 'Créer la FAQ'}
              </span>
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-faqs__filters">
        <label className="admin-faqs__search">
          <Search
            size={17}
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            placeholder="Rechercher une question ou une réponse"
            onChange={
              event => {
                setSearch(
                  event.target
                    .value,
                );

                resetToFirstPage();
              }
            }
          />
        </label>

        <select
          value={
            categoryFilter
          }
          onChange={
            event => {
              setCategoryFilter(
                event.target
                  .value as
                  FaqCategoryCode |
                  'all',
              );

              resetToFirstPage();
            }
          }
        >
          <option value="all">
            Toutes les catégories
          </option>

          {CATEGORY_OPTIONS.map(
            option => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            ),
          )}
        </select>

        <select
          value={
            visibilityFilter
          }
          onChange={
            event => {
              setVisibilityFilter(
                event.target
                  .value as
                  VisibilityFilter,
              );

              resetToFirstPage();
            }
          }
        >
          <option value="all">
            Toutes
          </option>

          <option value="visible">
            Visibles
          </option>

          <option value="hidden">
            Masquées
          </option>
        </select>
      </div>

      {isLoading ? (
        <div className="admin-faqs__loading">
          <LoaderCircle
            size={26}
            className="admin-spinner"
            aria-hidden="true"
          />

          <span>
            Chargement des FAQ…
          </span>
        </div>
      ) : items.length ===
        0 ? (
          <div className="admin-faqs__empty">
            <CircleHelp
              size={24}
              aria-hidden="true"
            />

            <h2>
              Aucune question trouvée
            </h2>

            <p>
              Créez une FAQ ou modifiez
              les filtres utilisés.
            </p>
          </div>
        ) : (
          <>
            <div className="admin-faqs__list">
              {items.map(
                item => {
                  const fr =
                    getTranslation(
                      item,
                      'fr',
                    );

                  const isExpanded =
                    expandedId ===
                    item.id;

                  return (
                    <article
                      key={
                        item.id
                      }
                      className="admin-faqs__item"
                      data-visible={
                        item.isVisible
                      }
                      data-expanded={
                        isExpanded
                      }
                    >
                      <button
                        type="button"
                        className="admin-faqs__item-toggle"
                        aria-expanded={
                          isExpanded
                        }
                        onClick={
                          () =>
                            setExpandedId(
                              current =>
                                current ===
                                item.id
                                  ? null
                                  : item.id,
                            )
                        }
                      >
                        <div className="admin-faqs__item-heading">
                          <div className="admin-faqs__item-meta">
                            <span className="admin-faqs__category">
                              {
                                getCategoryLabel(
                                  item.categoryCode,
                                )
                              }
                            </span>

                            <span className="admin-faqs__order">
                              Ordre{' '}
                              {
                                item.sortOrder
                              }
                            </span>

                            <span
                              className="admin-faqs__status"
                              data-visible={
                                item.isVisible
                              }
                            >
                              {item.isVisible ? (
                                <>
                                  <Eye
                                    size={13}
                                    aria-hidden="true"
                                  />

                                  Visible
                                </>
                              ) : (
                                <>
                                  <EyeOff
                                    size={13}
                                    aria-hidden="true"
                                  />

                                  Masquée
                                </>
                              )}
                            </span>
                          </div>

                          <strong>
                            {
                              fr?.question ??
                              'Question sans traduction française'
                            }
                          </strong>
                        </div>

                        <span className="admin-faqs__chevron">
                          {isExpanded ? (
                            <ChevronUp
                              size={18}
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </button>

                      {isExpanded ? (
                        <div className="admin-faqs__item-body">
                          <div className="admin-faqs__preview">
                            <p>
                              {
                                fr?.answer ??
                                'Aucune réponse française.'
                              }
                            </p>
                          </div>

                          <div className="admin-faqs__translation-status">
                            {(
                              [
                                'fr',
                                'en',
                                'ar',
                              ] as FaqLocale[]
                            ).map(
                              locale => {
                                const translation =
                                  getTranslation(
                                    item,
                                    locale,
                                  );

                                return (
                                  <span
                                    key={
                                      locale
                                    }
                                    data-complete={
                                      Boolean(
                                        translation?.question &&
                                        translation?.answer,
                                      )
                                    }
                                  >
                                    <Check
                                      size={13}
                                      aria-hidden="true"
                                    />

                                    {
                                      locale.toUpperCase()
                                    }
                                  </span>
                                );
                              },
                            )}
                          </div>

                          <div className="admin-faqs__item-actions">
                            <button
                              type="button"
                              onClick={
                                () =>
                                  void toggleVisibility(
                                    item,
                                  )
                              }
                            >
                              {item.isVisible ? (
                                <EyeOff
                                  size={15}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Eye
                                  size={15}
                                  aria-hidden="true"
                                />
                              )}

                              <span>
                                {item.isVisible
                                  ? 'Masquer du site'
                                  : 'Afficher sur le site'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={
                                () =>
                                  openEditForm(
                                    item,
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                                aria-hidden="true"
                              />

                              <span>
                                Modifier
                              </span>
                            </button>

                            <button
                              type="button"
                              className="admin-faqs__delete-button"
                              onClick={
                                () =>
                                  void handleDelete(
                                    item,
                                  )
                              }
                            >
                              <Trash2
                                size={15}
                                aria-hidden="true"
                              />

                              <span>
                                Supprimer
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                },
              )}
            </div>

            {pagination.totalPages >
            1 ? (
              <nav
                className="admin-faqs__pagination"
                aria-label="Pagination des FAQ"
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
                      goToPage(
                        pagination.page -
                          1,
                      )
                  }
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                  />

                  <span>
                    Précédent
                  </span>
                </button>

                <div className="admin-faqs__pagination-pages">
                  {Array.from(
                    {
                      length:
                        pagination.totalPages,
                    },

                    (
                      _,
                      index,
                    ) =>
                      index +
                      1,
                  ).map(
                    page => (
                      <button
                        key={
                          page
                        }
                        type="button"
                        data-active={
                          pagination.page ===
                          page
                        }
                        aria-current={
                          pagination.page ===
                          page
                            ? 'page'
                            : undefined
                        }
                        aria-label={`Page ${page} sur ${pagination.totalPages}`}
                        onClick={
                          () =>
                            goToPage(
                              page,
                            )
                        }
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  aria-label="Page suivante"
                  onClick={
                    () =>
                      goToPage(
                        pagination.page +
                          1,
                      )
                  }
                >
                  <span>
                    Suivant
                  </span>

                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              </nav>
            ) : null}
          </>
        )}
    </section>
  );
}