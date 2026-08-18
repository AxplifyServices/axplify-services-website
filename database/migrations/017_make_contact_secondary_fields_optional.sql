BEGIN;

ALTER TABLE contact_requests
    DROP CONSTRAINT IF EXISTS contact_requests_first_name_not_blank,
    DROP CONSTRAINT IF EXISTS contact_requests_last_name_not_blank,
    DROP CONSTRAINT IF EXISTS contact_requests_job_title_not_blank,
    DROP CONSTRAINT IF EXISTS contact_requests_need_description_not_blank;

COMMIT;