BEGIN;

-- =========================================================
-- 1. RETIRER L’ANCIEN SYSTÈME DE MÉDIA PRINCIPAL
-- =========================================================

ALTER TABLE publications
    DROP CONSTRAINT IF EXISTS publications_cover_media_type_check;

ALTER TABLE publications
    DROP CONSTRAINT IF EXISTS publications_cover_media_consistency_check;

ALTER TABLE publications
    DROP COLUMN IF EXISTS cover_media_type;

ALTER TABLE publications
    DROP COLUMN IF EXISTS cover_media_url;


-- =========================================================
-- 2. FR ET EN UNIQUEMENT EN BASE
-- L’ARABE UTILISERA LE FALLBACK ANGLAIS, PUIS FRANÇAIS.
-- =========================================================

DELETE FROM publication_translations
WHERE locale = 'ar';

ALTER TABLE publication_translations
    DROP CONSTRAINT IF EXISTS publication_translations_locale_check;

ALTER TABLE publication_translations
    ADD CONSTRAINT publication_translations_locale_check
    CHECK (
        locale IN (
            'fr',
            'en'
        )
    );


DELETE FROM publication_media_translations
WHERE locale = 'ar';

ALTER TABLE publication_media_translations
    DROP CONSTRAINT IF EXISTS publication_media_translations_locale_check;

ALTER TABLE publication_media_translations
    ADD CONSTRAINT publication_media_translations_locale_check
    CHECK (
        locale IN (
            'fr',
            'en'
        )
    );


DELETE FROM publication_tag_translations
WHERE locale = 'ar';

ALTER TABLE publication_tag_translations
    DROP CONSTRAINT IF EXISTS publication_tag_translations_locale_check;

ALTER TABLE publication_tag_translations
    ADD CONSTRAINT publication_tag_translations_locale_check
    CHECK (
        locale IN (
            'fr',
            'en'
        )
    );


-- =========================================================
-- 3. MÉDIA D’AFFICHE ET MINIATURE DES VIDÉOS
-- =========================================================

ALTER TABLE publication_media
    ADD COLUMN is_card_cover BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE publication_media
    ADD COLUMN poster_url TEXT;

ALTER TABLE publication_media
    ADD COLUMN poster_frame_seconds NUMERIC(10, 3);

ALTER TABLE publication_media
    ADD CONSTRAINT publication_media_poster_url_not_empty_check
    CHECK (
        poster_url IS NULL
        OR LENGTH(TRIM(poster_url)) > 0
    );

ALTER TABLE publication_media
    ADD CONSTRAINT publication_media_poster_frame_seconds_check
    CHECK (
        poster_frame_seconds IS NULL
        OR poster_frame_seconds >= 0
    );

ALTER TABLE publication_media
    ADD CONSTRAINT publication_media_poster_only_for_video_check
    CHECK (
        media_type = 'VIDEO'
        OR (
            poster_url IS NULL
            AND poster_frame_seconds IS NULL
        )
    );

ALTER TABLE publication_media
    ADD CONSTRAINT publication_media_video_poster_consistency_check
    CHECK (
        poster_frame_seconds IS NULL
        OR poster_url IS NOT NULL
    );


-- =========================================================
-- 4. UN SEUL MÉDIA D’AFFICHE PAR PUBLICATION
-- =========================================================

CREATE UNIQUE INDEX publication_media_single_card_cover_index
    ON publication_media (
        publication_id
    )
    WHERE is_card_cover = TRUE;


-- =========================================================
-- 5. LIMITE DE CINQ MÉDIAS PAR PUBLICATION
-- =========================================================

CREATE OR REPLACE FUNCTION enforce_publication_media_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_media_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO current_media_count
    FROM publication_media
    WHERE publication_id = NEW.publication_id
      AND (
          TG_OP <> 'UPDATE'
          OR id <> NEW.id
      );

    IF current_media_count >= 5 THEN
        RAISE EXCEPTION
            'Une publication ne peut pas contenir plus de 5 médias.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS publication_media_limit_trigger
    ON publication_media;

CREATE TRIGGER publication_media_limit_trigger
BEFORE INSERT OR UPDATE OF publication_id
ON publication_media
FOR EACH ROW
EXECUTE FUNCTION enforce_publication_media_limit();


-- =========================================================
-- 6. INDEX DE RÉCUPÉRATION DES MÉDIAS
-- =========================================================

DROP INDEX IF EXISTS publication_media_publication_index;

CREATE INDEX publication_media_publication_index
    ON publication_media (
        publication_id,
        is_card_cover DESC,
        sort_order ASC,
        created_at ASC
    );


-- =========================================================
-- 7. DOCUMENTATION
-- =========================================================

COMMENT ON COLUMN publication_media.is_card_cover IS
    'Indique le média utilisé comme visuel principal dans les cartes publiques. Un seul média peut être sélectionné par publication.';

COMMENT ON COLUMN publication_media.poster_url IS
    'Image WebP extraite automatiquement d’une vidéo et utilisée comme aperçu statique.';

COMMENT ON COLUMN publication_media.poster_frame_seconds IS
    'Position en secondes du frame extrait pour générer poster_url.';

COMMIT;