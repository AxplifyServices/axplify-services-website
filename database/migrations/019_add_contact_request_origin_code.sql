BEGIN;

ALTER TABLE contact_requests
ADD COLUMN IF NOT EXISTS origin_code VARCHAR(80);

ALTER TABLE contact_requests
DROP CONSTRAINT IF EXISTS contact_requests_origin_code_format_check;

ALTER TABLE contact_requests
ADD CONSTRAINT contact_requests_origin_code_format_check
CHECK (
    origin_code IS NULL
    OR origin_code ~ '^[a-z0-9][a-z0-9-]{0,79}$'
);

CREATE INDEX IF NOT EXISTS contact_requests_origin_code_index
ON contact_requests(origin_code)
WHERE archived_at IS NULL
  AND origin_code IS NOT NULL;

COMMENT ON COLUMN contact_requests.origin_code IS
    'Frontend ou produit ayant généré la demande publique, par exemple axplify-services ou marketsoft.';

COMMIT;
