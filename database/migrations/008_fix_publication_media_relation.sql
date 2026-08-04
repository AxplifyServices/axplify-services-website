BEGIN;

-- =========================================================
-- 1. SUPPRIMER L’INDEX UNIQUE PARTIEL
-- =========================================================
--
-- Cet index est valide pour PostgreSQL, mais Prisma l’interprète
-- comme si publication_id était toujours unique.
-- Cela transforme incorrectement la relation en un-à-un.
--

DROP INDEX IF EXISTS publication_media_single_card_cover_index;


-- =========================================================
-- 2. GARANTIR UN SEUL MÉDIA D’AFFICHE AVEC UN TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION enforce_single_publication_card_cover()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    existing_cover_id UUID;
BEGIN
    IF NEW.is_card_cover IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    SELECT id
    INTO existing_cover_id
    FROM publication_media
    WHERE publication_id = NEW.publication_id
      AND is_card_cover = TRUE
      AND id <> NEW.id
    LIMIT 1;

    IF existing_cover_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Une publication ne peut avoir qu’un seul média d’affiche.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS publication_media_single_card_cover_trigger
    ON publication_media;

CREATE TRIGGER publication_media_single_card_cover_trigger
BEFORE INSERT OR UPDATE OF publication_id, is_card_cover
ON publication_media
FOR EACH ROW
EXECUTE FUNCTION enforce_single_publication_card_cover();


-- =========================================================
-- 3. INDEX NON UNIQUE POUR LES LECTURES
-- =========================================================

CREATE INDEX IF NOT EXISTS publication_media_card_cover_lookup_index
    ON publication_media (
        publication_id,
        is_card_cover
    );


COMMENT ON FUNCTION enforce_single_publication_card_cover() IS
    'Garantit qu’une publication ne possède pas plus d’un média marqué comme affiche, sans rendre publication_id unique pour Prisma.';

COMMIT;