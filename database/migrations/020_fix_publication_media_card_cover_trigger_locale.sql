BEGIN;

-- =========================================================
-- CORRECTION : LA COUVERTURE DOIT ÊTRE UNIQUE PAR LANGUE,
-- PAS PAR PUBLICATION.
--
-- Le trigger créé dans 008_fix_publication_media_relation.sql
-- vérifiait l'unicité de is_card_cover sur toute la publication.
-- Cela empêchait d'avoir une couverture FR ET une couverture EN
-- en même temps, alors que la colonne locale (ajoutée dans
-- 009_add_locale_to_publication_media.sql) et le frontend
-- (ensureSingleCover) attendent explicitement une couverture
-- distincte par langue.
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
      AND locale = NEW.locale
      AND is_card_cover = TRUE
      AND id <> NEW.id
    LIMIT 1;

    IF existing_cover_id IS NOT NULL THEN
        RAISE EXCEPTION
            'Une publication ne peut avoir qu''un seul média d''affiche par langue.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;

-- Le trigger existant appelle déjà cette fonction sur
-- publication_id ET is_card_cover ; on ajoute locale pour
-- couvrir aussi le cas où seule la langue change.

DROP TRIGGER IF EXISTS publication_media_single_card_cover_trigger
    ON publication_media;

CREATE TRIGGER publication_media_single_card_cover_trigger
BEFORE INSERT OR UPDATE OF publication_id, locale, is_card_cover
ON publication_media
FOR EACH ROW
EXECUTE FUNCTION enforce_single_publication_card_cover();

COMMENT ON FUNCTION enforce_single_publication_card_cover() IS
    'Garantit qu''une publication ne possède pas plus d''un média marqué comme affiche par langue, sans rendre (publication_id, locale) unique pour Prisma.';

COMMIT;
