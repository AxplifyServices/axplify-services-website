'use client';

import {
  Check,
  Minus,
  Move,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';

import {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type BrochureImageCrop = {
  offsetX:
    number;

  offsetY:
    number;

  zoom:
    number;

  naturalWidth:
    number;

  naturalHeight:
    number;
};

type BrochureImageCropModalProps = {
  isOpen:
    boolean;

  imageUrl:
    string;

  imageLabel:
    string;

  format:
    'desktop' |
    'mobile';

  initialCrop:
    BrochureImageCrop;

  onCancel:
    () => void;

  onValidate: (
    crop:
      BrochureImageCrop,
  ) => void;
};

const MIN_ZOOM =
  1 / 3;

const MAX_ZOOM =
  3;

const MIN_SLIDER_VALUE =
  -200;

const MAX_SLIDER_VALUE =
  200;

function clamp(
  value:
    number,

  minimum:
    number,

  maximum:
    number,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

function sliderValueToZoom(
  sliderValue:
    number,
) {
  if (
    sliderValue <
    0
  ) {
    return 1 /
      (
        1 +
        Math.abs(
          sliderValue,
        ) /
          100
      );
  }

  return 1 +
    sliderValue /
      100;
}

function zoomToSliderValue(
  zoom:
    number,
) {
  if (
    zoom <
    1
  ) {
    return -(
      (
        1 /
          zoom -
        1
      ) *
      100
    );
  }

  return (
    zoom -
    1
  ) *
    100;
}

export function BrochureImageCropModal({
  isOpen,
  imageUrl,
  imageLabel,
  format,
  initialCrop,
  onCancel,
  onValidate,
}: BrochureImageCropModalProps) {
  const frameRef =
    useRef<
      HTMLDivElement | null
    >(
      null,
    );

  const dragStateRef =
    useRef<{
      pointerId:
        number;

      startClientX:
        number;

      startClientY:
        number;

      startOffsetX:
        number;

      startOffsetY:
        number;
    } | null>(
      null,
    );

  const [
    crop,
    setCrop,
  ] =
    useState<
      BrochureImageCrop
    >(
      initialCrop,
    );

  const sliderValue =
    useMemo(
      () =>
        Math.round(
          zoomToSliderValue(
            crop.zoom,
          ),
        ),
      [
        crop.zoom,
      ],
    );

  useEffect(
    () => {
      if (
        !isOpen
      ) {
        return;
      }

      setCrop(
        initialCrop,
      );
    },
    [
      initialCrop,
      isOpen,
    ],
  );

  useEffect(
    () => {
      if (
        !isOpen
      ) {
        return;
      }

      const previousOverflow =
        document.body
          .style
          .overflow;

      document.body
        .style
        .overflow =
        'hidden';

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          onCancel();
        }
      }

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body
          .style
          .overflow =
          previousOverflow;

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      isOpen,
      onCancel,
    ],
  );

  function updateZoom(
    nextZoom:
      number,
  ) {
    setCrop(
      currentCrop => ({
        ...currentCrop,

        zoom:
          clamp(
            nextZoom,
            MIN_ZOOM,
            MAX_ZOOM,
          ),
      }),
    );
  }

  function handlePointerDown(
    event:
      ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      event.button !==
        0 &&
      event.pointerType ===
        'mouse'
    ) {
      return;
    }

    const frame =
      frameRef.current;

    if (
      !frame
    ) {
      return;
    }

    dragStateRef.current = {
      pointerId:
        event.pointerId,

      startClientX:
        event.clientX,

      startClientY:
        event.clientY,

      startOffsetX:
        crop.offsetX,

      startOffsetY:
        crop.offsetY,
    };

    frame.setPointerCapture(
      event.pointerId,
    );

    event.preventDefault();
  }

  function handlePointerMove(
    event:
      ReactPointerEvent<HTMLDivElement>,
  ) {
    const dragState =
      dragStateRef.current;

    const frame =
      frameRef.current;

    if (
      !dragState ||
      !frame ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    const bounds =
      frame.getBoundingClientRect();

    if (
      bounds.width <=
        0 ||
      bounds.height <=
        0
    ) {
      return;
    }

    const horizontalDelta =
      (
        event.clientX -
        dragState.startClientX
      ) /
      bounds.width;

    const verticalDelta =
      (
        event.clientY -
        dragState.startClientY
      ) /
      bounds.height;

    setCrop(
      currentCrop => ({
        ...currentCrop,

        offsetX:
          clamp(
            dragState.startOffsetX +
              horizontalDelta,
            -3,
            3,
          ),

        offsetY:
          clamp(
            dragState.startOffsetY +
              verticalDelta,
            -3,
            3,
          ),
      }),
    );
  }

  function endPointerDrag(
    event:
      ReactPointerEvent<HTMLDivElement>,
  ) {
    const frame =
      frameRef.current;

    const dragState =
      dragStateRef.current;

    if (
      !frame ||
      !dragState ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    if (
      frame.hasPointerCapture(
        event.pointerId,
      )
    ) {
      frame.releasePointerCapture(
        event.pointerId,
      );
    }

    dragStateRef.current =
      null;
  }

  function handleWheel(
    event:
      ReactWheelEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const zoomStep =
      event.deltaY >
      0
        ? -0.08
        : 0.08;

    updateZoom(
      crop.zoom +
        zoomStep,
    );
  }

  if (
    !isOpen
  ) {
    return null;
  }

  return (
    <div
      className="admin-brochure-crop-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brochure-crop-title"
      onMouseDown={
        event => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onCancel();
          }
        }
      }
    >
      <div className="admin-brochure-crop-modal__panel">
        <header className="admin-brochure-crop-modal__header">
          <div>
            <span className="admin-brochure-crop-modal__eyebrow">
              Cadrage de l’image
            </span>

            <h2 id="brochure-crop-title">
              {
                imageLabel
              }
            </h2>

            <p>
              Déplace l’image dans le cadre. Seule la partie visible à l’intérieur du cadre apparaîtra sur le site.
            </p>
          </div>

          <button
            type="button"
            className="admin-brochure-crop-modal__close"
            aria-label="Fermer la fenêtre de cadrage"
            onClick={
              onCancel
            }
          >
            <X
              size={
                21
              }
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="admin-brochure-crop-modal__content">
          <div className="admin-brochure-crop-modal__workspace">
            <div
              ref={
                frameRef
              }
              className="admin-brochure-crop-modal__frame"
              data-format={
                format
              }
              onPointerDown={
                handlePointerDown
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={
                endPointerDrag
              }
              onPointerCancel={
                endPointerDrag
              }
              onWheel={
                handleWheel
              }
            >
              <img
                src={
                  imageUrl
                }
                alt=""
                draggable={
                  false
                }
                style={{
                  transform:
                    `translate(${crop.offsetX * 100}%, ${crop.offsetY * 100}%) scale(${crop.zoom})`,
                }}
              />

              <div
                className="admin-brochure-crop-modal__grid"
                aria-hidden="true"
              />

              <div className="admin-brochure-crop-modal__move-hint">
                <Move
                  size={
                    16
                  }
                  aria-hidden="true"
                />

                Glisser pour déplacer
              </div>
            </div>

            <p className="admin-brochure-crop-modal__frame-note">
              {
                format ===
                'desktop'
                  ? 'Aperçu exact de la zone desktop — ratio 1920 × 900.'
                  : 'Aperçu exact de la zone mobile — ratio 1080 × 1600.'
              }
            </p>
          </div>

          <aside className="admin-brochure-crop-modal__controls">
            <div className="admin-brochure-crop-modal__control-heading">
              <span>
                Zoom
              </span>

              <strong>
                {
                  sliderValue >
                  0
                    ? '+'
                    : ''
                }
                {
                  sliderValue
                }
                %
              </strong>
            </div>

            <div className="admin-brochure-crop-modal__zoom-row">
              <button
                type="button"
                aria-label="Dézoomer"
                onClick={
                  () =>
                    updateZoom(
                      crop.zoom -
                        0.1,
                    )
                }
              >
                <Minus
                  size={
                    17
                  }
                  aria-hidden="true"
                />
              </button>

              <input
                type="range"
                min={
                  MIN_SLIDER_VALUE
                }
                max={
                  MAX_SLIDER_VALUE
                }
                step="1"
                value={
                  sliderValue
                }
                aria-label="Niveau de zoom"
                onChange={
                  event =>
                    updateZoom(
                      sliderValueToZoom(
                        Number(
                          event.target
                            .value,
                        ),
                      ),
                    )
                }
              />

              <button
                type="button"
                aria-label="Zoomer"
                onClick={
                  () =>
                    updateZoom(
                      crop.zoom +
                        0.1,
                    )
                }
              >
                <Plus
                  size={
                    17
                  }
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="admin-brochure-crop-modal__zoom-scale">
              <span>
                -200 %
              </span>

              <span>
                0 %
              </span>

              <span>
                +200 %
              </span>
            </div>

            <button
              type="button"
              className="admin-brochure-crop-modal__reset"
              onClick={
                () =>
                  setCrop({
                    ...crop,

                    offsetX:
                      0,

                    offsetY:
                      0,

                    zoom:
                      1,
                  })
              }
            >
              <RotateCcw
                size={
                  17
                }
                aria-hidden="true"
              />

              Réinitialiser le cadrage
            </button>

            <div className="admin-brochure-crop-modal__help">
              <strong>
                Utilisation
              </strong>

              <p>
                Sur ordinateur, déplace l’image avec la souris et utilise la molette pour ajuster le zoom.
              </p>

              <p>
                Sur téléphone ou tablette, fais glisser l’image avec le doigt puis utilise le curseur de zoom.
              </p>
            </div>
          </aside>
        </div>

        <footer className="admin-brochure-crop-modal__footer">
          <button
            type="button"
            className="admin-brochure-crop-modal__cancel"
            onClick={
              onCancel
            }
          >
            Annuler
          </button>

          <button
            type="button"
            className="admin-brochure-crop-modal__validate"
            onClick={
              () =>
                onValidate(
                  crop,
                )
            }
          >
            <Check
              size={
                18
              }
              aria-hidden="true"
            />

            Valider le cadrage
          </button>
        </footer>
      </div>
    </div>
  );
}