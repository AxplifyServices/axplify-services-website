'use client';

import {
  ArrowDown,
  ArrowUp,
  Check,
  FileImage,
  Film,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  useRef,
  useState,
} from 'react';

import type {
  ChangeEvent,
} from 'react';

import {
  toast,
} from 'sonner';

import {
  AdminApiError,
} from '@/lib/admin-api';

export type PublicationMediaType =
  | 'IMAGE'
  | 'VIDEO';

export type PublicationMediaTranslation = {
  locale:
    'fr' |
    'en';

  altText:
    string;

  caption:
    string;
};

export type PublicationMediaItem = {
  id:
    string;

  locale:
    'fr' |
    'en';

  mediaType:
    PublicationMediaType;

  mediaUrl:
    string;

  posterUrl:
    string | null;

  posterFrameSeconds:
    number | null;

  isCardCover:
    boolean;

  sortOrder:
    number;

  width:
    number | null;

  height:
    number | null;

  durationSeconds:
    number | null;

  translations:
    PublicationMediaTranslation[];

  isNew?:
    boolean;
};

type UploadedPublicationImage = {
  url:
    string;

  objectName:
    string;

  mimeType:
    'image/webp';

  extension:
    'webp';

  width:
    number;

  height:
    number;

  size:
    number;
};

type UploadedPublicationVideo = {
  url:
    string;

  objectName:
    string;

  mimeType:
    'video/mp4' |
    'video/webm';

  extension:
    'mp4' |
    'webm';

  width:
    null;

  height:
    null;

  size:
    number;

  durationSeconds:
    number | null;

  posterUrl:
    string;

  posterObjectName:
    string;

  posterFrameSeconds:
    number;
};

type PublicationMediaManagerProps = {
  media:
    PublicationMediaItem[];

  activeLocale:
    'fr' |
    'en';

  disabled?:
    boolean;

  authorizedFetch: <T>(
    endpoint:
      string,

    options?:
      RequestInit,
  ) => Promise<T>;

  onChange: (
    media:
      PublicationMediaItem[],
  ) => void;
};

const MAX_MEDIA_COUNT =
  5;

const MAX_IMAGE_SIZE =
  10 *
  1024 *
  1024;

const MAX_VIDEO_SIZE =
  100 *
  1024 *
  1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ]);

const ALLOWED_VIDEO_TYPES =
  new Set([
    'video/mp4',
    'video/webm',
  ]);

const PUBLICATION_MEDIA_LOCALES =
  [
    'fr',
    'en',
  ] as const;

function getErrorMessage(
  error:
    unknown,
) {
  if (
    error instanceof
    AdminApiError
  ) {
    return error.message;
  }

  if (
    error instanceof
    Error
  ) {
    return error.message;
  }

  return 'Une erreur est survenue pendant l’import.';
}

