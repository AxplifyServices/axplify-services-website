'use client';

import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  FormEvent,
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

type ProductLocale =
  | 'fr'
  | 'en'
  | 'ar';

type ProductTranslation = {
  locale: ProductLocale;
  name: string;
  title: string;
  description: string;
  category: string;
};

type AdminProduct = {
  id: string;
  linkUrl: string;

  isActive: boolean;
  sortOrder: number;

  showOnHomepage: boolean;
  homepageSortOrder: number;

  createdAt: string;
  updatedAt: string;

  translations:
    ProductTranslation[];
};

type ProductFormState = {
  linkUrl: string;
  isActive: boolean;
  sortOrder: string;

  frName: string;
  frTitle: string;
  frDescription: string;
  frCategory: string;

  enName: string;
  enTitle: string;
  enDescription: string;
  enCategory: string;

  arName: string;
  arTitle: string;
  arDescription: string;
  arCategory: string;
};

type ActivityFilter =
  | 'all'
  | 'active'
  | 'inactive';

type HomepageFilter =
  | 'all'
  | 'homepage'
  | 'catalogOnly';

const EMPTY_FORM:
  ProductFormState = {
  linkUrl: '',
  isActive: true,
  sortOrder: '0',

  frName: '',
  frTitle: '',
  frDescription: '',
  frCategory: '',

  enName: '',
  enTitle: '',
  enDescription: '',
  enCategory: '',

  arName: '',
  arTitle: '',
  arDescription: '',
  arCategory: '',
};

function getErrorMessage(
  error: unknown,
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
  product:
    AdminProduct,

  locale:
    ProductLocale,
) {
  return (
    product.translations.find(
      translation =>
        translation.locale ===
        locale,
    ) ??
    null
  );
}

function productToForm(
  product:
    AdminProduct,
):
  ProductFormState
{
  const fr =
    getTranslation(
      product,
      'fr',
    );

  const en =
    getTranslation(
      product,
      'en',
    );

  const ar =
    getTranslation(
      product,
      'ar',
    );

  return {
    linkUrl:
      product.linkUrl,

    isActive:
      product.isActive,

    sortOrder:
      String(
        product.sortOrder,
      ),

    frName:
      fr?.name ??
      '',

    frTitle:
      fr?.title ??
      '',

    frDescription:
      fr?.description ??
      '',

    frCategory:
      fr?.category ??
      '',

    enName:
      en?.name ??
      '',

    enTitle:
      en?.title ??
      '',

    enDescription:
      en?.description ??
      '',

    enCategory:
      en?.category ??
      '',

    arName:
      ar?.name ??
      '',

    arTitle:
      ar?.title ??
      '',

    arDescription:
      ar?.description ??
      '',

    arCategory:
      ar?.category ??
      '',
  };
}

