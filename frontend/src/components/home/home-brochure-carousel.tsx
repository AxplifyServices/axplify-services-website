'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  PublicHomepageBrochure,
} from '@/lib/homepage-brochures-api';

const AUTOPLAY_DELAY =
  6500;

const VIDEO_ERROR_FALLBACK_DELAY =
  5000;

const SWIPE_THRESHOLD =
  45;

type HomeBrochureCarouselProps = {
  brochures:
    PublicHomepageBrochure[];

  previousLabel:
    string;

  nextLabel:
    string;

  goToSlideLabel:
    string;
};

type BrochureContentProps = {
  brochure:
    PublicHomepageBrochure;

  priority:
    boolean;

  isActive:
    boolean;

  videoRef: (
    element:
      HTMLVideoElement | null,
  ) => void;

  onVideoEnded:
    () => void;

  onVideoError:
    () => void;
};

function BrochureContent({
  brochure,
  priority,
  isActive,
  videoRef,
  onVideoEnded,
  onVideoError,
}: BrochureContentProps) {
  const desktopCrop =
    brochure.desktopImageCrop;

  const mobileCrop =
    brochure.mobileImageCrop;

  const desktopMediaUrl =
    brochure
      .desktopMediaUrl
      .trim();

  const mobileMediaUrl =
    brochure
      .mobileMediaUrl
      .trim() ||
    desktopMediaUrl;    

  const media =
    brochure.mediaType ===
    'VIDEO'
      ? (
          <div className="home-brochure__picture">
            <video
              ref={
                videoRef
              }
              className="home-brochure__video"
              muted
              playsInline
              preload={
                priority
                  ? 'auto'
                  : 'metadata'
              }
              aria-label={
                brochure.altText
              }
              onEnded={
                onVideoEnded
              }
              onError={
                onVideoError
              }
            >
              <source
                src={
                  mobileMediaUrl
                }
                media="(max-width: 767px)"
              />

              <source
                src={
                  desktopMediaUrl
                }
                media="(min-width: 768px)"
              />

              <source
                src={
                  desktopMediaUrl
                }
              />
            </video>
          </div>
        )
      : (
          <div className="home-brochure__picture">
            <img
              src={
                desktopMediaUrl
              }
              alt={
                brochure.altText
              }
              className="home-brochure__image home-brochure__image--desktop"
              draggable={
                false
              }
              loading={
                priority
                  ? 'eager'
                  : 'lazy'
              }
              fetchPriority={
                priority
                  ? 'high'
                  : 'auto'
              }
              decoding="async"
              style={{
                transform:
                  desktopCrop
                    ? `translate(${desktopCrop.offsetX * 100}%, ${desktopCrop.offsetY * 100}%) scale(${desktopCrop.zoom})`
                    : undefined,
              }}
            />

            <img
              src={
                mobileMediaUrl
              }
              alt=""
              aria-hidden="true"
              className="home-brochure__image home-brochure__image--mobile"
              draggable={
                false
              }
              loading={
                priority
                  ? 'eager'
                  : 'lazy'
              }
              fetchPriority={
                priority
                  ? 'high'
                  : 'auto'
              }
              decoding="async"
              style={{
                transform:
                  mobileCrop
                    ? `translate(${mobileCrop.offsetX * 100}%, ${mobileCrop.offsetY * 100}%) scale(${mobileCrop.zoom})`
                    : undefined,
              }}
            />
          </div>
        );

  const content =
    brochure.linkUrl
      ? (
          <a
            href={
              brochure.linkUrl
            }
            target={
              brochure.linkTarget
            }
            rel={
              brochure.linkTarget ===
              '_blank'
                ? 'noopener noreferrer'
                : undefined
            }
            className="home-brochure__link"
            aria-label={
              brochure.altText
            }
            tabIndex={
              isActive
                ? 0
                : -1
            }
          >
            {
              media
            }
          </a>
        )
      : (
          <div className="home-brochure__link home-brochure__link--static">
            {
              media
            }
          </div>
        );

  return content;
}

