BEGIN;

-- =========================================================
-- CLIENTS
-- =========================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(180) NOT NULL,

    industry_fr VARCHAR(180) NOT NULL,
    industry_en VARCHAR(180),
    industry_ar VARCHAR(180),

    logo_url TEXT NOT NULL,
    logo_alt_fr VARCHAR(255),
    logo_alt_en VARCHAR(255),
    logo_alt_ar VARCHAR(255),

    show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    homepage_sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT clients_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT clients_name_not_empty_check
        CHECK (
            LENGTH(TRIM(name)) > 0
        ),

    CONSTRAINT clients_industry_fr_not_empty_check
        CHECK (
            LENGTH(TRIM(industry_fr)) > 0
        ),

    CONSTRAINT clients_logo_url_not_empty_check
        CHECK (
            LENGTH(TRIM(logo_url)) > 0
        ),

    CONSTRAINT clients_homepage_sort_order_check
        CHECK (
            homepage_sort_order >= 0
        )
);

-- La casse ne doit pas permettre de créer deux fois le même client.
CREATE UNIQUE INDEX clients_name_unique_index
    ON clients (
        LOWER(TRIM(name))
    );

CREATE INDEX clients_admin_list_index
    ON clients (
        is_active,
        name
    );

CREATE INDEX clients_homepage_index
    ON clients (
        show_on_homepage,
        is_active,
        homepage_sort_order,
        created_at
    )
    WHERE show_on_homepage = TRUE
      AND is_active = TRUE;

CREATE INDEX clients_created_by_user_index
    ON clients (
        created_by_user_id
    );

DROP TRIGGER IF EXISTS clients_set_updated_at
    ON clients;

CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- PROJETS / RÉALISATIONS
-- =========================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id UUID NOT NULL,

    title_fr VARCHAR(220) NOT NULL,
    title_en VARCHAR(220),
    title_ar VARCHAR(220),

    description_fr TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_by_user_id UUID,
    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT projects_client_foreign_key
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE RESTRICT,

    CONSTRAINT projects_created_by_user_foreign_key
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT projects_title_fr_not_empty_check
        CHECK (
            LENGTH(TRIM(title_fr)) > 0
        ),

    CONSTRAINT projects_description_fr_not_empty_check
        CHECK (
            LENGTH(TRIM(description_fr)) > 0
        ),

    CONSTRAINT projects_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT projects_sort_order_check
        CHECK (
            sort_order >= 0
        ),

    CONSTRAINT projects_published_at_check
        CHECK (
            status <> 'PUBLISHED'
            OR published_at IS NOT NULL
        )
);

CREATE INDEX projects_admin_list_index
    ON projects (
        status,
        updated_at DESC
    );

CREATE INDEX projects_public_list_index
    ON projects (
        status,
        sort_order,
        published_at DESC,
        created_at DESC
    )
    WHERE status = 'PUBLISHED';

CREATE INDEX projects_client_index
    ON projects (
        client_id,
        status
    );

CREATE INDEX projects_created_by_user_index
    ON projects (
        created_by_user_id
    );

DROP TRIGGER IF EXISTS projects_set_updated_at
    ON projects;

CREATE TRIGGER projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- DOMAINES D’EXPERTISE ASSOCIÉS AUX PROJETS
-- =========================================================

CREATE TABLE project_expertise (
    project_id UUID NOT NULL,

    expertise_code VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT project_expertise_primary_key
        PRIMARY KEY (
            project_id,
            expertise_code
        ),

    CONSTRAINT project_expertise_project_foreign_key
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT project_expertise_code_check
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

CREATE INDEX project_expertise_code_index
    ON project_expertise (
        expertise_code,
        project_id
    );


-- =========================================================
-- COMMENTAIRES DE DOCUMENTATION
-- =========================================================

COMMENT ON TABLE clients IS
    'Entreprises clientes pouvant être affichées sur la page d’accueil et associées à des réalisations.';

COMMENT ON COLUMN clients.show_on_homepage IS
    'Indique que le logo du client peut apparaître dans les lignes animées de la page d’accueil.';

COMMENT ON TABLE projects IS
    'Réalisations publiques ou en préparation associées à un client.';

COMMENT ON COLUMN projects.status IS
    'DRAFT : brouillon, PUBLISHED : visible publiquement, ARCHIVED : conservé mais masqué.';

COMMENT ON TABLE project_expertise IS
    'Association multiple entre une réalisation et les domaines d’expertise définis dans les traductions du frontend.';

COMMIT;