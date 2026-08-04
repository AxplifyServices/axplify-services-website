BEGIN;

-- =========================================================
-- PUBLICATIONS
-- =========================================================

CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    content_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    cover_media_type VARCHAR(20),
    cover_media_url TEXT,

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    featured_sort_order INTEGER NOT NULL DEFAULT 0,

    allow_indexing BOOLEAN NOT NULL DEFAULT TRUE,

    event_start_at TIMESTAMPTZ,
    event_end_at TIMESTAMPTZ,
    event_timezone VARCHAR(80),
    event_location_type VARCHAR(20),
    event_location_name VARCHAR(255),
    event_address TEXT,
    event_online_url TEXT,
    event_registration_url TEXT,
    event_registration_deadline TIMESTAMPTZ,
    event_capacity INTEGER,
    event_status VARCHAR(30),

    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    created_by_user_id UUID,
    updated_by_user_id UUID,
    published_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT publications_content_type_check
        CHECK (
            content_type IN (
                'ARTICLE',
                'CASE_STUDY',
                'NEWS',
                'EVENT',
                'PRESS_RELEASE',
                'ANNOUNCEMENT',
                'GUIDE',
                'RESOURCE'
            )
        ),

    CONSTRAINT publications_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT publications_cover_media_type_check
        CHECK (
            cover_media_type IS NULL
            OR cover_media_type IN (
                'IMAGE',
                'VIDEO'
            )
        ),

    CONSTRAINT publications_cover_media_consistency_check
        CHECK (
            (
                cover_media_type IS NULL
                AND cover_media_url IS NULL
            )
            OR
            (
                cover_media_type IS NOT NULL
                AND cover_media_url IS NOT NULL
                AND LENGTH(TRIM(cover_media_url)) > 0
            )
        ),

    CONSTRAINT publications_featured_sort_order_check
        CHECK (
            featured_sort_order >= 0
        ),

    CONSTRAINT publications_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT publications_updated_by_user_foreign_key
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT publications_published_by_user_foreign_key
        FOREIGN KEY (published_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT publications_published_state_check
        CHECK (
            status <> 'PUBLISHED'
            OR (
                published_at IS NOT NULL
                AND scheduled_at IS NULL
            )
        ),

    CONSTRAINT publications_draft_publication_check
        CHECK (
            status <> 'DRAFT'
            OR published_at IS NULL
        ),

    CONSTRAINT publications_scheduled_state_check
        CHECK (
            scheduled_at IS NULL
            OR (
                status = 'DRAFT'
                AND published_at IS NULL
            )
        ),

    CONSTRAINT publications_event_start_required_check
        CHECK (
            content_type <> 'EVENT'
            OR event_start_at IS NOT NULL
        ),

    CONSTRAINT publications_event_end_check
        CHECK (
            event_end_at IS NULL
            OR (
                event_start_at IS NOT NULL
                AND event_end_at >= event_start_at
            )
        ),

    CONSTRAINT publications_event_location_type_check
        CHECK (
            event_location_type IS NULL
            OR event_location_type IN (
                'PHYSICAL',
                'ONLINE',
                'HYBRID'
            )
        ),

    CONSTRAINT publications_event_status_check
        CHECK (
            event_status IS NULL
            OR event_status IN (
                'UPCOMING',
                'REGISTRATION_OPEN',
                'FULL',
                'ONGOING',
                'COMPLETED',
                'CANCELLED',
                'POSTPONED'
            )
        ),

    CONSTRAINT publications_event_capacity_check
        CHECK (
            event_capacity IS NULL
            OR event_capacity > 0
        ),

    CONSTRAINT publications_non_event_fields_check
        CHECK (
            content_type = 'EVENT'
            OR (
                event_start_at IS NULL
                AND event_end_at IS NULL
                AND event_timezone IS NULL
                AND event_location_type IS NULL
                AND event_location_name IS NULL
                AND event_address IS NULL
                AND event_online_url IS NULL
                AND event_registration_url IS NULL
                AND event_registration_deadline IS NULL
                AND event_capacity IS NULL
                AND event_status IS NULL
            )
        ),

    CONSTRAINT publications_event_registration_deadline_check
        CHECK (
            event_registration_deadline IS NULL
            OR (
                event_start_at IS NOT NULL
                AND event_registration_deadline <= event_start_at
            )
        )
);


-- =========================================================
-- TRADUCTIONS DES PUBLICATIONS
-- =========================================================

