BEGIN;

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    link_url TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    homepage_sort_order INTEGER NOT NULL DEFAULT 0,

    created_by_user_id UUID,
    updated_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT products_link_url_not_empty_check
        CHECK (LENGTH(TRIM(link_url)) > 0),

    CONSTRAINT products_sort_order_check
        CHECK (sort_order >= 0),

    CONSTRAINT products_homepage_sort_order_check
        CHECK (homepage_sort_order >= 0),

    CONSTRAINT products_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT products_updated_by_user_foreign_key
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE product_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL,

    name VARCHAR(120) NOT NULL,
    title VARCHAR(220) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(120) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_translations_product_foreign_key
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT product_translations_locale_check
        CHECK (locale IN ('fr', 'en', 'ar')),

    CONSTRAINT product_translations_name_not_empty_check
        CHECK (LENGTH(TRIM(name)) > 0),

    CONSTRAINT product_translations_title_not_empty_check
        CHECK (LENGTH(TRIM(title)) > 0),

    CONSTRAINT product_translations_description_not_empty_check
        CHECK (LENGTH(TRIM(description)) > 0),

    CONSTRAINT product_translations_category_not_empty_check
        CHECK (LENGTH(TRIM(category)) > 0),

    CONSTRAINT product_translations_product_locale_unique
        UNIQUE (product_id, locale)
);

CREATE INDEX products_admin_list_index
    ON products (is_active, show_on_homepage, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX products_public_list_index
    ON products (sort_order, created_at)
    WHERE deleted_at IS NULL
      AND is_active = TRUE;

CREATE INDEX products_homepage_list_index
    ON products (homepage_sort_order, sort_order, created_at)
    WHERE deleted_at IS NULL
      AND is_active = TRUE
      AND show_on_homepage = TRUE;

CREATE INDEX products_created_by_user_index
    ON products (created_by_user_id);

CREATE INDEX products_updated_by_user_index
    ON products (updated_by_user_id);

CREATE INDEX product_translations_locale_product_index
    ON product_translations (locale, product_id);

CREATE INDEX product_translations_category_index
    ON product_translations (locale, category);

COMMENT ON TABLE products IS
    'Catalogue des produits Axplify. Chaque carte redirige directement vers link_url.';

COMMENT ON COLUMN products.show_on_homepage IS
    'Détermine si le produit peut apparaître dans la sélection produits de la page d accueil.';

COMMENT ON COLUMN product_translations.category IS
    'Catégorie éditoriale libre et traduisible, utilisée pour générer les filtres du catalogue public.';

COMMIT;