BEGIN;

-- =========================================================
-- EXTENSIONS POSTGRESQL
-- =========================================================

-- gen_random_uuid() et crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Comparaison insensible à la casse pour les adresses e-mail
CREATE EXTENSION IF NOT EXISTS citext;

-- =========================================================
-- FONCTION DE MISE À JOUR AUTOMATIQUE DE updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- =========================================================
-- TABLE DES RÔLES
-- =========================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT roles_code_unique UNIQUE (code),
    CONSTRAINT roles_code_format_check
        CHECK (code ~ '^[A-Z][A-Z0-9_]*$')
);

DROP TRIGGER IF EXISTS roles_set_updated_at ON roles;

CREATE TRIGGER roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- TABLE DES UTILISATEURS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email CITEXT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100),
    last_name VARCHAR(100),

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,

    password_changed_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT users_email_unique UNIQUE (email),

    CONSTRAINT users_email_not_empty_check
        CHECK (length(trim(email::TEXT)) > 0),

    CONSTRAINT users_status_check
        CHECK (
            status IN (
                'PENDING',
                'ACTIVE',
                'SUSPENDED',
                'DISABLED'
            )
        ),

    CONSTRAINT users_failed_login_attempts_check
        CHECK (failed_login_attempts >= 0)
);

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS users_status_index
    ON users(status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS users_locked_until_index
    ON users(locked_until)
    WHERE locked_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS users_created_at_index
    ON users(created_at DESC);

-- =========================================================
-- ASSOCIATION UTILISATEURS / RÔLES
-- =========================================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT user_roles_user_id_foreign_key
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT user_roles_role_id_foreign_key
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT user_roles_assigned_by_foreign_key
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS user_roles_role_id_index
    ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS user_roles_assigned_by_index
    ON user_roles(assigned_by);

-- =========================================================
-- SESSIONS DE RAFRAÎCHISSEMENT
-- =========================================================

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    -- On ne stockera jamais le refresh token en clair.
    token_hash VARCHAR(255) NOT NULL,

    user_agent TEXT,
    ip_address INET,

    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,

    revoked_at TIMESTAMPTZ,
    revoke_reason VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT refresh_sessions_token_hash_unique
        UNIQUE (token_hash),

    CONSTRAINT refresh_sessions_user_id_foreign_key
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT refresh_sessions_expiration_check
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS refresh_sessions_user_id_index
    ON refresh_sessions(user_id);

CREATE INDEX IF NOT EXISTS refresh_sessions_expires_at_index
    ON refresh_sessions(expires_at);

CREATE INDEX IF NOT EXISTS refresh_sessions_active_user_index
    ON refresh_sessions(user_id, expires_at)
    WHERE revoked_at IS NULL;

-- =========================================================
-- HISTORIQUE DES TENTATIVES DE CONNEXION
-- =========================================================

CREATE TABLE IF NOT EXISTS authentication_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID,
    email CITEXT,

    event_type VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,

    ip_address INET,
    user_agent TEXT,

    failure_reason VARCHAR(100),
    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT authentication_events_user_id_foreign_key
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT authentication_events_type_check
        CHECK (
            event_type IN (
                'LOGIN',
                'LOGOUT',
                'REFRESH_TOKEN',
                'PASSWORD_CHANGE',
                'PASSWORD_RESET_REQUEST',
                'PASSWORD_RESET_COMPLETED',
                'ACCOUNT_LOCKED'
            )
        )
);

CREATE INDEX IF NOT EXISTS authentication_events_user_id_index
    ON authentication_events(user_id);

CREATE INDEX IF NOT EXISTS authentication_events_email_index
    ON authentication_events(email);

CREATE INDEX IF NOT EXISTS authentication_events_created_at_index
    ON authentication_events(created_at DESC);

CREATE INDEX IF NOT EXISTS authentication_events_failed_logins_index
    ON authentication_events(email, created_at DESC)
    WHERE event_type = 'LOGIN' AND success = FALSE;

-- =========================================================
-- CRÉATION DU RÔLE SUPER ADMINISTRATEUR
-- =========================================================

INSERT INTO roles (
    code,
    name,
    description,
    is_system
)
VALUES (
    'SUPER_ADMIN',
    'Super administrateur',
    'Accès complet à l’administration et à toutes les fonctionnalités de la plateforme.',
    TRUE
)
ON CONFLICT (code) DO NOTHING;

-- =========================================================
-- CRÉATION DU PREMIER SUPER ADMINISTRATEUR
-- =========================================================
--
-- PostgreSQL génère directement un hash bcrypt avec un coût de 12.
-- Le mot de passe n'est jamais enregistré en clair.
--
-- must_change_password reste à TRUE car admin123 est un mot de passe
-- temporaire et insuffisant pour un environnement de production.
-- =========================================================

INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    status,
    is_email_verified,
    must_change_password,
    password_changed_at
)
VALUES (
    'zakariae.zitane@axplify-services.com',
    crypt('admin123', gen_salt('bf', 12)),
    'Zakariae',
    'Zitane',
    'ACTIVE',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- ATTRIBUTION DU RÔLE SUPER_ADMIN
-- =========================================================

INSERT INTO user_roles (
    user_id,
    role_id,
    assigned_by
)
SELECT
    users.id,
    roles.id,
    users.id
FROM users
INNER JOIN roles
    ON roles.code = 'SUPER_ADMIN'
WHERE users.email = 'zakariae.zitane@axplify-services.com'
ON CONFLICT (user_id, role_id) DO NOTHING;

COMMIT;