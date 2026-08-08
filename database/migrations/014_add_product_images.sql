BEGIN;

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    image_url TEXT NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,

    width INTEGER,
    height INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_images_product_foreign_key
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT product_images_url_not_empty_check
        CHECK (
            LENGTH(TRIM(image_url)) > 0
        ),

    CONSTRAINT product_images_sort_order_check
        CHECK (
            sort_order >= 0
        ),

    CONSTRAINT product_images_width_check
        CHECK (
            width IS NULL
            OR width > 0
        ),

    CONSTRAINT product_images_height_check
        CHECK (
            height IS NULL
            OR height > 0
        )
);

CREATE TABLE product_image_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_image_id UUID NOT NULL,

    locale VARCHAR(5) NOT NULL,

    alt_text VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_image_translations_image_foreign_key
        FOREIGN KEY (product_image_id)
        REFERENCES product_images(id)
        ON DELETE CASCADE,

    CONSTRAINT product_image_translations_locale_check
        CHECK (
            locale IN (
                'fr',
                'en',
                'ar'
            )
        ),

    CONSTRAINT product_image_translations_image_locale_unique
        UNIQUE (
            product_image_id,
            locale
        )
);

CREATE INDEX product_images_product_order_index
    ON product_images (
        product_id,
        sort_order,
        created_at
    );

CREATE INDEX product_image_translations_image_locale_index
    ON product_image_translations (
        product_image_id,
        locale
    );

/*
 * Protection au niveau DB :
 * impossible d'enregistrer plus de 5 images
 * sur un produit même si une future route
 * contourne la validation NestJS.
 */
CREATE OR REPLACE FUNCTION enforce_product_images_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO current_count
    FROM product_images
    WHERE product_id = NEW.product_id
      AND (
          TG_OP = 'INSERT'
          OR id <> NEW.id
      );

    IF current_count >= 5 THEN
        RAISE EXCEPTION
            'Un produit ne peut pas contenir plus de 5 images.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_images_limit_trigger
    ON product_images;

CREATE TRIGGER product_images_limit_trigger
BEFORE INSERT OR UPDATE OF product_id
ON product_images
FOR EACH ROW
EXECUTE FUNCTION enforce_product_images_limit();

COMMENT ON TABLE product_images IS
    'Galerie de 1 à 5 images associées aux cartes produit.';

COMMENT ON COLUMN product_images.sort_order IS
    'Détermine l ordre d affichage. La première image est l image principale de la carte.';

COMMENT ON TABLE product_image_translations IS
    'Textes alternatifs multilingues des images produit.';

COMMIT;