function formatAdminDate(
  value:
    string,
) {
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

function isArabicTranslationEmpty(
  form:
    ProductFormState,
) {
  return ![
    form.arName,
    form.arTitle,
    form.arDescription,
    form.arCategory,
  ].some(
    value =>
      value.trim(),
  );
}

export function ProductsManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  /*
   * items = résultat correspondant
   * aux filtres actuels.
   *
   * allProducts = catalogue complet.
   *
   * On sépare volontairement les deux
   * afin que la sélection Home continue
   * de fonctionner même lorsqu'un filtre
   * est appliqué sur la liste.
   */
  const [
    items,
    setItems,
  ] =
    useState<
      AdminProduct[]
    >(
      [],
    );

  const [
    allProducts,
    setAllProducts,
  ] =
    useState<
      AdminProduct[]
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
    showForm,
    setShowForm,
  ] =
    useState(
      false,
    );

  const [
    form,
    setForm,
  ] =
    useState<
      ProductFormState
    >(
      EMPTY_FORM,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    activityFilter,
    setActivityFilter,
  ] =
    useState<
      ActivityFilter
    >(
      'all',
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
    homepageSelection,
    setHomepageSelection,
  ] =
    useState(
      '',
    );

  const [
    homepageMutationId,
    setHomepageMutationId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const loadProducts =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const params =
            new URLSearchParams();

          if (
            search.trim()
          ) {
            params.set(
              'search',
              search.trim(),
            );
          }

          if (
            activityFilter !==
            'all'
          ) {
            params.set(
              'activity',
              activityFilter,
            );
          }

          if (
            homepageFilter !==
            'all'
          ) {
            params.set(
              'homepage',
              homepageFilter,
            );
          }

          const queryString =
            params.toString();

          const [
            response,
            completeResponse,
          ] =
            await Promise.all([
              authorizedFetch<
                AdminProduct[]
              >(
                `/products/admin${
                  queryString
                    ? `?${queryString}`
                    : ''
                }`,
              ),

              authorizedFetch<
                AdminProduct[]
              >(
                '/products/admin',
              ),
            ]);

          setItems(
            response,
          );

          setAllProducts(
            completeResponse,
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
        activityFilter,
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
            void loadProducts();
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
      loadProducts,
    ],
  );

  const activeCount =
    useMemo(
      () =>
        allProducts.filter(
          product =>
            product.isActive,
        ).length,
      [
        allProducts,
      ],
    );

  const homepageProducts =
    useMemo(
      () =>
        allProducts
          .filter(
            product =>
              product.isActive &&
              product.showOnHomepage,
          )
          .sort(
            (
              left,
              right,
            ) =>
              left.homepageSortOrder -
              right.homepageSortOrder,
          ),
      [
        allProducts,
      ],
    );

  const availableHomepageProducts =
    useMemo(
      () =>
        allProducts
          .filter(
            product =>
              product.isActive &&
              !product.showOnHomepage,
          )
          .sort(
            (
              left,
              right,
            ) =>
              left.sortOrder -
              right.sortOrder,
          ),
      [
        allProducts,
      ],
    );

  /*
   * La catégorie reste du texte libre,
   * mais on transforme les catégories
   * déjà utilisées en suggestions.
   */
  const categorySuggestions =
    useMemo(
      () => {
        const categories =
          new Set<string>();

        allProducts.forEach(
          product => {
            product.translations.forEach(
              translation => {
                const value =
                  translation.category.trim();

                if (
                  value
                ) {
                  categories.add(
                    value,
                  );
                }
              },
            );
          },
        );

        return Array.from(
          categories,
        ).sort(
          (
            left,
            right,
          ) =>
            left.localeCompare(
              right,
              'fr',
              {
                sensitivity:
                  'base',
              },
            ),
        );
      },
      [
        allProducts,
      ],
    );

  function updateForm<
    Key extends keyof
      ProductFormState,
  >(
    key:
      Key,

    value:
      ProductFormState[Key],
  ) {
    setForm(
      current => ({
        ...current,

        [key]:
          value,
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
    product:
      AdminProduct,
  ) {
    setEditingId(
      product.id,
    );

    setForm(
      productToForm(
        product,
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
        'L’ordre catalogue doit être un nombre entier positif.',
      );

      return;
    }

    if (
      !form.linkUrl.trim()
    ) {
      toast.error(
        'Le lien du produit est obligatoire.',
      );

      return;
    }

    const requiredFields =
      [
        form.frName,
        form.frTitle,
        form.frDescription,
        form.frCategory,

        form.enName,
        form.enTitle,
        form.enDescription,
        form.enCategory,
      ];

    if (
      requiredFields.some(
        value =>
          !value.trim(),
      )
    ) {
      toast.error(
        'Le français et l’anglais doivent être complétés intégralement.',
      );

      return;
    }

    const arabicIsEmpty =
      isArabicTranslationEmpty(
        form,
      );

    if (
      !arabicIsEmpty &&
      [
        form.arName,
        form.arTitle,
        form.arDescription,
        form.arCategory,
      ].some(
        value =>
          !value.trim(),
      )
    ) {
      toast.error(
        'Pour ajouter l’arabe, complétez ses quatre champs. Sinon laissez toute la traduction arabe vide.',
      );

      return;
    }

    const translations:
      ProductTranslation[] =
        [
          {
            locale:
              'fr',

            name:
              form.frName.trim(),

            title:
              form.frTitle.trim(),

            description:
              form.frDescription.trim(),

            category:
              form.frCategory.trim(),
          },

          {
            locale:
              'en',

            name:
              form.enName.trim(),

            title:
              form.enTitle.trim(),

            description:
              form.enDescription.trim(),

            category:
              form.enCategory.trim(),
          },
        ];

    if (
      !arabicIsEmpty
    ) {
      translations.push({
        locale:
          'ar',

        name:
          form.arName.trim(),

        title:
          form.arTitle.trim(),

        description:
          form.arDescription.trim(),

        category:
          form.arCategory.trim(),
      });
    }

    const payload = {
      linkUrl:
        form.linkUrl.trim(),

      isActive:
        form.isActive,

      sortOrder,

      translations,
    };

    setIsSaving(
      true,
    );

    try {
      if (
        editingId
      ) {
        await authorizedFetch(
          `/products/${editingId}`,
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
          'Le produit a été mis à jour.',
        );
      } else {
        await authorizedFetch(
          '/products',
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
          'Le produit a été créé.',
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

      await loadProducts();
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

  async function toggleActivity(
    product:
      AdminProduct,
  ) {
    try {
      /*
       * Un produit désactivé ne doit
       * jamais rester sélectionné Home.
       */
      await authorizedFetch(
        `/products/${product.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              isActive:
                !product.isActive,

              ...(
                product.isActive
                  ? {
                      showOnHomepage:
                        false,
                    }
                  : {}
              ),
            }),
        },
      );

      toast.success(
        product.isActive
          ? 'Le produit est maintenant masqué du site.'
          : 'Le produit est maintenant actif.',
      );

      await loadProducts();
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
    product:
      AdminProduct,
  ) {
    const fr =
      getTranslation(
        product,
        'fr',
      );

    const confirmed =
      window.confirm(
        `Retirer le produit « ${
          fr?.name ??
          'Produit'
        } » du catalogue ?`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      await authorizedFetch(
        `/products/${product.id}`,
        {
          method:
            'DELETE',
        },
      );

      if (
        expandedId ===
        product.id
      ) {
        setExpandedId(
          null,
        );
      }

      toast.success(
        'Le produit a été retiré du catalogue.',
      );

      await loadProducts();
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

  async function addHomepageProduct() {
    if (
      !homepageSelection
    ) {
      return;
    }

    const nextOrder =
      homepageProducts.length ===
      0
        ? 0
        : Math.max(
            ...homepageProducts.map(
              product =>
                product.homepageSortOrder,
            ),
          ) +
          1;

    setHomepageMutationId(
      homepageSelection,
    );

    try {
      await authorizedFetch(
        `/products/${homepageSelection}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              showOnHomepage:
                true,

              homepageSortOrder:
                nextOrder,
            }),
        },
      );

      setHomepageSelection(
        '',
      );

      toast.success(
        'Le produit a été ajouté à la home.',
      );

      await loadProducts();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setHomepageMutationId(
        null,
      );
    }
  }

  async function removeHomepageProduct(
    product:
      AdminProduct,
  ) {
    setHomepageMutationId(
      product.id,
    );

    try {
      await authorizedFetch(
        `/products/${product.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              showOnHomepage:
                false,

              homepageSortOrder:
                0,
            }),
        },
      );

      toast.success(
        'Le produit a été retiré de la home.',
      );

      await loadProducts();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setHomepageMutationId(
        null,
      );
    }
  }

  async function moveHomepageProduct(
    product:
      AdminProduct,

    direction:
      -1 | 1,
  ) {
    const currentIndex =
      homepageProducts.findIndex(
        item =>
          item.id ===
          product.id,
      );

    const targetIndex =
      currentIndex +
      direction;

    if (
      currentIndex <
        0 ||
      targetIndex <
        0 ||
      targetIndex >=
        homepageProducts.length
    ) {
      return;
    }

    const targetProduct =
      homepageProducts[
        targetIndex
      ];

    if (
      !targetProduct
    ) {
      return;
    }

    setHomepageMutationId(
      product.id,
    );

    try {
      /*
       * On échange simplement les
       * positions des deux produits.
       */
      await Promise.all([
        authorizedFetch(
          `/products/${product.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                homepageSortOrder:
                  targetProduct.homepageSortOrder,
              }),
          },
        ),

        authorizedFetch(
          `/products/${targetProduct.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                homepageSortOrder:
                  product.homepageSortOrder,
              }),
          },
        ),
      ]);

      await loadProducts();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setHomepageMutationId(
        null,
      );
    }
  }

  return (
    <section className="admin-products">
      <header className="admin-products__header">
        <div>
          <p className="admin-products__eyebrow">
            Catalogue commercial
          </p>

          <h1>
            Produits
          </h1>

          <p>
            Gérez les cartes qui orientent les visiteurs vers vos produits et choisissez celles mises en avant sur la home.
          </p>
        </div>

        <button
          type="button"
          className="admin-products__primary-button"
          onClick={
            openCreateForm
          }
        >
          <Plus
            size={17}
            aria-hidden="true"
          />

          <span>
            Nouveau produit
          </span>
        </button>
      </header>

      <div className="admin-products__summary">
        <span>
          <strong>
            {allProducts.length}
          </strong>

          produit
          {allProducts.length >
          1
            ? 's'
            : ''}
        </span>

        <span>
          <strong>
            {activeCount}
          </strong>

          actif
          {activeCount >
          1
            ? 's'
            : ''}
        </span>

        <span>
          <strong>
            {homepageProducts.length}
          </strong>

          sur la home
        </span>
      </div>

      <section className="admin-products__homepage">
        <div className="admin-products__section-heading">
          <div>
            <span>
              Mise en avant
            </span>

            <h2>
              Produits affichés sur la home
            </h2>

            <p>
              Ajoutez uniquement les produits que vous souhaitez mettre en avant. Leur ordre ci-dessous sera repris sur la page d’accueil.
            </p>
          </div>
        </div>

        <div className="admin-products__homepage-picker">
          <select
            value={
              homepageSelection
            }
            onChange={
              event =>
                setHomepageSelection(
                  event.target.value,
                )
            }
            disabled={
              availableHomepageProducts.length ===
                0 ||
              homepageMutationId !==
                null
            }
          >
            <option value="">
              {availableHomepageProducts.length >
              0
                ? 'Choisir un produit actif…'
                : 'Tous les produits actifs sont déjà sélectionnés'}
            </option>

            {availableHomepageProducts.map(
              product => {
                const fr =
                  getTranslation(
                    product,
                    'fr',
                  );

                return (
                  <option
                    key={
                      product.id
                    }
                    value={
                      product.id
                    }
                  >
                    {fr?.name ??
                      'Produit sans nom'}
                    {fr?.category
                      ? ` — ${fr.category}`
                      : ''}
                  </option>
                );
              },
            )}
          </select>

          <button
            type="button"
            className="admin-products__secondary-button"
            onClick={
              () =>
                void addHomepageProduct()
            }
            disabled={
              !homepageSelection ||
              homepageMutationId !==
                null
            }
          >
            <Plus
              size={16}
              aria-hidden="true"
            />

            Ajouter
          </button>
        </div>

        {homepageProducts.length >
        0 ? (
          <div className="admin-products__homepage-list">
            {homepageProducts.map(
              (
                product,
                index,
              ) => {
                const fr =
                  getTranslation(
                    product,
                    'fr',
                  );

                const isMutating =
                  homepageMutationId ===
                  product.id;

                return (
                  <article
                    key={
                      product.id
                    }
                    className="admin-products__homepage-item"
                  >
                    <span className="admin-products__homepage-position">
                      {index +
                        1}
                    </span>

                    <div className="admin-products__homepage-copy">
                      <strong>
                        {fr?.name ??
                          'Produit'}
                      </strong>

                      <span>
                        {fr?.title ??
                          '—'}
                      </span>
                    </div>

                    <div className="admin-products__homepage-actions">
                      <button
                        type="button"
                        aria-label="Monter le produit"
                        disabled={
                          index ===
                            0 ||
                          isMutating
                        }
                        onClick={
                          () =>
                            void moveHomepageProduct(
                              product,
                              -1,
                            )
                        }
                      >
                        <ChevronUp
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        aria-label="Descendre le produit"
                        disabled={
                          index ===
                            homepageProducts.length -
                              1 ||
                          isMutating
                        }
                        onClick={
                          () =>
                            void moveHomepageProduct(
                              product,
                              1,
                            )
                        }
                      >
                        <ChevronDown
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        className="admin-products__homepage-remove"
                        aria-label="Retirer de la home"
                        disabled={
                          isMutating
                        }
                        onClick={
                          () =>
                            void removeHomepageProduct(
                              product,
                            )
                        }
                      >
                        {isMutating ? (
                          <LoaderCircle
                            size={16}
                            className="admin-spinner"
                          />
                        ) : (
                          <X
                            size={16}
                          />
                        )}
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <p className="admin-products__homepage-empty">
            Aucun produit n’est encore sélectionné pour la home.
          </p>
        )}
      </section>

      {showForm ? (
        <form
          className="admin-products__form"
          onSubmit={
            event =>
              void handleSubmit(
                event,
              )
          }
        >
          <div className="admin-products__form-header">
            <div>
              <span>
                {editingId
                  ? 'Modification'
                  : 'Création'}
              </span>

              <h2>
                {editingId
                  ? 'Modifier le produit'
                  : 'Ajouter un produit'}
              </h2>
            </div>

            <button
              type="button"
              className="admin-products__icon-button"
              onClick={
                closeForm
              }
              disabled={
                isSaving
              }
            >
              <X
                size={18}
              />
            </button>
          </div>

          <div className="admin-products__settings">
            <label className="admin-products__field admin-products__field--wide">
              <span>
                Lien du produit
              </span>

              <input
                type="text"
                value={
                  form.linkUrl
                }
                onChange={
                  event =>
                    updateForm(
                      'linkUrl',
                      event.target.value,
                    )
                }
                placeholder="https://produit.axplify.com ou /fr/..."
                maxLength={2048}
                required
              />

              <small>
                La carte redirigera directement vers cette adresse. Aucune page détail produit ne sera créée.
              </small>
            </label>

            <label className="admin-products__field">
              <span>
                Ordre catalogue
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.sortOrder
                }
                onChange={
                  event =>
                    updateForm(
                      'sortOrder',
                      event.target.value,
                    )
                }
                required
              />
            </label>

            <label className="admin-products__activity-control">
              <span className="admin-products__activity-copy">
                <strong>
                  Produit actif
                </strong>

                <small>
                  Visible dans le catalogue public.
                </small>
              </span>

              <span className="admin-products__switch">
                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={
                    event =>
                      updateForm(
                        'isActive',
                        event.target.checked,
                      )
                  }
                />

                <span />
              </span>
            </label>
          </div>

          <div className="admin-products__languages">
            <ProductLanguageCard
              locale="fr"
              label="Français"
              required
              name={
                form.frName
              }
              title={
                form.frTitle
              }
              description={
                form.frDescription
              }
              category={
                form.frCategory
              }
              categorySuggestions={
                categorySuggestions
              }
              onNameChange={
                value =>
                  updateForm(
                    'frName',
                    value,
                  )
              }
              onTitleChange={
                value =>
                  updateForm(
                    'frTitle',
                    value,
                  )
              }
              onDescriptionChange={
                value =>
                  updateForm(
                    'frDescription',
                    value,
                  )
              }
              onCategoryChange={
                value =>
                  updateForm(
                    'frCategory',
                    value,
                  )
              }
            />

            <ProductLanguageCard
              locale="en"
              label="English"
              required
              name={
                form.enName
              }
              title={
                form.enTitle
              }
              description={
                form.enDescription
              }
              category={
                form.enCategory
              }
              categorySuggestions={
                categorySuggestions
              }
              onNameChange={
                value =>
                  updateForm(
                    'enName',
                    value,
                  )
              }
              onTitleChange={
                value =>
                  updateForm(
                    'enTitle',
                    value,
                  )
              }
              onDescriptionChange={
                value =>
                  updateForm(
                    'enDescription',
                    value,
                  )
              }
              onCategoryChange={
                value =>
                  updateForm(
                    'enCategory',
                    value,
                  )
              }
            />

            <ProductLanguageCard
              locale="ar"
              label="العربية"
              optional
              direction="rtl"
              name={
                form.arName
              }
              title={
                form.arTitle
              }
              description={
                form.arDescription
              }
              category={
                form.arCategory
              }
              categorySuggestions={
                categorySuggestions
              }
              onNameChange={
                value =>
                  updateForm(
                    'arName',
                    value,
                  )
              }
              onTitleChange={
                value =>
                  updateForm(
                    'arTitle',
                    value,
                  )
              }
              onDescriptionChange={
                value =>
                  updateForm(
                    'arDescription',
                    value,
                  )
              }
              onCategoryChange={
                value =>
                  updateForm(
                    'arCategory',
                    value,
                  )
              }
            />
          </div>

          <div className="admin-products__form-actions">
            <button
              type="button"
              className="admin-products__secondary-button"
              onClick={
                closeForm
              }
              disabled={
                isSaving
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="admin-products__primary-button"
              disabled={
                isSaving
              }
            >
              {isSaving ? (
                <LoaderCircle
                  size={17}
                  className="admin-spinner"
                />
              ) : (
                <Save
                  size={17}
                />
              )}

              <span>
                {editingId
                  ? 'Enregistrer les modifications'
                  : 'Créer le produit'}
              </span>
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-products__filters">
        <label className="admin-products__search">
          <Search
            size={17}
          />

          <input
            type="search"
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="Rechercher un produit, une catégorie ou un lien…"
          />
        </label>

        <select
          value={
            activityFilter
          }
          onChange={
            event =>
              setActivityFilter(
                event.target
                  .value as
                  ActivityFilter,
              )
          }
        >
          <option value="all">
            Tous les statuts
          </option>

          <option value="active">
            Actifs
          </option>

          <option value="inactive">
            Inactifs
          </option>
        </select>

        <select
          value={
            homepageFilter
          }
          onChange={
            event =>
              setHomepageFilter(
                event.target
                  .value as
                  HomepageFilter,
              )
          }
        >
          <option value="all">
            Tous les emplacements
          </option>

          <option value="homepage">
            Sur la home
          </option>

          <option value="catalogOnly">
            Catalogue uniquement
          </option>
        </select>

        <button
          type="button"
          className="admin-products__refresh-button"
          onClick={
            () =>
              void loadProducts()
          }
          disabled={
            isLoading
          }
        >
          <RefreshCcw
            size={17}
            className={
              isLoading
                ? 'admin-spinner'
                : undefined
            }
          />
        </button>
      </div>

      {isLoading ? (
        <div className="admin-products__loading">
          <LoaderCircle
            size={28}
            className="admin-spinner"
          />

          <span>
            Chargement du catalogue…
          </span>
        </div>
      ) : items.length ===
        0 ? (
        <div className="admin-products__empty">
          <Package
            size={34}
          />

          <h2>
            Aucun produit trouvé
          </h2>

          <p>
            Ajoutez votre premier produit ou modifiez les filtres actuels.
          </p>
        </div>
      ) : (
        <div className="admin-products__list">
          {items.map(
            product => {
              const fr =
                getTranslation(
                  product,
                  'fr',
                );

              const en =
                getTranslation(
                  product,
                  'en',
                );

              const ar =
                getTranslation(
                  product,
                  'ar',
                );

              const expanded =
                expandedId ===
                product.id;

              return (
                <article
                  key={
                    product.id
                  }
                  className="admin-products__item"
                >
                  <button
                    type="button"
                    className="admin-products__item-toggle"
                    aria-expanded={
                      expanded
                    }
                    onClick={
                      () =>
                        setExpandedId(
                          current =>
                            current ===
                            product.id
                              ? null
                              : product.id,
                        )
                    }
                  >
                    <div className="admin-products__item-heading">
                      <div className="admin-products__item-meta">
                        <span className="admin-products__category">
                          {fr?.category ??
                            'Sans catégorie'}
                        </span>

                        <span
                          className="admin-products__status"
                          data-active={
                            product.isActive
                          }
                        >
                          {product.isActive ? (
                            <Check
                              size={13}
                            />
                          ) : null}

                          {product.isActive
                            ? 'Actif'
                            : 'Inactif'}
                        </span>

                        {product.showOnHomepage ? (
                          <span className="admin-products__home-badge">
                            Home
                          </span>
                        ) : null}
                      </div>

                      <strong>
                        {fr?.name ??
                          en?.name ??
                          'Produit sans nom'}
                      </strong>

                      <p>
                        {fr?.title ??
                          en?.title ??
                          '—'}
                      </p>
                    </div>

                    <span className="admin-products__chevron">
                      {expanded ? (
                        <ChevronUp
                          size={18}
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                        />
                      )}
                    </span>
                  </button>

                  {expanded ? (
                    <div className="admin-products__item-body">
                      <div className="admin-products__preview">
                        <div>
                          <span>
                            Description française
                          </span>

                          <p>
                            {fr?.description ??
                              '—'}
                          </p>
                        </div>

                        <div className="admin-products__link-preview">
                          <span>
                            Destination
                          </span>

                          <a
                            href={
                              product.linkUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>
                              {product.linkUrl}
                            </span>

                            <ExternalLink
                              size={14}
                            />
                          </a>
                        </div>

                        <div className="admin-products__translation-status">
                          <span>
                            FR
                            <Check
                              size={13}
                            />
                          </span>

                          <span>
                            EN
                            <Check
                              size={13}
                            />
                          </span>

                          <span
                            data-complete={
                              Boolean(
                                ar,
                              )
                            }
                          >
                            AR
                            {ar ? (
                              <Check
                                size={13}
                              />
                            ) : (
                              ' fallback EN'
                            )}
                          </span>
                        </div>

                        <small className="admin-products__updated-at">
                          Modifié le{' '}
                          {formatAdminDate(
                            product.updatedAt,
                          )}
                          {' · '}
                          ordre catalogue{' '}
                          {product.sortOrder}
                        </small>
                      </div>

                      <div className="admin-products__item-actions">
                        <button
                          type="button"
                          onClick={
                            () =>
                              openEditForm(
                                product,
                              )
                          }
                        >
                          <Pencil
                            size={16}
                          />

                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={
                            () =>
                              void toggleActivity(
                                product,
                              )
                          }
                        >
                          {product.isActive ? (
                            <EyeOff
                              size={16}
                            />
                          ) : (
                            <Eye
                              size={16}
                            />
                          )}

                          {product.isActive
                            ? 'Désactiver'
                            : 'Activer'}
                        </button>

                        <button
                          type="button"
                          className="admin-products__delete-button"
                          onClick={
                            () =>
                              void handleDelete(
                                product,
                              )
                          }
                        >
                          <Trash2
                            size={16}
                          />

                          Retirer
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

type ProductLanguageCardProps = {
  locale:
    ProductLocale;

  label:
    string;

  required?:
    boolean;

  optional?:
    boolean;

  direction?:
    'ltr' | 'rtl';

  name:
    string;

  title:
    string;

  description:
    string;

  category:
    string;

  categorySuggestions:
    string[];

  onNameChange:
    (
      value:
        string,
    ) => void;

  onTitleChange:
    (
      value:
        string,
    ) => void;

  onDescriptionChange:
    (
      value:
        string,
    ) => void;

  onCategoryChange:
    (
      value:
        string,
    ) => void;
};

function ProductLanguageCard({
  locale,
  label,
  required = false,
  optional = false,
  direction = 'ltr',
  name,
  title,
  description,
  category,
  categorySuggestions,
  onNameChange,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
}: ProductLanguageCardProps) {
  const datalistId =
    `product-category-${locale}`;

  return (
    <section
      className="admin-products__language-card"
      dir={
        direction
      }
    >
      <div className="admin-products__language-heading">
        <div>
          <span>
            {locale.toUpperCase()}
          </span>

          <strong>
            {label}
          </strong>
        </div>

        <small>
          {optional
            ? 'Facultatif · fallback anglais'
            : 'Obligatoire'}
        </small>
      </div>

      <label>
        <span>
          Nom du produit
        </span>

        <input
          type="text"
          value={
            name
          }
          onChange={
            event =>
              onNameChange(
                event.target.value,
              )
          }
          maxLength={120}
          required={
            required
          }
          placeholder={
            locale ===
            'fr'
              ? 'Ex. Axplify CRM'
              : locale ===
                  'en'
                ? 'E.g. Axplify CRM'
                : 'مثال: Axplify CRM'
          }
        />
      </label>

      <label>
        <span>
          Titre commercial
        </span>

        <input
          type="text"
          value={
            title
          }
          onChange={
            event =>
              onTitleChange(
                event.target.value,
              )
          }
          maxLength={220}
          required={
            required
          }
          placeholder={
            locale ===
            'fr'
              ? 'Une promesse claire orientée bénéfice'
              : locale ===
                  'en'
                ? 'A clear, benefit-led promise'
                : 'عنوان واضح يبرز قيمة المنتج'
          }
        />
      </label>

      <label>
        <span>
          Catégorie
        </span>

        <input
          type="text"
          list={
            datalistId
          }
          value={
            category
          }
          onChange={
            event =>
              onCategoryChange(
                event.target.value,
              )
          }
          maxLength={120}
          required={
            required
          }
          placeholder={
            locale ===
            'fr'
              ? 'Ex. CRM, Data, Marketing…'
              : locale ===
                  'en'
                ? 'E.g. CRM, Data, Marketing…'
                : 'مثال: CRM، البيانات، التسويق…'
          }
        />

        <datalist
          id={
            datalistId
          }
        >
          {categorySuggestions.map(
            suggestion => (
              <option
                key={
                  suggestion
                }
                value={
                  suggestion
                }
              />
            ),
          )}
        </datalist>

        <small>
          Texte libre. Les catégories existantes sont proposées uniquement comme aide à la saisie.
        </small>
      </label>

      <label>
        <span>
          Description
        </span>

        <textarea
          value={
            description
          }
          onChange={
            event =>
              onDescriptionChange(
                event.target.value,
              )
          }
          maxLength={4000}
          required={
            required
          }
          rows={5}
          placeholder={
            locale ===
            'fr'
              ? 'Expliquez simplement le problème que le produit résout et la valeur qu’il apporte.'
              : locale ===
                  'en'
                ? 'Explain the problem the product solves and the value it creates.'
                : 'اشرح المشكلة التي يحلها المنتج والقيمة التي يقدمها.'
          }
        />
      </label>
    </section>
  );
}