CREATE TABLE publication_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(180) NOT NULL,

    excerpt TEXT,
    body TEXT,

    cover_alt_text VARCHAR(255),

    seo_title VARCHAR(255),
    seo_description VARCHAR(320),

    canonical_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_translations_publication_foreign_key
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_translations_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT publication_translations_title_not_empty_check
        CHECK (
            LENGTH(TRIM(title)) > 0
        ),

    CONSTRAINT publication_translations_slug_not_empty_check
        CHECK (
            LENGTH(TRIM(slug)) > 0
        ),

    CONSTRAINT publication_translations_slug_format_check
        CHECK (
            slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
        ),

    CONSTRAINT publication_translations_excerpt_not_empty_check
        CHECK (
            excerpt IS NULL
            OR LENGTH(TRIM(excerpt)) > 0
        ),

    CONSTRAINT publication_translations_body_not_empty_check
        CHECK (
            body IS NULL
            OR LENGTH(TRIM(body)) > 0
        ),

    CONSTRAINT publication_translations_seo_title_not_empty_check
        CHECK (
            seo_title IS NULL
            OR LENGTH(TRIM(seo_title)) > 0
        ),

    CONSTRAINT publication_translations_seo_description_not_empty_check
        CHECK (
            seo_description IS NULL
            OR LENGTH(TRIM(seo_description)) > 0
        ),

    CONSTRAINT publication_translations_publication_locale_unique
        UNIQUE (
            publication_id,
            locale
        ),

    CONSTRAINT publication_translations_locale_slug_unique
        UNIQUE (
            locale,
            slug
        )
);


-- =========================================================
-- MÉDIAS COMPLÉMENTAIRES
-- =========================================================

CREATE TABLE publication_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_id UUID NOT NULL,

    media_type VARCHAR(20) NOT NULL,
    media_url TEXT NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_media_publication_foreign_key
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_media_type_check
        CHECK (
            media_type IN (
                'IMAGE',
                'VIDEO',
                'DOCUMENT'
            )
        ),

    CONSTRAINT publication_media_url_not_empty_check
        CHECK (
            LENGTH(TRIM(media_url)) > 0
        ),

    CONSTRAINT publication_media_sort_order_check
        CHECK (
            sort_order >= 0
        ),

    CONSTRAINT publication_media_width_check
        CHECK (
            width IS NULL
            OR width > 0
        ),

    CONSTRAINT publication_media_height_check
        CHECK (
            height IS NULL
            OR height > 0
        ),

    CONSTRAINT publication_media_duration_check
        CHECK (
            duration_seconds IS NULL
            OR duration_seconds >= 0
        )
);


-- =========================================================
-- TRADUCTIONS DES MÉDIAS
-- =========================================================

CREATE TABLE publication_media_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_media_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL,

    alt_text VARCHAR(255),
    caption TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_media_translations_media_foreign_key
        FOREIGN KEY (publication_media_id)
        REFERENCES publication_media(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_media_translations_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT publication_media_translations_media_locale_unique
        UNIQUE (
            publication_media_id,
            locale
        )
);


-- =========================================================
-- TAGS
-- =========================================================

CREATE TABLE publication_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(80) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_tags_code_not_empty_check
        CHECK (
            LENGTH(TRIM(code)) > 0
        )
);

CREATE UNIQUE INDEX publication_tags_code_unique_index
    ON publication_tags (
        LOWER(TRIM(code))
    );


CREATE TABLE publication_tag_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    publication_tag_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL,

    label VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_tag_translations_tag_foreign_key
        FOREIGN KEY (publication_tag_id)
        REFERENCES publication_tags(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_tag_translations_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT publication_tag_translations_label_not_empty_check
        CHECK (
            LENGTH(TRIM(label)) > 0
        ),

    CONSTRAINT publication_tag_translations_slug_not_empty_check
        CHECK (
            LENGTH(TRIM(slug)) > 0
        ),

    CONSTRAINT publication_tag_translations_slug_format_check
        CHECK (
            slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
        ),

    CONSTRAINT publication_tag_translations_tag_locale_unique
        UNIQUE (
            publication_tag_id,
            locale
        ),

    CONSTRAINT publication_tag_translations_locale_slug_unique
        UNIQUE (
            locale,
            slug
        )
);


CREATE TABLE publication_tag_assignments (
    publication_id UUID NOT NULL,
    publication_tag_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_tag_assignments_primary_key
        PRIMARY KEY (
            publication_id,
            publication_tag_id
        ),

    CONSTRAINT publication_tag_assignments_publication_foreign_key
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_tag_assignments_tag_foreign_key
        FOREIGN KEY (publication_tag_id)
        REFERENCES publication_tags(id)
        ON DELETE CASCADE
);


-- =========================================================
-- LIENS AVEC LES SERVICES AXPLIFY
-- =========================================================

CREATE TABLE publication_expertise (
    publication_id UUID NOT NULL,
    expertise_code VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_expertise_primary_key
        PRIMARY KEY (
            publication_id,
            expertise_code
        ),

    CONSTRAINT publication_expertise_publication_foreign_key
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_expertise_code_check
        CHECK (
            expertise_code IN (
                'digital',
                'automation',
                'data',
                'ai',
                'crm',
                'architecture',
                'analytics',
                'leadGeneration',
                'marketingStrategy'
            )
        )
);


