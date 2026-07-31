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

function BrochureContent({
  brochure,
  priority,
}: {
  brochure:
    PublicHomepageBrochure;

  priority:
    boolean;
}) {
  const desktopCrop =
    brochure.desktopImageCrop;

  const mobileCrop =
    brochure.mobileImageCrop;

  const picture = (
    <div className="home-brochure__picture">
      <img
        src={
          brochure.desktopImageUrl
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
          brochure.mobileImageUrl
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

  if (
    !brochure.linkUrl
  ) {
    return (
      <div className="home-brochure__link home-brochure__link--static">
        {
          picture
        }
      </div>
    );
  }

  return (
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
    >
      {
        picture
      }
    </a>
  );
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

  const hasSeveralBrochures =
    brochures.length >
    1;

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

  useEffect(
    () => {
      if (
        !hasSeveralBrochures ||
        isPaused
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
        window.setInterval(
          showNext,
          AUTOPLAY_DELAY,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    },
    [
      hasSeveralBrochures,
      isPaused,
      showNext,
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
        () =>
          setIsPaused(
            true,
          )
      }
      onMouseLeave={
        () =>
          setIsPaused(
            false,
          )
      }
      onFocusCapture={
        () =>
          setIsPaused(
            true,
          )
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