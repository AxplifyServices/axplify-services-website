BEGIN;

-- =========================================================
-- TYPE DE MÉDIA DES BROCHURES
-- =========================================================

ALTER TABLE homepage_brochures
    ADD COLUMN media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE';

-- =========================================================
-- VIDÉOS FRANÇAISES
-- =========================================================

ALTER TABLE homepage_brochures
    ADD COLUMN desktop_video_fr_url TEXT,
    ADD COLUMN mobile_video_fr_url TEXT;

-- =========================================================
-- VIDÉOS ANGLAISES
-- La version anglaise sert également de priorité à l’arabe.
-- =========================================================

ALTER TABLE homepage_brochures
    ADD COLUMN desktop_video_en_url TEXT,
    ADD COLUMN mobile_video_en_url TEXT;

-- =========================================================
-- VALEURS AUTORISÉES
-- =========================================================

ALTER TABLE homepage_brochures
    ADD CONSTRAINT homepage_brochures_media_type_check
        CHECK (
            media_type IN (
                'IMAGE',
                'VIDEO'
            )
        );

-- =========================================================
-- REMPLACEMENT DE L’ANCIENNE CONTRAINTE
-- =========================================================

ALTER TABLE homepage_brochures
    DROP CONSTRAINT IF EXISTS homepage_brochures_active_image_check;

ALTER TABLE homepage_brochures
    ADD CONSTRAINT homepage_brochures_active_media_check
        CHECK (
            is_active = FALSE
            OR (
                media_type = 'IMAGE'
                AND (
                    desktop_image_fr_url IS NOT NULL
                    OR desktop_image_en_url IS NOT NULL
                )
            )
            OR (
                media_type = 'VIDEO'
                AND (
                    desktop_video_fr_url IS NOT NULL
                    OR desktop_video_en_url IS NOT NULL
                )
            )
        );

COMMIT;