-- =========================================================
-- LIENS DES CAS D’ÉTUDE AVEC LES RÉALISATIONS
-- =========================================================

CREATE TABLE publication_projects (
    publication_id UUID NOT NULL,
    project_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT publication_projects_primary_key
        PRIMARY KEY (
            publication_id,
            project_id
        ),

    CONSTRAINT publication_projects_publication_foreign_key
        FOREIGN KEY (publication_id)
        REFERENCES publications(id)
        ON DELETE CASCADE,

    CONSTRAINT publication_projects_project_foreign_key
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX publications_admin_list_index
    ON publications (
        status,
        updated_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX publications_public_list_index
    ON publications (
        content_type,
        published_at DESC,
        created_at DESC
    )
    WHERE status = 'PUBLISHED'
      AND published_at IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX publications_scheduled_publication_index
    ON publications (
        scheduled_at ASC
    )
    WHERE status = 'DRAFT'
      AND scheduled_at IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX publications_featured_index
    ON publications (
        featured_sort_order ASC,
        published_at DESC
    )
    WHERE is_featured = TRUE
      AND status = 'PUBLISHED'
      AND deleted_at IS NULL;

CREATE INDEX publications_event_start_index
    ON publications (
        event_start_at ASC
    )
    WHERE content_type = 'EVENT'
      AND deleted_at IS NULL;

CREATE INDEX publications_event_status_index
    ON publications (
        event_status,
        event_start_at ASC
    )
    WHERE content_type = 'EVENT'
      AND deleted_at IS NULL;

CREATE INDEX publications_created_by_user_index
    ON publications (
        created_by_user_id
    );

CREATE INDEX publications_updated_by_user_index
    ON publications (
        updated_by_user_id
    );

CREATE INDEX publications_published_by_user_index
    ON publications (
        published_by_user_id
    );

CREATE INDEX publication_translations_publication_index
    ON publication_translations (
        publication_id,
        locale
    );

CREATE INDEX publication_translations_search_index
    ON publication_translations (
        locale,
        title
    );

CREATE INDEX publication_media_publication_index
    ON publication_media (
        publication_id,
        sort_order ASC
    );

CREATE INDEX publication_media_translations_media_index
    ON publication_media_translations (
        publication_media_id,
        locale
    );

CREATE INDEX publication_tag_assignments_tag_index
    ON publication_tag_assignments (
        publication_tag_id,
        publication_id
    );

CREATE INDEX publication_expertise_code_index
    ON publication_expertise (
        expertise_code,
        publication_id
    );

CREATE INDEX publication_projects_project_index
    ON publication_projects (
        project_id,
        publication_id
    );


-- =========================================================
-- TRIGGERS updated_at
-- La fonction set_updated_at() existe déjà dans Axplify.
-- =========================================================

DROP TRIGGER IF EXISTS publications_set_updated_at
    ON publications;

CREATE TRIGGER publications_set_updated_at
BEFORE UPDATE ON publications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS publication_translations_set_updated_at
    ON publication_translations;

CREATE TRIGGER publication_translations_set_updated_at
BEFORE UPDATE ON publication_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS publication_media_translations_set_updated_at
    ON publication_media_translations;

CREATE TRIGGER publication_media_translations_set_updated_at
BEFORE UPDATE ON publication_media_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


DROP TRIGGER IF EXISTS publication_tag_translations_set_updated_at
    ON publication_tag_translations;

CREATE TRIGGER publication_tag_translations_set_updated_at
BEFORE UPDATE ON publication_tag_translations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- DOCUMENTATION
-- =========================================================

COMMENT ON TABLE publications IS
    'Contenus éditoriaux Axplify : articles, cas d’étude, actualités, événements, communiqués, annonces, guides et ressources.';

COMMENT ON COLUMN publications.status IS
    'DRAFT : brouillon ou contenu programmé, PUBLISHED : visible publiquement, ARCHIVED : retiré du site sans suppression.';

COMMENT ON COLUMN publications.scheduled_at IS
    'Date UTC à laquelle un brouillon doit être publié automatiquement.';

COMMENT ON COLUMN publications.allow_indexing IS
    'Contrôle l’autorisation d’indexation SEO de la publication publique.';

COMMENT ON TABLE publication_translations IS
    'Contenu éditorial et métadonnées SEO propres à chaque langue.';

COMMENT ON TABLE publication_media IS
    'Images, vidéos et documents complémentaires associés à une publication.';

COMMENT ON TABLE publication_expertise IS
    'Domaines d’expertise Axplify associés à une publication.';

COMMENT ON TABLE publication_projects IS
    'Réalisations Axplify associées principalement aux cas d’étude.';

COMMIT;