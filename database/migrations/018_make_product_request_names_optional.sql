BEGIN;

-- =========================================================
-- PRODUCT REQUESTS — CHAMPS OBLIGATOIRES
-- =========================================================
--
-- Nouveau besoin métier :
-- - obligatoires pour toute nouvelle demande publique :
--     * entreprise
--     * e-mail
--     * téléphone
-- - facultatifs :
--     * prénom
--     * nom
--     * message utilisateur
--
-- Le message technique de demande reste toujours généré
-- côté frontend afin de conserver request_message NOT NULL.
--
-- company_name et phone_number restent nullable au niveau
-- SQL pour ne pas casser d'anciennes demandes déjà stockées.
-- Leur caractère obligatoire est garanti par le DTO NestJS
-- pour toutes les nouvelles demandes publiques.
-- =========================================================

ALTER TABLE product_requests
ALTER COLUMN first_name DROP NOT NULL;

ALTER TABLE product_requests
ALTER COLUMN last_name DROP NOT NULL;

ALTER TABLE product_requests
DROP CONSTRAINT IF EXISTS product_requests_first_name_not_blank_check;

ALTER TABLE product_requests
DROP CONSTRAINT IF EXISTS product_requests_last_name_not_blank_check;

COMMIT;
