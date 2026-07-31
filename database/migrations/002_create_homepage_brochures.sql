BEGIN;

-- =========================================================
-- BROCHURES DE LA PAGE D'ACCUEIL
-- =========================================================

CREATE TABLE homepage_brochures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    internal_name VARCHAR(150) NOT NULL,

    desktop_image_fr_url TEXT,
    mobile_image_fr_url TEXT,

    desktop_image_en_url TEXT,
    mobile_image_en_url TEXT,

    alt_text_fr VARCHAR(255),
    alt_text_en VARCHAR(255),

    link_url TEXT,
    link_target VARCHAR(20) NOT NULL DEFAULT '_self',

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT homepage_brochures_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT homepage_brochures_internal_name_not_empty_check
        CHECK (
            LENGTH(TRIM(internal_name)) > 0
        ),

    CONSTRAINT homepage_brochures_link_target_check
        CHECK (
            link_target IN (
                '_self',
                '_blank'
            )
        ),

    CONSTRAINT homepage_brochures_sort_order_check
        CHECK (
            sort_order >= 0
        ),

    CONSTRAINT homepage_brochures_active_image_check
        CHECK (
            is_active = FALSE
            OR desktop_image_fr_url IS NOT NULL
            OR desktop_image_en_url IS NOT NULL
        )
);

-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX homepage_brochures_public_index
    ON homepage_brochures (
        is_active,
        sort_order,
        created_at
    );

CREATE INDEX homepage_brochures_created_by_user_index
    ON homepage_brochures (
        created_by_user_id
    );

-- =========================================================
-- MISE À JOUR AUTOMATIQUE DE updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION update_homepage_brochures_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER homepage_brochures_updated_at_trigger
BEFORE UPDATE ON homepage_brochures
FOR EACH ROW
EXECUTE FUNCTION update_homepage_brochures_updated_at();

COMMIT;