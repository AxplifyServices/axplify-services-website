BEGIN;

-- =========================================================
-- INVITATIONS PRIVÉES POUR DÉPOSER UN AVIS
-- =========================================================

CREATE TABLE review_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token_hash VARCHAR(64) NOT NULL,

    project_id UUID,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    created_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT review_invitations_token_hash_unique
        UNIQUE (token_hash),

    CONSTRAINT review_invitations_project_foreign_key
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL,

    CONSTRAINT review_invitations_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT review_invitations_expiration_check
        CHECK (
            expires_at > created_at
        ),

    CONSTRAINT review_invitations_used_revoked_check
        CHECK (
            NOT (
                used_at IS NOT NULL
                AND revoked_at IS NOT NULL
            )
        )
);

CREATE INDEX review_invitations_project_index
    ON review_invitations (
        project_id
    );

CREATE INDEX review_invitations_active_index
    ON review_invitations (
        expires_at,
        used_at,
        revoked_at
    )
    WHERE used_at IS NULL
      AND revoked_at IS NULL;

CREATE INDEX review_invitations_created_by_user_index
    ON review_invitations (
        created_by_user_id
    );

DROP TRIGGER IF EXISTS review_invitations_set_updated_at
    ON review_invitations;

CREATE TRIGGER review_invitations_set_updated_at
BEFORE UPDATE ON review_invitations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- REVIEWS
-- =========================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    invitation_id UUID NOT NULL,

    project_id UUID,

    rating SMALLINT NOT NULL,

    comment TEXT NOT NULL,

    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,

    company_name VARCHAR(180) NOT NULL,
    company_role VARCHAR(180) NOT NULL,

    locale VARCHAR(5) NOT NULL DEFAULT 'fr',

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',

    show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    homepage_sort_order INTEGER NOT NULL DEFAULT 0,

    published_at TIMESTAMPTZ,

    published_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT reviews_invitation_unique
        UNIQUE (invitation_id),

    CONSTRAINT reviews_invitation_foreign_key
        FOREIGN KEY (invitation_id)
        REFERENCES review_invitations(id)
        ON DELETE RESTRICT,

    CONSTRAINT reviews_project_foreign_key
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL,

    CONSTRAINT reviews_published_by_user_foreign_key
        FOREIGN KEY (published_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT reviews_rating_check
        CHECK (
            rating BETWEEN 1 AND 5
        ),

    CONSTRAINT reviews_comment_not_empty_check
        CHECK (
            LENGTH(TRIM(comment)) >= 10
        ),

    CONSTRAINT reviews_first_name_not_empty_check
        CHECK (
            LENGTH(TRIM(first_name)) > 0
        ),

    CONSTRAINT reviews_last_name_not_empty_check
        CHECK (
            LENGTH(TRIM(last_name)) > 0
        ),

    CONSTRAINT reviews_company_name_not_empty_check
        CHECK (
            LENGTH(TRIM(company_name)) > 0
        ),

    CONSTRAINT reviews_company_role_not_empty_check
        CHECK (
            LENGTH(TRIM(company_role)) > 0
        ),

    CONSTRAINT reviews_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT reviews_status_check
        CHECK (
            status IN (
                'PENDING_REVIEW',
                'PUBLISHED',
                'REJECTED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT reviews_homepage_sort_order_check
        CHECK (
            homepage_sort_order >= 0
        ),

    CONSTRAINT reviews_homepage_publication_check
        CHECK (
            show_on_homepage = FALSE
            OR status = 'PUBLISHED'
        ),

    CONSTRAINT reviews_publication_state_check
        CHECK (
            (
                status = 'PUBLISHED'
                AND published_at IS NOT NULL
            )
            OR
            (
                status <> 'PUBLISHED'
                AND published_at IS NULL
            )
        )
);

CREATE INDEX reviews_admin_list_index
    ON reviews (
        status,
        created_at DESC
    );

CREATE INDEX reviews_public_list_index
    ON reviews (
        published_at DESC,
        created_at DESC
    )
    WHERE status = 'PUBLISHED';

CREATE INDEX reviews_homepage_index
    ON reviews (
        homepage_sort_order,
        published_at DESC
    )
    WHERE status = 'PUBLISHED'
      AND show_on_homepage = TRUE;

CREATE INDEX reviews_project_index
    ON reviews (
        project_id,
        status
    );

CREATE INDEX reviews_rating_index
    ON reviews (
        rating
    )
    WHERE status = 'PUBLISHED';

DROP TRIGGER IF EXISTS reviews_set_updated_at
    ON reviews;

CREATE TRIGGER reviews_set_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- DOCUMENTATION
-- =========================================================

COMMENT ON TABLE review_invitations IS
    'Invitations privées et à usage unique permettant à un client de déposer un avis.';

COMMENT ON COLUMN review_invitations.token_hash IS
    'Empreinte SHA-256 du token envoyé dans le lien. Le token original ne doit jamais être stocké en base.';

COMMENT ON COLUMN review_invitations.project_id IS
    'Réalisation suggérée lors de la création de l invitation. Peut rester NULL.';

COMMENT ON TABLE reviews IS
    'Avis clients soumis via invitation privée et soumis à validation administrateur avant publication.';

COMMENT ON COLUMN reviews.project_id IS
    'Réalisation Axplify éventuellement associée à cet avis.';

COMMENT ON COLUMN reviews.status IS
    'PENDING_REVIEW : en attente de modération, PUBLISHED : public, REJECTED : refusé, ARCHIVED : retiré du site.';

COMMENT ON COLUMN reviews.show_on_homepage IS
    'Indique qu un avis publié doit être présenté dans le carousel de la page d accueil.';

COMMIT;