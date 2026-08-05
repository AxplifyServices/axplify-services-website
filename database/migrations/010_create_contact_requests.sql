BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================================================
-- 1. Demandes de contact
-- =========================================================

CREATE TABLE contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source VARCHAR(30) NOT NULL,
    locale VARCHAR(5) NOT NULL DEFAULT 'fr',

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(180) NOT NULL,
    job_title VARCHAR(180) NOT NULL,

    need_description TEXT NOT NULL,

    phone_number VARCHAR(40) NOT NULL,
    email CITEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    assigned_to_user_id UUID NULL,
    updated_by_user_id UUID NULL,

    internal_note TEXT NULL,

    wants_appointment BOOLEAN NOT NULL DEFAULT FALSE,

    privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_consent_at TIMESTAMPTZ NULL,

    user_agent TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ NULL,

    CONSTRAINT contact_requests_source_check
        CHECK (
            source IN (
                'CONTACT_PAGE',
                'ASSIST_PAGE'
            )
        ),

    CONSTRAINT contact_requests_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT contact_requests_status_check
        CHECK (
            status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT contact_requests_first_name_not_blank
        CHECK (
            LENGTH(BTRIM(first_name)) >= 2
        ),

    CONSTRAINT contact_requests_last_name_not_blank
        CHECK (
            LENGTH(BTRIM(last_name)) >= 2
        ),

    CONSTRAINT contact_requests_company_name_not_blank
        CHECK (
            LENGTH(BTRIM(company_name)) >= 2
        ),

    CONSTRAINT contact_requests_job_title_not_blank
        CHECK (
            LENGTH(BTRIM(job_title)) >= 2
        ),

    CONSTRAINT contact_requests_need_description_not_blank
        CHECK (
            LENGTH(BTRIM(need_description)) >= 20
        ),

    CONSTRAINT contact_requests_phone_number_not_blank
        CHECK (
            LENGTH(BTRIM(phone_number)) >= 6
        ),

    CONSTRAINT contact_requests_privacy_consent_consistency
        CHECK (
            (
                privacy_consent = TRUE
                AND privacy_consent_at IS NOT NULL
            )
            OR
            (
                privacy_consent = FALSE
                AND privacy_consent_at IS NULL
            )
        ),

    CONSTRAINT contact_requests_assigned_to_user_foreign_key
        FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT contact_requests_updated_by_user_foreign_key
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

COMMENT ON TABLE contact_requests IS
    'Demandes commerciales reçues depuis les pages publiques du site Axplify Services.';

COMMENT ON COLUMN contact_requests.source IS
    'Origine publique : CONTACT_PAGE ou ASSIST_PAGE.';

COMMENT ON COLUMN contact_requests.internal_note IS
    'Note privée visible uniquement dans l’administration.';

COMMENT ON COLUMN contact_requests.updated_by_user_id IS
    'Dernier administrateur ayant modifié la demande ou son statut.';

CREATE INDEX contact_requests_admin_list_index
    ON contact_requests (
        status,
        created_at DESC
    )
    WHERE archived_at IS NULL;

CREATE INDEX contact_requests_source_index
    ON contact_requests (
        source,
        created_at DESC
    )
    WHERE archived_at IS NULL;

CREATE INDEX contact_requests_email_index
    ON contact_requests (
        email
    );

CREATE INDEX contact_requests_company_name_index
    ON contact_requests (
        company_name
    );

CREATE INDEX contact_requests_assigned_to_user_index
    ON contact_requests (
        assigned_to_user_id,
        status,
        created_at DESC
    )
    WHERE archived_at IS NULL;

CREATE INDEX contact_requests_pending_index
    ON contact_requests (
        created_at ASC
    )
    WHERE (
        archived_at IS NULL
        AND status IN (
            'RECEIVED',
            'IN_PROGRESS'
        )
    );


-- =========================================================
-- 2. Disponibilités proposées pour un rendez-vous
-- =========================================================

CREATE TABLE contact_request_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    contact_request_id UUID NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Casablanca',

    note VARCHAR(500) NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_request_availabilities_date_check
        CHECK (
            ends_at > starts_at
        ),

    CONSTRAINT contact_request_availabilities_sort_order_check
        CHECK (
            sort_order >= 0
        ),

    CONSTRAINT contact_request_availabilities_request_foreign_key
        FOREIGN KEY (contact_request_id)
        REFERENCES contact_requests(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

COMMENT ON TABLE contact_request_availabilities IS
    'Créneaux proposés par le visiteur pour être recontacté ou organiser un rendez-vous.';

CREATE INDEX contact_request_availabilities_request_index
    ON contact_request_availabilities (
        contact_request_id,
        sort_order,
        starts_at
    );


-- =========================================================
-- 3. Historique des changements de statut
-- =========================================================

CREATE TABLE contact_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    contact_request_id UUID NOT NULL,

    previous_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,

    changed_by_user_id UUID NULL,
    change_note VARCHAR(500) NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_request_status_history_previous_status_check
        CHECK (
            previous_status IS NULL
            OR previous_status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT contact_request_status_history_new_status_check
        CHECK (
            new_status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT contact_request_status_history_request_foreign_key
        FOREIGN KEY (contact_request_id)
        REFERENCES contact_requests(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT contact_request_status_history_user_foreign_key
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

COMMENT ON TABLE contact_request_status_history IS
    'Historique immuable de création et d’évolution du statut des demandes.';

CREATE INDEX contact_request_status_history_request_index
    ON contact_request_status_history (
        contact_request_id,
        created_at DESC
    );

CREATE INDEX contact_request_status_history_user_index
    ON contact_request_status_history (
        changed_by_user_id,
        created_at DESC
    );


-- =========================================================
-- 4. Associations futures avec les services
-- =========================================================

CREATE TABLE contact_request_service_links (
    contact_request_id UUID NOT NULL,
    service_code VARCHAR(100) NOT NULL,

    linked_by_user_id UUID NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_request_service_links_primary_key
        PRIMARY KEY (
            contact_request_id,
            service_code
        ),

    CONSTRAINT contact_request_service_links_service_code_not_blank
        CHECK (
            LENGTH(BTRIM(service_code)) >= 2
        ),

    CONSTRAINT contact_request_service_links_request_foreign_key
        FOREIGN KEY (contact_request_id)
        REFERENCES contact_requests(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT contact_request_service_links_user_foreign_key
        FOREIGN KEY (linked_by_user_id)
        REFERENCES users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

COMMENT ON TABLE contact_request_service_links IS
    'Services Axplify associés à une demande. Le service_code correspondra aux codes métier du frontend jusqu’à la création éventuelle d’une table services.';

CREATE INDEX contact_request_service_links_service_index
    ON contact_request_service_links (
        service_code,
        created_at DESC
    );

CREATE INDEX contact_request_service_links_user_index
    ON contact_request_service_links (
        linked_by_user_id
    );


-- =========================================================
-- 5. Associations avec les projets existants
-- =========================================================

CREATE TABLE contact_request_project_links (
    contact_request_id UUID NOT NULL,
    project_id UUID NOT NULL,

    linked_by_user_id UUID NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_request_project_links_primary_key
        PRIMARY KEY (
            contact_request_id,
            project_id
        ),

    CONSTRAINT contact_request_project_links_request_foreign_key
        FOREIGN KEY (contact_request_id)
        REFERENCES contact_requests(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT contact_request_project_links_project_foreign_key
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT contact_request_project_links_user_foreign_key
        FOREIGN KEY (linked_by_user_id)
        REFERENCES users(id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

COMMENT ON TABLE contact_request_project_links IS
    'Réalisations Axplify auxquelles le prospect souhaite comparer son besoin.';

CREATE INDEX contact_request_project_links_project_index
    ON contact_request_project_links (
        project_id,
        created_at DESC
    );

CREATE INDEX contact_request_project_links_user_index
    ON contact_request_project_links (
        linked_by_user_id
    );


-- =========================================================
-- 6. Mise à jour automatique de updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION set_contact_request_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

CREATE TRIGGER contact_requests_set_updated_at
BEFORE UPDATE ON contact_requests
FOR EACH ROW
EXECUTE FUNCTION set_contact_request_updated_at();

CREATE TRIGGER contact_request_availabilities_set_updated_at
BEFORE UPDATE ON contact_request_availabilities
FOR EACH ROW
EXECUTE FUNCTION set_contact_request_updated_at();


-- =========================================================
-- 7. Protection des transitions de statut
-- =========================================================

CREATE OR REPLACE FUNCTION validate_contact_request_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    IF OLD.status = 'RECEIVED'
       AND NEW.status IN (
           'IN_PROGRESS',
           'CANCELLED'
       ) THEN
        NEW.status_changed_at := NOW();

        RETURN NEW;
    END IF;

    IF OLD.status = 'IN_PROGRESS'
       AND NEW.status IN (
           'PROCESSED',
           'CANCELLED'
       ) THEN
        NEW.status_changed_at := NOW();

        RETURN NEW;
    END IF;

    RAISE EXCEPTION
        'Transition de statut interdite pour la demande de contact : % vers %',
        OLD.status,
        NEW.status
        USING ERRCODE = '23514';
END;
$$;

CREATE TRIGGER contact_requests_validate_status_transition
BEFORE UPDATE OF status ON contact_requests
FOR EACH ROW
EXECUTE FUNCTION validate_contact_request_status_transition();


-- =========================================================
-- 8. Historisation automatique
-- =========================================================

CREATE OR REPLACE FUNCTION record_contact_request_initial_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO contact_request_status_history (
        contact_request_id,
        previous_status,
        new_status,
        changed_by_user_id
    )
    VALUES (
        NEW.id,
        NULL,
        NEW.status,
        NEW.updated_by_user_id
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER contact_requests_record_initial_status
AFTER INSERT ON contact_requests
FOR EACH ROW
EXECUTE FUNCTION record_contact_request_initial_status();


CREATE OR REPLACE FUNCTION record_contact_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO contact_request_status_history (
            contact_request_id,
            previous_status,
            new_status,
            changed_by_user_id
        )
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.updated_by_user_id
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER contact_requests_record_status_change
AFTER UPDATE OF status ON contact_requests
FOR EACH ROW
EXECUTE FUNCTION record_contact_request_status_change();

COMMIT;