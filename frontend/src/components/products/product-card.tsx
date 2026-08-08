'use client';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ImageIcon,
} from 'lucide-react';

import {
  PointerEvent,
  useState,
} from 'react';

import type {
  PublicProduct,
} from '@/lib/public-products-api';

type ProductCardProps = {
  product:
    PublicProduct;

  discoverLabel:
    string;

  compact?:
    boolean;
};

export function ProductCard({
  product,
  discoverLabel,
  compact = false,
}: ProductCardProps) {
  const [
    activeImageIndex,
    setActiveImageIndex,
  ] =
    useState(
      0,
    );

  const [
    swipeStartX,
    setSwipeStartX,
  ] =
    useState<
      number | null
    >(
      null,
    );

  const images =
    product.images.slice(
      0,
      5,
    );

  const hasImages =
    images.length >
    0;

  const hasGallery =
    images.length >
    1;

  const activeImage =
    hasImages
      ? images[
          Math.min(
            activeImageIndex,
            images.length -
              1,
          )
        ]
      : null;

  function previousImage() {
    if (
      !hasGallery
    ) {
      return;
    }

    setActiveImageIndex(
      current =>
        current ===
        0
          ? images.length -
            1
          : current -
            1,
    );
  }

  function nextImage() {
    if (
      !hasGallery
    ) {
      return;
    }

    setActiveImageIndex(
      current =>
        current ===
        images.length -
          1
          ? 0
          : current +
            1,
    );
  }

  function preventCardNavigation(
    event:
      React.SyntheticEvent,
  ) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handlePrevious(
    event:
      React.MouseEvent<HTMLButtonElement>,
  ) {
    preventCardNavigation(
      event,
    );

    previousImage();
  }

  function handleNext(
    event:
      React.MouseEvent<HTMLButtonElement>,
  ) {
    preventCardNavigation(
      event,
    );

    nextImage();
  }

  function handleIndicator(
    event:
      React.MouseEvent<HTMLButtonElement>,

    index:
      number,
  ) {
    preventCardNavigation(
      event,
    );

    setActiveImageIndex(
      index,
    );
  }

  function handlePointerDown(
    event:
      PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.pointerType ===
      'mouse'
    ) {
      return;
    }

    setSwipeStartX(
      event.clientX,
    );
  }

  function handlePointerUp(
    event:
      PointerEvent<HTMLDivElement>,
  ) {
    if (
      swipeStartX ===
      null ||
      !hasGallery
    ) {
      setSwipeStartX(
        null,
      );

      return;
    }

    const deltaX =
      event.clientX -
      swipeStartX;

    setSwipeStartX(
      null,
    );

    /*
     * Seuil volontairement assez important
     * pour ne pas déclencher un changement
     * d'image lors d'un simple tap.
     */
    if (
      Math.abs(
        deltaX,
      ) <
      45
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (
      deltaX <
      0
    ) {
      nextImage();
    } else {
      previousImage();
    }
  }

  return (
    <article
      className="product-card"
      data-compact={
        compact
          ? 'true'
          : undefined
      }
    >
      <a
        href={
          product.linkUrl
        }
        className="product-card__link"
      >
        <div
          className="product-card__media"
          onPointerDown={
            handlePointerDown
          }
          onPointerUp={
            handlePointerUp
          }
          onPointerCancel={
            () =>
              setSwipeStartX(
                null,
              )
          }
        >
          {activeImage ? (
            <img
              key={
                activeImage.id
              }
              src={
                activeImage.imageUrl
              }
              alt={
                activeImage.altText ||
                product.name
              }
              loading="lazy"
              decoding="async"
              draggable={
                false
              }
            />
          ) : (
            <div className="product-card__media-placeholder">
              <ImageIcon
                size={30}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <span>
                {product.name}
              </span>
            </div>
          )}

          <div className="product-card__media-top">
            <span className="product-card__category">
              {product.category}
            </span>

            <span className="product-card__arrow">
              <ArrowUpRight
                size={19}
                aria-hidden="true"
              />
            </span>
          </div>

          {hasGallery ? (
            <>
              <button
                type="button"
                className="product-card__gallery-arrow product-card__gallery-arrow--previous"
                aria-label="Image précédente"
                onClick={
                  handlePrevious
                }
              >
                <ArrowLeft
                  size={17}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="product-card__gallery-arrow product-card__gallery-arrow--next"
                aria-label="Image suivante"
                onClick={
                  handleNext
                }
              >
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </button>

              <div
                className="product-card__gallery-dots"
                role="group"
                aria-label="Images du produit"
                onClick={
                  event =>
                    event.preventDefault()
                }
              >
                {images.map(
                  (
                    image,
                    index,
                  ) => (
                    <button
                      key={
                        image.id
                      }
                      type="button"
                      aria-label={`Afficher l’image ${index + 1}`}
                      aria-pressed={
                        activeImageIndex ===
                        index
                      }
                      data-active={
                        activeImageIndex ===
                        index
                      }
                      onClick={
                        event =>
                          handleIndicator(
                            event,
                            index,
                          )
                      }
                    />
                  ),
                )}
              </div>

              <span className="product-card__gallery-counter">
                {activeImageIndex +
                  1}
                /
                {images.length}
              </span>
            </>
          ) : null}
        </div>

        <div className="product-card__content">
          <div className="product-card__identity">
            <span className="product-card__name">
              {product.name}
            </span>

            <h2>
              {product.title}
            </h2>
          </div>

          <p className="product-card__description">
            {product.description}
          </p>

          <div className="product-card__footer">
            <span>
              {discoverLabel}
            </span>

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </div>
        </div>
      </a>
    </article>
  );
}