export function HomeBrochureCarousel({
  brochures,
  previousLabel,
  nextLabel,
  goToSlideLabel,
}: HomeBrochureCarouselProps) {
  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(
      0,
    );

  const [
    isPaused,
    setIsPaused,
  ] =
    useState(
      false,
    );

  const touchStartXRef =
    useRef<
      number | null
    >(
      null,
    );

  const videoElementsRef =
    useRef<
      Array<
        HTMLVideoElement | null
      >
    >(
      [],
    );

  const videoErrorTimerRef =
    useRef<
      number | null
    >(
      null,
    );

  const hasSeveralBrochures =
    brochures.length >
    1;

  const activeBrochure =
    brochures[
      activeIndex
    ];

  const showPrevious =
    useCallback(
      () => {
        setActiveIndex(
          currentIndex =>
            currentIndex ===
            0
              ? brochures.length -
                1
              : currentIndex -
                1,
        );
      },
      [
        brochures.length,
      ],
    );

  const showNext =
    useCallback(
      () => {
        setActiveIndex(
          currentIndex =>
            currentIndex ===
            brochures.length -
              1
              ? 0
              : currentIndex +
                1,
        );
      },
      [
        brochures.length,
      ],
    );

  /*
   * Le timer classique ne concerne que les images.
   *
   * Une vidéo contrôle elle-même le passage à la slide
   * suivante grâce à l’événement `ended`.
   */
  useEffect(
    () => {
      if (
        !hasSeveralBrochures ||
        isPaused ||
        !activeBrochure ||
        activeBrochure.mediaType ===
        'VIDEO'
      ) {
        return;
      }

      const mediaQuery =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        );

      if (
        mediaQuery.matches
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          showNext,
          AUTOPLAY_DELAY,
        );

      return () => {
        window.clearTimeout(
          timer,
        );
      };
    },
    [
      activeBrochure,
      hasSeveralBrochures,
      isPaused,
      showNext,
    ],
  );

  /*
   * À chaque changement de slide :
   *
   * - toutes les vidéos non actives sont arrêtées ;
   * - leur lecture est remise au début ;
   * - la vidéo active démarre automatiquement.
   */
  useEffect(
    () => {
      videoElementsRef
        .current
        .forEach(
          (
            video,
            index,
          ) => {
            if (
              !video
            ) {
              return;
            }

            if (
              index !==
              activeIndex
            ) {
              video.pause();

              try {
                video.currentTime =
                  0;
              } catch {
                // La vidéo peut ne pas encore avoir chargé ses métadonnées.
              }

              return;
            }

            const brochure =
              brochures[
                index
              ];

            if (
              brochure?.mediaType !==
              'VIDEO'
            ) {
              return;
            }

            try {
              video.currentTime =
                0;
            } catch {
              // Les métadonnées seront chargées juste après.
            }

            void video
              .play()
              .catch(
                () => {
                  /*
                   * Certains navigateurs peuvent refuser l’autoplay,
                   * même si la vidéo est muette. Le fallback d’erreur
                   * empêchera alors le carrousel de rester bloqué.
                   */
                },
              );
          },
        );
    },
    [
      activeIndex,
      brochures,
    ],
  );

  useEffect(
    () => {
      if (
        activeIndex >=
        brochures.length
      ) {
        setActiveIndex(
          0,
        );
      }
    },
    [
      activeIndex,
      brochures.length,
    ],
  );

  useEffect(
    () => {
      return () => {
        if (
          videoErrorTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            videoErrorTimerRef.current,
          );
        }
      };
    },
    [],
  );

  const handleVideoEnded =
    useCallback(
      (
        index:
          number,
      ) => {
        /*
         * On ignore l’événement d’une ancienne vidéo qui
         * ne serait plus la slide visible.
         */
        if (
          index !==
          activeIndex
        ) {
          return;
        }

        if (
          hasSeveralBrochures
        ) {
          showNext();

          return;
        }

        /*
         * Lorsqu’il n’existe qu’une seule brochure vidéo,
         * elle recommence depuis le début.
         */
        const video =
          videoElementsRef
            .current[
              index
            ];

        if (
          video
        ) {
          video.currentTime =
            0;

          void video.play();
        }
      },
      [
        activeIndex,
        hasSeveralBrochures,
        showNext,
      ],
    );

  const handleVideoError =
    useCallback(
      (
        index:
          number,
      ) => {
        if (
          index !==
          activeIndex ||
        !hasSeveralBrochures
      ) {
        return;
      }

      if (
        videoErrorTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          videoErrorTimerRef.current,
        );
      }

      videoErrorTimerRef.current =
        window.setTimeout(
          () => {
            showNext();

            videoErrorTimerRef.current =
              null;
          },
          VIDEO_ERROR_FALLBACK_DELAY,
        );
      },
      [
        activeIndex,
        hasSeveralBrochures,
        showNext,
      ],
    );

  if (
    !brochures.length
  ) {
    return null;
  }

  return (
    <section
      className="home-brochure"
      aria-roledescription="carousel"
      onMouseEnter={
        () => {
          /*
           * Le survol suspend seulement le timer des images.
           * Une vidéo continue sa lecture jusqu’à sa fin.
           */
          if (
            activeBrochure
              ?.mediaType ===
            'IMAGE'
          ) {
            setIsPaused(
              true,
            );
          }
        }
      }
      onMouseLeave={
        () =>
          setIsPaused(
            false,
          )
      }
      onFocusCapture={
        () => {
          if (
            activeBrochure
              ?.mediaType ===
            'IMAGE'
          ) {
            setIsPaused(
              true,
            );
          }
        }
      }
      onBlurCapture={
        () =>
          setIsPaused(
            false,
          )
      }
      onTouchStart={
        event => {
          touchStartXRef.current =
            event
              .touches[
                0
              ]
              ?.clientX ??
            null;
        }
      }
      onTouchEnd={
        event => {
          if (
            touchStartXRef.current ===
            null
          ) {
            return;
          }

          const touchEndX =
            event
              .changedTouches[
                0
              ]
              ?.clientX ??
            touchStartXRef.current;

          const distance =
            touchEndX -
            touchStartXRef.current;

          touchStartXRef.current =
            null;

          if (
            Math.abs(
              distance,
            ) <
            SWIPE_THRESHOLD
          ) {
            return;
          }

          if (
            distance >
            0
          ) {
            showPrevious();
          } else {
            showNext();
          }
        }
      }
    >
      <div className="home-brochure__viewport">
        {
          brochures.map(
            (
              brochure,
              index,
            ) => (
              <article
                key={
                  brochure.id
                }
                className="home-brochure__slide"
                data-active={
                  index ===
                  activeIndex
                }
                aria-hidden={
                  index !==
                  activeIndex
                }
              >
                <BrochureContent
                  brochure={
                    brochure
                  }
                  priority={
                    index ===
                    0
                  }
                  isActive={
                    index ===
                    activeIndex
                  }
                  videoRef={
                    element => {
                      videoElementsRef
                        .current[
                          index
                        ] =
                        element;
                    }
                  }
                  onVideoEnded={
                    () =>
                      handleVideoEnded(
                        index,
                      )
                  }
                  onVideoError={
                    () =>
                      handleVideoError(
                        index,
                      )
                  }
                />
              </article>
            ),
          )
        }
      </div>

      {
        hasSeveralBrochures
          ? (
              <>
                <button
                  type="button"
                  className="home-brochure__arrow home-brochure__arrow--previous"
                  aria-label={
                    previousLabel
                  }
                  onClick={
                    showPrevious
                  }
                >
                  <ChevronLeft
                    size={
                      24
                    }
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  className="home-brochure__arrow home-brochure__arrow--next"
                  aria-label={
                    nextLabel
                  }
                  onClick={
                    showNext
                  }
                >
                  <ChevronRight
                    size={
                      24
                    }
                    aria-hidden="true"
                  />
                </button>

                <div className="home-brochure__dots">
                  {
                    brochures.map(
                      (
                        brochure,
                        index,
                      ) => (
                        <button
                          key={
                            brochure.id
                          }
                          type="button"
                          className="home-brochure__dot"
                          data-active={
                            index ===
                            activeIndex
                          }
                          aria-label={
                            `${goToSlideLabel} ${index + 1}`
                          }
                          aria-current={
                            index ===
                            activeIndex
                              ? 'true'
                              : undefined
                          }
                          onClick={
                            () =>
                              setActiveIndex(
                                index,
                              )
                          }
                        />
                      ),
                    )
                  }
                </div>
              </>
            )
          : null
      }
    </section>
  );
}