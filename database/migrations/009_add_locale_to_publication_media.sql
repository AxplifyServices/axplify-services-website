BEGIN;

ALTER TABLE publication_media
ADD COLUMN locale VARCHAR(5);

UPDATE publication_media
SET locale = 'fr'
WHERE locale IS NULL;

ALTER TABLE publication_media
ALTER COLUMN locale SET NOT NULL;

ALTER TABLE publication_media
ALTER COLUMN locale SET DEFAULT 'fr';

ALTER TABLE publication_media
ADD CONSTRAINT publication_media_locale_check
CHECK (locale IN ('fr', 'en'));

CREATE INDEX publication_media_publication_locale_index
ON publication_media (
  publication_id,
  locale,
  sort_order,
  created_at
);

CREATE INDEX publication_media_cover_locale_lookup_index
ON publication_media (
  publication_id,
  locale,
  is_card_cover
);

COMMIT;