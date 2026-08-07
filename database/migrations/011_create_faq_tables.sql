BEGIN;

CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_code VARCHAR(50) NOT NULL DEFAULT 'GENERAL',

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_visible BOOLEAN NOT NULL DEFAULT FALSE,

    created_by_user_id UUID NULL,

    updated_by_user_id UUID NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT faq_items_category_code_check
        CHECK (
            category_code IN (
                'OFFER',
                'METHODOLOGY',
                'PROTOTYPE',
                'DELIVERY',
                'BUDGET',
                'TECHNICAL',
                'SUPPORT',
                'GENERAL'
            )
        ),

    CONSTRAINT faq_items_sort_order_check
        CHECK (
            sort_order >= 0
            AND sort_order <= 10000
        ),

    CONSTRAINT faq_items_created_by_user_foreign_key
        FOREIGN KEY (
            created_by_user_id
        )
        REFERENCES users (
            id
        )
        ON DELETE SET NULL,

    CONSTRAINT faq_items_updated_by_user_foreign_key
        FOREIGN KEY (
            updated_by_user_id
        )
        REFERENCES users (
            id
        )
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faq_item_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    faq_item_id UUID NOT NULL,

    locale VARCHAR(5) NOT NULL,

    question VARCHAR(300) NOT NULL,

    answer TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT faq_item_translations_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT faq_item_translations_question_not_empty_check
        CHECK (
            LENGTH(
                BTRIM(
                    question
                )
            ) >= 5
        ),

    CONSTRAINT faq_item_translations_answer_not_empty_check
        CHECK (
            LENGTH(
                BTRIM(
                    answer
                )
            ) >= 10
        ),

    CONSTRAINT faq_item_translations_faq_item_foreign_key
        FOREIGN KEY (
            faq_item_id
        )
        REFERENCES faq_items (
            id
        )
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS faq_item_translations_item_locale_unique
    ON faq_item_translations (
        faq_item_id,
        locale
    );

CREATE INDEX IF NOT EXISTS faq_items_admin_list_index
    ON faq_items (
        category_code,
        is_visible,
        sort_order,
        updated_at DESC
    );

CREATE INDEX IF NOT EXISTS faq_items_public_list_index
    ON faq_items (
        category_code,
        sort_order,
        created_at
    )
    WHERE is_visible = TRUE;

CREATE INDEX IF NOT EXISTS faq_items_created_by_user_index
    ON faq_items (
        created_by_user_id
    );

CREATE INDEX IF NOT EXISTS faq_items_updated_by_user_index
    ON faq_items (
        updated_by_user_id
    );

CREATE INDEX IF NOT EXISTS faq_item_translations_locale_index
    ON faq_item_translations (
        locale,
        faq_item_id
    );

COMMENT ON TABLE faq_items IS
    'Questions de la FAQ Axplify Services et configuration de leur affichage.';

COMMENT ON TABLE faq_item_translations IS
    'Questions et réponses traduites en français, anglais et arabe.';

COMMENT ON COLUMN faq_items.is_visible IS
    'Détermine si la question peut être affichée sur le site public.';

COMMENT ON COLUMN faq_items.sort_order IS
    'Ordre manuel d’affichage dans une catégorie.';

COMMIT;