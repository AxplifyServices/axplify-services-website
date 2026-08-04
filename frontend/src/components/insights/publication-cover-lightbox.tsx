'use client';

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  X,
} from 'lucide-react';

import {
  createPortal,
} from 'react-dom';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  PublicPublicationMedia,
} from '@/lib/public-publications-api';

type PublicationCoverLightboxProps = {
  media:
    PublicPublicationMedia[];

  title:
    string;

  openLabel:
    string;

  closeLabel:
    string;

  previousLabel:
    string;

  nextLabel:
    string;
};

export function PublicationCoverLightbox({
  media,
  title,
  openLabel,
  closeLabel,
  previousLabel,
  nextLabel,
}: PublicationCoverLightboxProps) {
  const [
    isMounted,
    setIsMounted,
  ] =
    useState(
      false,
    );

  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(
      0,
    );

  const [
    lightboxIndex,
    setLightboxIndex,
  ] =
    useState<number | null>(
      null,
    );

  const [
    isVideoPlaying,
    setIsVideoPlaying,
  ] =
    useState(
      false,
    );

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const activeMedia =
    media[
      activeIndex
    ];

  const lightboxMedia =
    lightboxIndex !==
    null
      ? media[
          lightboxIndex
        ]
      : null;

  const hasMultipleMedia =
    media.length >
    1;

  useEffect(
    () => {
      setIsMounted(
        true,
      );
    },
    [],
  );

  useEffect(
    () => {
      if (
        lightboxIndex ===
        null
      ) {
        return;
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape'
        ) {
          setLightboxIndex(
            null,
          );

          return;
        }

        if (
          event.key ===
          'ArrowLeft'
        ) {
          setLightboxIndex(
            current =>
              current ===
              null
                ? null
                : (
                    current -
                    1 +
                    media.length
                  ) %
                  media.length,
          );
        }

        if (
          event.key ===
          'ArrowRight'
        ) {
          setLightboxIndex(
            current =>
              current ===
              null
                ? null
                : (
                    current +
                    1
                  ) %
                  media.length,
          );
        }
      }

      document.body.classList.add(
        'publication-lightbox-open',
      );

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        document.body.classList.remove(
          'publication-lightbox-open',
        );

        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      lightboxIndex,
      media.length,
    ],
  );

  useEffect(
    () => {
      setIsVideoPlaying(
        false,
      );
    },
    [
      activeIndex,
    ],
  );

  if (
    !activeMedia
  ) {
    return null;
  }

  function showPrevious() {
    setActiveIndex(
      current =>
        (
          current -
          1 +
          media.length
        ) %
        media.length,
    );
  }

  function showNext() {
    setActiveIndex(
      current =>
        (
          current +
          1
        ) %
        media.length,
    );
  }

  function showPreviousLightbox() {
    setLightboxIndex(
      current =>
        current ===
        null
          ? null
          : (
              current -
              1 +
              media.length
            ) %
            media.length,
    );
  }

  function showNextLightbox() {
    setLightboxIndex(
      current =>
        current ===
        null
          ? null
          : (
              current +
              1
            ) %
            media.length,
    );
  }

  async function toggleVideo() {
    const video =
      videoRef.current;

    if (
      !video
    ) {
      return;
    }

    if (
      video.paused
    ) {
      await video.play();

      setIsVideoPlaying(
        true,
      );

      return;
    }

    video.pause();

    setIsVideoPlaying(
      false,
    );
  }

  const lightbox =
    isMounted &&
    lightboxIndex !==
      null &&
    lightboxMedia
      ? createPortal(
          <div
            className="publication-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={
              lightboxMedia.altText ||
              title
            }
            onMouseDown={
              event => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setLightboxIndex(
                    null,
                  );
                }
              }
            }
          >
            <button
              type="button"
              className="publication-lightbox__close"
              aria-label={
                closeLabel
              }
              title={
                closeLabel
              }
              onClick={
                () =>
                  setLightboxIndex(
                    null,
                  )
              }
            >
              <X
                size={
                  24
                }
                aria-hidden="true"
              />
            </button>

            {
              hasMultipleMedia
                ? (
                    <button
                      type="button"
                      className="publication-lightbox__navigation publication-lightbox__navigation--previous"
                      aria-label={
                        previousLabel
                      }
                      title={
                        previousLabel
                      }
                      onClick={
                        showPreviousLightbox
                      }
                    >
                      <ChevronLeft
                        size={
                          28
                        }
                        aria-hidden="true"
                      />
                    </button>
                  )
                : null
            }

            <div className="publication-lightbox__content">
              {
                lightboxMedia.mediaType ===
                'VIDEO'
                  ? (
                      <video
                        key={
                          lightboxMedia.id
                        }
                        src={
                          lightboxMedia.mediaUrl
                        }
                        poster={
                          lightboxMedia.posterUrl ??
                          undefined
                        }
                        controls
                        autoPlay
                      />
                    )
                  : (
                      <img
                        src={
                          lightboxMedia.mediaUrl
                        }
                        alt={
                          lightboxMedia.altText ||
                          title
                        }
                      />
                    )
              }

              {
                lightboxMedia.caption
                  ? (
                      <p className="publication-lightbox__caption">
                        {
                          lightboxMedia.caption
                        }
                      </p>
                    )
                  : null
              }
            </div>

            {
              hasMultipleMedia
                ? (
                    <button
                      type="button"
                      className="publication-lightbox__navigation publication-lightbox__navigation--next"
                      aria-label={
                        nextLabel
                      }
                      title={
                        nextLabel
                      }
                      onClick={
                        showNextLightbox
                      }
                    >
                      <ChevronRight
                        size={
                          28
                        }
                        aria-hidden="true"
                      />
                    </button>
                  )
                : null
            }

            <span className="publication-lightbox__counter">
              {
                lightboxIndex +
                1
              }
              /
              {
                media.length
              }
            </span>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="publication-gallery">
        <div className="publication-gallery__main">
          {
            activeMedia.mediaType ===
            'VIDEO'
              ? (
                  <div className="publication-gallery__video">
                    <video
                      ref={
                        videoRef
                      }
                      key={
                        activeMedia.id
                      }
                      src={
                        activeMedia.mediaUrl
                      }
                      poster={
                        activeMedia.posterUrl ??
                        undefined
                      }
                      preload="metadata"
                      onPlay={
                        () =>
                          setIsVideoPlaying(
                            true,
                          )
                      }
                      onPause={
                        () =>
                          setIsVideoPlaying(
                            false,
                          )
                      }
                      onEnded={
                        () =>
                          setIsVideoPlaying(
                            false,
                          )
                      }
                    />

                    <button
                      type="button"
                      className="publication-gallery__video-toggle"
                      aria-label={
                        isVideoPlaying
                          ? 'Pause'
                          : 'Lecture'
                      }
                      onClick={
                        () =>
                          void toggleVideo()
                      }
                    >
                      {
                        isVideoPlaying
                          ? (
                              <Pause
                                size={
                                  22
                                }
                                aria-hidden="true"
                              />
                            )
                          : (
                              <Play
                                size={
                                  22
                                }
                                aria-hidden="true"
                              />
                            )
                      }
                    </button>

                    <button
                      type="button"
                      className="publication-gallery__expand"
                      aria-label={
                        openLabel
                      }
                      title={
                        openLabel
                      }
                      onClick={
                        () =>
                          setLightboxIndex(
                            activeIndex,
                          )
                      }
                    >
                      <Maximize2
                        size={
                          18
                        }
                        aria-hidden="true"
                      />

                      <span>
                        {openLabel}
                      </span>
                    </button>
                  </div>
                )
              : (
                  <div
                    className="publication-gallery__image"
                    role="button"
                    tabIndex={
                      0
                    }
                    aria-label={
                      openLabel
                    }
                    onClick={
                      () =>
                        setLightboxIndex(
                          activeIndex,
                        )
                    }
                    onKeyDown={
                      event => {
                        if (
                          event.key ===
                            'Enter' ||
                          event.key ===
                            ' '
                        ) {
                          event.preventDefault();

                          setLightboxIndex(
                            activeIndex,
                          );
                        }
                      }
                    }
                  >
                    <img
                      src={
                        activeMedia.mediaUrl
                      }
                      alt={
                        activeMedia.altText ||
                        title
                      }
                    />

                    <button
                      type="button"
                      className="publication-gallery__expand"
                      aria-label={
                        openLabel
                      }
                      title={
                        openLabel
                      }
                      onClick={
                        event => {
                          event.stopPropagation();

                          setLightboxIndex(
                            activeIndex,
                          );
                        }
                      }
                    >
                      <Maximize2
                        size={
                          18
                        }
                        aria-hidden="true"
                      />

                      <span>
                        {openLabel}
                      </span>
                    </button>
                  </div>
                )
          }

          {
            hasMultipleMedia
              ? (
                  <>
                    <button
                      type="button"
                      className="publication-gallery__navigation publication-gallery__navigation--previous"
                      aria-label={
                        previousLabel
                      }
                      onClick={
                        showPrevious
                      }
                    >
                      <ChevronLeft
                        size={
                          22
                        }
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      className="publication-gallery__navigation publication-gallery__navigation--next"
                      aria-label={
                        nextLabel
                      }
                      onClick={
                        showNext
                      }
                    >
                      <ChevronRight
                        size={
                          22
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </>
                )
              : null
          }
        </div>

        {
          activeMedia.caption
            ? (
                <p className="publication-gallery__caption">
                  {
                    activeMedia.caption
                  }
                </p>
              )
            : null
        }

        {
          hasMultipleMedia
            ? (
                <div className="publication-gallery__thumbnails">
                  {
                    media.map(
                      (
                        item,
                        index,
                      ) => (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          className="publication-gallery__thumbnail"
                          data-active={
                            index ===
                            activeIndex
                          }
                          aria-label={
                            `${index + 1} / ${media.length}`
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
                        >
                          <img
                            src={
                              item.mediaType ===
                                'VIDEO'
                                ? item.posterUrl ??
                                  item.cardImageUrl
                                : item.mediaUrl
                            }
                            alt=""
                          />

                          {
                            item.mediaType ===
                              'VIDEO'
                              ? (
                                  <span className="publication-gallery__thumbnail-video">
                                    <Play
                                      size={
                                        14
                                      }
                                      aria-hidden="true"
                                    />
                                  </span>
                                )
                              : null
                          }
                        </button>
                      ),
                    )
                  }
                </div>
              )
            : null
        }
      </div>

      {lightbox}
    </>
  );
}