BEGIN;

ALTER TABLE homepage_brochures
    ADD COLUMN desktop_image_fr_crop JSONB,
    ADD COLUMN mobile_image_fr_crop JSONB,
    ADD COLUMN desktop_image_en_crop JSONB,
    ADD COLUMN mobile_image_en_crop JSONB;

ALTER TABLE homepage_brochures
    ADD CONSTRAINT homepage_brochures_desktop_image_fr_crop_object_check
        CHECK (
            desktop_image_fr_crop IS NULL
            OR jsonb_typeof(desktop_image_fr_crop) = 'object'
        ),
    ADD CONSTRAINT homepage_brochures_mobile_image_fr_crop_object_check
        CHECK (
            mobile_image_fr_crop IS NULL
            OR jsonb_typeof(mobile_image_fr_crop) = 'object'
        ),
    ADD CONSTRAINT homepage_brochures_desktop_image_en_crop_object_check
        CHECK (
            desktop_image_en_crop IS NULL
            OR jsonb_typeof(desktop_image_en_crop) = 'object'
        ),
    ADD CONSTRAINT homepage_brochures_mobile_image_en_crop_object_check
        CHECK (
            mobile_image_en_crop IS NULL
            OR jsonb_typeof(mobile_image_en_crop) = 'object'
        );

COMMIT;