function createLocalId() {
  return (
    globalThis.crypto
      ?.randomUUID?.() ??
    `media-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  );
}

function normalizeMediaOrder(
  items:
    PublicationMediaItem[],
) {
  return PUBLICATION_MEDIA_LOCALES.flatMap(
    locale =>
      items
        .filter(
          item =>
            item.locale ===
            locale,
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.sortOrder -
            second.sortOrder,
        )
        .map(
          (
            item,
            index,
          ) => ({
            ...item,

            sortOrder:
              index,
          }),
        ),
  );
}

function ensureSingleCover(
  items:
    PublicationMediaItem[],
) {
  return PUBLICATION_MEDIA_LOCALES.flatMap(
    locale => {
      const localeItems =
        items.filter(
          item =>
            item.locale ===
            locale,
        );

      if (
        localeItems.length ===
        0
      ) {
        return [];
      }

      const selectedCoverIndex =
        localeItems.findIndex(
          item =>
            item.isCardCover,
        );

      const coverIndex =
        selectedCoverIndex >=
        0
          ? selectedCoverIndex
          : 0;

      return localeItems.map(
        (
          item,
          index,
        ) => ({
          ...item,

          isCardCover:
            index ===
            coverIndex,
        }),
      );
    },
  );
}

function getTranslation(
  item:
    PublicationMediaItem,

  locale:
    'fr' |
    'en',
) {
  return (
    item.translations.find(
      translation =>
        translation.locale ===
        locale,
    ) ?? {
      locale,

      altText:
        '',

      caption:
        '',
    }
  );
}

export function PublicationMediaManager({
  media,
  activeLocale,
  disabled = false,
  authorizedFetch,
  onChange,
}: PublicationMediaManagerProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    isUploading,
    setIsUploading,
  ] =
    useState(
      false,
    );

  const activeLocaleMedia =
    media
      .filter(
        item =>
          item.locale ===
          activeLocale,
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.sortOrder -
          second.sortOrder,
      );

  const remainingPlaces =
    Math.max(
      0,
      MAX_MEDIA_COUNT -
        activeLocaleMedia.length,
    );

  function emitChange(
    nextMedia:
      PublicationMediaItem[],
  ) {
    onChange(
      ensureSingleCover(
        normalizeMediaOrder(
          nextMedia,
        ),
      ),
    );
  }

  async function uploadImage(
    file:
      File,
  ): Promise<PublicationMediaItem> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file,
    );

    const uploaded =
      await authorizedFetch<
        UploadedPublicationImage
      >(
        '/publications/upload-image',
        {
          method:
            'POST',

          body:
            formData,
        },
      );

    return {
      id:
        createLocalId(),

      locale:
        activeLocale,

      mediaType:
        'IMAGE',

      mediaUrl:
        uploaded.url,

      posterUrl:
        null,

      posterFrameSeconds:
        null,

      isCardCover:
        false,

      sortOrder:
        activeLocaleMedia.length,

      width:
        uploaded.width,

      height:
        uploaded.height,

      durationSeconds:
        null,

      translations: [
        {
          locale:
            activeLocale,

          altText:
            '',

          caption:
            '',
        },
      ],

      isNew:
        true,
    };
  }

  async function uploadVideo(
    file:
      File,
  ): Promise<PublicationMediaItem> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file,
    );

    const uploaded =
      await authorizedFetch<
        UploadedPublicationVideo
      >(
        '/publications/upload-video',
        {
          method:
            'POST',

          body:
            formData,
        },
      );

    return {
      id:
        createLocalId(),

      locale:
        activeLocale,

      mediaType:
        'VIDEO',

      mediaUrl:
        uploaded.url,

      posterUrl:
        uploaded.posterUrl,

      posterFrameSeconds:
        uploaded.posterFrameSeconds,

      isCardCover:
        false,

      sortOrder:
        activeLocaleMedia.length,

      width:
        uploaded.width,

      height:
        uploaded.height,

      durationSeconds:
        uploaded.durationSeconds,

      translations: [
        {
          locale:
            activeLocale,

          altText:
            '',

          caption:
            '',
        },
      ],

      isNew:
        true,
    };
  }

  function validateFile(
    file:
      File,
  ) {
    if (
      ALLOWED_IMAGE_TYPES.has(
        file.type,
      )
    ) {
      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        return `L’image « ${file.name} » dépasse 10 Mo.`;
      }

      return null;
    }

    if (
      ALLOWED_VIDEO_TYPES.has(
        file.type,
      )
    ) {
      if (
        file.size >
        MAX_VIDEO_SIZE
      ) {
        return `La vidéo « ${file.name} » dépasse 100 Mo.`;
      }

      return null;
    }

    return `Le fichier « ${file.name} » doit être une image JPEG, PNG, WebP ou AVIF, ou une vidéo MP4 ou WebM.`;
  }

  async function handleFilesSelected(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ??
          [],
      );

    event.target.value =
      '';

    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }

    if (
      remainingPlaces ===
      0
    ) {
      toast.error(
        `La limite de cinq médias ${activeLocale.toUpperCase()} est atteinte.`,
      );

      return;
    }

    if (
      selectedFiles.length >
      remainingPlaces
    ) {
      toast.error(
        `Vous pouvez encore ajouter ${remainingPlaces} média${
          remainingPlaces >
          1
            ? 's'
            : ''
        } pour la langue ${activeLocale.toUpperCase()}.`,
      );

      return;
    }

    for (
      const file of
      selectedFiles
    ) {
      const validationError =
        validateFile(
          file,
        );

      if (
        validationError
      ) {
        toast.error(
          validationError,
        );

        return;
      }
    }

    setIsUploading(
      true,
    );

    const importedMedia:
      PublicationMediaItem[] =
      [];

    try {
      for (
        const file of
        selectedFiles
      ) {
        const uploadedItem =
          ALLOWED_IMAGE_TYPES.has(
            file.type,
          )
            ? await uploadImage(
                file,
              )
            : await uploadVideo(
                file,
              );

        importedMedia.push(
          uploadedItem,
        );
      }

      emitChange([
        ...media,
        ...importedMedia,
      ]);

      toast.success(
        importedMedia.length >
        1
          ? `${importedMedia.length} médias ${activeLocale.toUpperCase()} ont été importés.`
          : `Le média ${activeLocale.toUpperCase()} a été importé.`,
      );
    } catch (
      error
    ) {
      if (
        importedMedia.length >
        0
      ) {
        emitChange([
          ...media,
          ...importedMedia,
        ]);
      }

      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsUploading(
        false,
      );
    }
  }

  function setAsCover(
    mediaId:
      string,
  ) {
    emitChange(
      media.map(
        item => ({
          ...item,

          isCardCover:
            item.locale ===
            activeLocale
              ? item.id ===
                mediaId
              : item.isCardCover,
        }),
      ),
    );
  }

  function moveMedia(
    currentIndex:
      number,

    direction:
      -1 |
      1,
  ) {
    const destinationIndex =
      currentIndex +
      direction;

    if (
      destinationIndex <
        0 ||
      destinationIndex >=
        activeLocaleMedia.length
    ) {
      return;
    }

    const reorderedLocaleMedia =
      activeLocaleMedia.slice();

    const [
      movedItem,
    ] =
      reorderedLocaleMedia.splice(
        currentIndex,
        1,
      );

    if (
      !movedItem
    ) {
      return;
    }

    reorderedLocaleMedia.splice(
      destinationIndex,
      0,
      movedItem,
    );

    const reorderedIds =
      new Map(
        reorderedLocaleMedia.map(
          (
            item,
            index,
          ) => [
            item.id,
            index,
          ],
        ),
      );

    emitChange(
      media.map(
        item =>
          item.locale ===
          activeLocale
            ? {
                ...item,

                sortOrder:
                  reorderedIds.get(
                    item.id,
                  ) ??
                  item.sortOrder,
              }
            : item,
      ),
    );
  }

  function removeMedia(
    mediaId:
      string,
  ) {
    const selectedMedia =
      media.find(
        item =>
          item.id ===
          mediaId,
      );

    if (
      !selectedMedia ||
      selectedMedia.locale !==
        activeLocale
    ) {
      return;
    }

    emitChange(
      media.filter(
        item =>
          item.id !==
          mediaId,
      ),
    );
  }

  function updateTranslation(
    mediaId:
      string,

    field:
      'altText' |
      'caption',

    value:
      string,
  ) {
    emitChange(
      media.map(
        item => {
          if (
            item.id !==
            mediaId ||
            item.locale !==
            activeLocale
          ) {
            return item;
          }

          const existingTranslation =
            getTranslation(
              item,
              activeLocale,
            );

          const otherTranslations =
            item.translations.filter(
              translation =>
                translation.locale !==
                activeLocale,
            );

          return {
            ...item,

            translations: [
              ...otherTranslations,

              {
                ...existingTranslation,

                [field]:
                  value,
              },
            ],
          };
        },
      ),
    );
  }

  return (
    <section className="publication-media-manager">
      <div className="publication-media-manager__heading">
        <div className="publication-media-manager__title">
          <ImagePlus
            size={
              21
            }
            aria-hidden="true"
          />

          <div>
            <h2>
              Médias de la publication
            </h2>

            <p>
              Ajoutez jusqu’à cinq images ou vidéos pour chaque langue.
              L’ordre défini ici sera conservé sur le site.
            </p>

            <p className="publication-media-manager__locale-note">
              {
                activeLocale ===
                  'fr'
                  ? 'Vous gérez actuellement les médias français.'
                  : 'Vous gérez actuellement les médias anglais.'
              }
            </p>
          </div>
        </div>

        <span className="publication-media-manager__counter">
          {activeLocaleMedia.length}/{MAX_MEDIA_COUNT}
        </span>
      </div>

      <input
        ref={
          fileInputRef
        }
        className="publication-media-manager__input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
        multiple
        disabled={
          disabled ||
          isUploading ||
          remainingPlaces ===
            0
        }
        onChange={
          handleFilesSelected
        }
      />

      {
        remainingPlaces >
        0
          ? (
              <button
                type="button"
                className="publication-media-manager__upload"
                disabled={
                  disabled ||
                  isUploading
                }
                onClick={
                  () =>
                    fileInputRef
                      .current
                      ?.click()
                }
              >
                {
                  isUploading
                    ? (
                        <LoaderCircle
                          size={
                            21
                          }
                          className="admin-spinner"
                          aria-hidden="true"
                        />
                      )
                    : (
                        <Upload
                          size={
                            21
                          }
                          aria-hidden="true"
                        />
                      )
                }

                <span>
                  {
                    isUploading
                      ? 'Import en cours…'
                      : activeLocale ===
                          'fr'
                        ? 'Importer les médias français'
                        : 'Importer les médias anglais'
                  }
                </span>

                <small>
                  Images : 10 Mo maximum · Vidéos : 100 Mo maximum
                </small>
              </button>
            )
          : (
              <div className="publication-media-manager__limit">
                La limite de cinq médias {activeLocale.toUpperCase()} est atteinte.
              </div>
            )
      }

      {
        activeLocaleMedia.length ===
        0
          ? (
              <div className="publication-media-manager__empty">
                <FileImage
                  size={
                    30
                  }
                  aria-hidden="true"
                />

                <strong>
                  Aucun média {activeLocale.toUpperCase()} importé
                </strong>

                <p>
                  {
                    activeLocale ===
                      'fr'
                      ? 'En l’absence de médias français, le site utilisera les médias anglais lorsqu’ils existent.'
                      : 'En l’absence de médias anglais, le site utilisera les médias français lorsqu’ils existent.'
                  }
                </p>
              </div>
            )
          : (
              <div className="publication-media-manager__list">
                {
                  activeLocaleMedia.map(
                    (
                      item,
                      index,
                    ) => {
                      const translation =
                        getTranslation(
                          item,
                          activeLocale,
                        );

                      const previewUrl =
                        item.mediaType ===
                        'VIDEO'
                          ? item.posterUrl
                          : item.mediaUrl;

                      return (
                        <article
                          key={
                            item.id
                          }
                          className="publication-media-manager__item"
                          data-cover={
                            item.isCardCover
                          }
                        >
                          <div className="publication-media-manager__preview">
                            {
                              previewUrl
                                ? (
                                    <img
                                      src={
                                        previewUrl
                                      }
                                      alt=""
                                    />
                                  )
                                : (
                                    <div className="publication-media-manager__preview-placeholder">
                                      {
                                        item.mediaType ===
                                        'VIDEO'
                                          ? (
                                              <Film
                                                size={
                                                  28
                                                }
                                                aria-hidden="true"
                                              />
                                            )
                                          : (
                                              <FileImage
                                                size={
                                                  28
                                                }
                                                aria-hidden="true"
                                              />
                                            )
                                      }
                                    </div>
                                  )
                            }

                            <span className="publication-media-manager__type">
                              {
                                item.mediaType ===
                                'VIDEO'
                                  ? (
                                      <>
                                        <Film
                                          size={
                                            13
                                          }
                                          aria-hidden="true"
                                        />

                                        Vidéo
                                      </>
                                    )
                                  : (
                                      <>
                                        <FileImage
                                          size={
                                            13
                                          }
                                          aria-hidden="true"
                                        />

                                        Image
                                      </>
                                    )
                              }
                            </span>

                            {
                              item.isCardCover
                                ? (
                                    <span className="publication-media-manager__cover-badge">
                                      <Star
                                        size={
                                          13
                                        }
                                        aria-hidden="true"
                                      />

                                      Couverture
                                    </span>
                                  )
                                : null
                            }
                          </div>

                          <div className="publication-media-manager__content">
                            <div className="publication-media-manager__item-heading">
                              <div>
                                <strong>
                                  Média {index + 1}
                                </strong>

                                <span>
                                  {
                                    item.width &&
                                    item.height
                                      ? `${item.width} × ${item.height}px`
                                      : item.mediaType ===
                                          'VIDEO'
                                        ? 'Affiche générée automatiquement'
                                        : 'Dimensions non disponibles'
                                  }
                                </span>
                              </div>

                              <div className="publication-media-manager__order-actions">
                                <button
                                  type="button"
                                  aria-label="Déplacer le média vers le haut"
                                  title="Déplacer vers le haut"
                                  disabled={
                                    disabled ||
                                    index ===
                                      0
                                  }
                                  onClick={
                                    () =>
                                      moveMedia(
                                        index,
                                        -1,
                                      )
                                  }
                                >
                                  <ArrowUp
                                    size={
                                      16
                                    }
                                    aria-hidden="true"
                                  />
                                </button>

                                <button
                                  type="button"
                                  aria-label="Déplacer le média vers le bas"
                                  title="Déplacer vers le bas"
                                  disabled={
                                    disabled ||
                                    index ===
                                      activeLocaleMedia.length -
                                        1
                                  }
                                  onClick={
                                    () =>
                                      moveMedia(
                                        index,
                                        1,
                                      )
                                  }
                                >
                                  <ArrowDown
                                    size={
                                      16
                                    }
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>

                            <div className="publication-media-manager__fields">
                              <label>
                                <span>
                                  Texte alternatif — {activeLocale.toUpperCase()}
                                </span>

                                <input
                                  type="text"
                                  maxLength={
                                    255
                                  }
                                  value={
                                    translation.altText
                                  }
                                  placeholder="Décrivez précisément le contenu visuel"
                                  disabled={
                                    disabled
                                  }
                                  onChange={
                                    event =>
                                      updateTranslation(
                                        item.id,
                                        'altText',
                                        event.target.value,
                                      )
                                  }
                                />
                              </label>

                              <label>
                                <span>
                                  Légende — {activeLocale.toUpperCase()}
                                </span>

                                <textarea
                                  rows={
                                    2
                                  }
                                  maxLength={
                                    2_000
                                  }
                                  value={
                                    translation.caption
                                  }
                                  placeholder="Légende facultative"
                                  disabled={
                                    disabled
                                  }
                                  onChange={
                                    event =>
                                      updateTranslation(
                                        item.id,
                                        'caption',
                                        event.target.value,
                                      )
                                  }
                                />
                              </label>
                            </div>

                            <div className="publication-media-manager__actions">
                              <button
                                type="button"
                                className="publication-media-manager__cover-action"
                                data-active={
                                  item.isCardCover
                                }
                                disabled={
                                  disabled ||
                                  item.isCardCover
                                }
                                onClick={
                                  () =>
                                    setAsCover(
                                      item.id,
                                    )
                                }
                              >
                                {
                                  item.isCardCover
                                    ? (
                                        <Check
                                          size={
                                            16
                                          }
                                          aria-hidden="true"
                                        />
                                      )
                                    : (
                                        <Star
                                          size={
                                            16
                                          }
                                          aria-hidden="true"
                                        />
                                      )
                                }

                                <span>
                                  {
                                    item.isCardCover
                                      ? 'Média de couverture'
                                      : 'Définir comme couverture'
                                  }
                                </span>
                              </button>

                              <button
                                type="button"
                                className="publication-media-manager__delete"
                                disabled={
                                  disabled
                                }
                                onClick={
                                  () =>
                                    removeMedia(
                                      item.id,
                                    )
                                }
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                  aria-hidden="true"
                                />

                                <span>
                                  Retirer
                                </span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    },
                  )
                }
              </div>
            )
      }
    </section>
  );
}