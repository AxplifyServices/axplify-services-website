BEGIN;

-- =========================================================
-- CLÉ PUBLIQUE D'INTÉGRATION DES PRODUITS
-- =========================================================
--
-- Les landing pages ne doivent pas dépendre directement
-- de l'ID interne PostgreSQL d'un produit.
--
-- Cette clé est :
-- - générée automatiquement ;
-- - stable ;
-- - unique ;
-- - destinée aux intégrations externes / landing pages.
-- =========================================================

ALTER TABLE products
ADD COLUMN integration_key UUID;

UPDATE products
SET integration_key = gen_random_uuid()
WHERE integration_key IS NULL;

ALTER TABLE products
ALTER COLUMN integration_key SET DEFAULT gen_random_uuid();

ALTER TABLE products
ALTER COLUMN integration_key SET NOT NULL;

ALTER TABLE products
ADD CONSTRAINT products_integration_key_unique
UNIQUE (integration_key);

CREATE INDEX products_integration_key_active_index
ON products (integration_key)
WHERE deleted_at IS NULL
  AND is_active = TRUE;


-- =========================================================
-- DEMANDES ISSUES DES LANDING PAGES PRODUITS
-- =========================================================

CREATE TABLE product_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    request_type VARCHAR(30) NOT NULL,

    locale VARCHAR(5) NOT NULL DEFAULT 'fr',

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    company_name VARCHAR(180),

    email CITEXT NOT NULL,
    phone_number VARCHAR(40),

    request_message TEXT NOT NULL,

    source_url TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    assigned_to_user_id UUID,
    updated_by_user_id UUID,

    internal_note TEXT,

    privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_consent_at TIMESTAMPTZ,

    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    archived_at TIMESTAMPTZ,

    CONSTRAINT product_requests_product_foreign_key
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT product_requests_assigned_to_user_foreign_key
        FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT product_requests_updated_by_user_foreign_key
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT product_requests_type_check
        CHECK (
            request_type IN (
                'CONTACT',
                'DEMO',
                'ORDER'
            )
        ),

    CONSTRAINT product_requests_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT product_requests_status_check
        CHECK (
            status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT product_requests_first_name_not_blank_check
        CHECK (
            LENGTH(BTRIM(first_name)) >= 2
        ),

    CONSTRAINT product_requests_last_name_not_blank_check
        CHECK (
            LENGTH(BTRIM(last_name)) >= 2
        ),

    CONSTRAINT product_requests_email_not_blank_check
        CHECK (
            LENGTH(BTRIM(email::TEXT)) >= 3
        ),

    CONSTRAINT product_requests_message_not_blank_check
        CHECK (
            LENGTH(BTRIM(request_message)) >= 10
        )
);


-- =========================================================
-- HISTORIQUE DES CHANGEMENTS DE STATUT
-- =========================================================

CREATE TABLE product_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_request_id UUID NOT NULL,

    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,

    changed_by_user_id UUID,

    change_note VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_request_status_history_request_foreign_key
        FOREIGN KEY (product_request_id)
        REFERENCES product_requests(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT product_request_status_history_user_foreign_key
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT product_request_status_history_previous_status_check
        CHECK (
            previous_status IS NULL
            OR previous_status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT product_request_status_history_new_status_check
        CHECK (
            new_status IN (
                'RECEIVED',
                'IN_PROGRESS',
                'PROCESSED',
                'CANCELLED'
            )
        )
);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX product_requests_admin_list_index
ON product_requests (
    status,
    created_at DESC
)
WHERE archived_at IS NULL;

CREATE INDEX product_requests_product_index
ON product_requests (
    product_id,
    created_at DESC
)
WHERE archived_at IS NULL;

CREATE INDEX product_requests_type_index
ON product_requests (
    request_type,
    created_at DESC
)
WHERE archived_at IS NULL;

CREATE INDEX product_requests_assigned_user_index
ON product_requests (
    assigned_to_user_id,
    status,
    created_at DESC
)
WHERE archived_at IS NULL;

CREATE INDEX product_requests_email_index
ON product_requests (email);

CREATE INDEX product_requests_pending_index
ON product_requests (created_at DESC)
WHERE archived_at IS NULL
  AND status IN (
      'RECEIVED',
      'IN_PROGRESS'
  );

CREATE INDEX product_request_status_history_request_index
ON product_request_status_history (
    product_request_id,
    created_at DESC
);

CREATE INDEX product_request_status_history_user_index
ON product_request_status_history (
    changed_by_user_id,
    created_at DESC
);


-- =========================================================
-- TRIGGERS updated_at
-- =========================================================

DROP TRIGGER IF EXISTS product_requests_set_updated_at
ON product_requests;

CREATE TRIGGER product_requests_set_updated_at
BEFORE UPDATE ON product_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- COMMENTAIRES
-- =========================================================

COMMENT ON COLUMN products.integration_key IS
'Clé publique stable permettant aux landing pages et intégrations externes de référencer un produit sans exposer son identifiant interne.';

COMMENT ON TABLE product_requests IS
'Demandes commerciales provenant des landing pages produits Axplify : contact, démonstration ou intention de commande.';

COMMENT ON COLUMN product_requests.request_type IS
'Nature de la demande : CONTACT, DEMO ou ORDER.';

COMMENT ON COLUMN product_requests.source_url IS
'URL de la landing page ayant généré la demande. Cette donnée est informative et ne doit jamais être considérée comme fiable pour déterminer le produit.';

COMMIT;