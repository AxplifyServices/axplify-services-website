'use client';

import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Film,
  ImageIcon,
  ImagePlus,
  Images,
  LoaderCircle,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/admin/auth-provider';

import {
  BrochureImageCropModal,
  type BrochureImageCrop,
} from '@/components/admin/brochure-image-crop-modal';

import {
  AdminApiError,
} from '@/lib/admin-api';

type BrochureMediaType =
  | 'IMAGE'
  | 'VIDEO';

type BrochureImageField =
  | 'desktopImageFr'
  | 'mobileImageFr'
  | 'desktopImageEn'
  | 'mobileImageEn';

type BrochureVideoField =
  | 'desktopVideoFr'
  | 'mobileVideoFr'
  | 'desktopVideoEn'
  | 'mobileVideoEn';

type BrochureUploadField =
  | BrochureImageField
  | BrochureVideoField;

type HomepageBrochure = {
  id:
    string;

  internalName:
    string;

  mediaType:
    BrochureMediaType;    

  desktopImageFrUrl:
    string | null;

  mobileImageFrUrl:
    string | null;

  desktopImageEnUrl:
    string | null;

  mobileImageEnUrl:
    string | null;

  desktopVideoFrUrl:
    string | null;

  mobileVideoFrUrl:
    string | null;

  desktopVideoEnUrl:
    string | null;

  mobileVideoEnUrl:
    string | null;

  desktopImageFrCrop:
    BrochureImageCrop | null;

  mobileImageFrCrop:
    BrochureImageCrop | null;

  desktopImageEnCrop:
    BrochureImageCrop | null;

  mobileImageEnCrop:
    BrochureImageCrop | null;

  altTextFr:
    string | null;

  altTextEn:
    string | null;

  linkUrl:
    string | null;

  linkTarget:
    '_self' |
    '_blank';

  sortOrder:
    number;

  isActive:
    boolean;

  createdByUserId:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type UploadedBrochureImage = {
  url:
    string;

  objectName:
    string;

  mimeType:
    'image/webp';

  extension:
    'webp';

  width:
    number | null;

  height:
    number | null;

  size:
    number;
};

type UploadedBrochureVideo = {
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
};

type BrochureFormState = {
  internalName:
    string;

  mediaType:
    BrochureMediaType;    

  desktopImageFrUrl:
    string;

  mobileImageFrUrl:
    string;

  desktopImageEnUrl:
    string;

  mobileImageEnUrl:
    string;

  desktopVideoFrUrl:
    string;

  mobileVideoFrUrl:
    string;

  desktopVideoEnUrl:
    string;

  mobileVideoEnUrl:
    string;

  altTextFr:
    string;

  altTextEn:
    string;

  linkUrl:
    string;

  linkTarget:
    '_self' |
    '_blank';

  sortOrder:
    string;

  isActive:
    boolean;
};

type BrochureFileState = Record<
  BrochureImageField,
  File | null
>;

type BrochurePreviewState = Record<
  BrochureImageField,
  string | null
>;

type BrochureCropState = Record<
  BrochureImageField,
  BrochureImageCrop | null
>;

type BrochureVideoFileState = Record<
  BrochureVideoField,
  File | null
>;

type BrochureVideoPreviewState = Record<
  BrochureVideoField,
  string | null
>;

type CropEditorState = {
  field:
    BrochureImageField;

  imageUrl:
    string;

  file:
    File | null;

  crop:
    BrochureImageCrop;
} | null;

type FeedbackState = {
  type:
    'success' |
    'error';

  message:
    string;
} | null;

const EMPTY_FORM:
  BrochureFormState = {
    internalName:
      '',

    mediaType:
      'IMAGE',      

    desktopImageFrUrl:
      '',

    mobileImageFrUrl:
      '',

    desktopImageEnUrl:
      '',

    mobileImageEnUrl:
      '',

    desktopVideoFrUrl:
      '',

    mobileVideoFrUrl:
      '',

    desktopVideoEnUrl:
      '',

    mobileVideoEnUrl:
      '',

    altTextFr:
      '',

    altTextEn:
      '',

    linkUrl:
      '',

    linkTarget:
      '_self',

    sortOrder:
      '0',

    isActive:
      true,
  };

const EMPTY_FILES:
  BrochureFileState = {
    desktopImageFr:
      null,

    mobileImageFr:
      null,

    desktopImageEn:
      null,

    mobileImageEn:
      null,
  };

const EMPTY_PREVIEWS:
  BrochurePreviewState = {
    desktopImageFr:
      null,

    mobileImageFr:
      null,

    desktopImageEn:
      null,

    mobileImageEn:
      null,
  };

const EMPTY_VIDEO_FILES:
  BrochureVideoFileState = {
    desktopVideoFr:
      null,

    mobileVideoFr:
      null,

    desktopVideoEn:
      null,

    mobileVideoEn:
      null,
  };

const EMPTY_VIDEO_PREVIEWS:
  BrochureVideoPreviewState = {
    desktopVideoFr:
      null,

    mobileVideoFr:
      null,

    desktopVideoEn:
      null,

    mobileVideoEn:
      null,
  };  

const EMPTY_CROPS:
  BrochureCropState = {
    desktopImageFr:
      null,

    mobileImageFr:
      null,

    desktopImageEn:
      null,

    mobileImageEn:
      null,
  };

const IMAGE_FIELD_CONFIG: Array<{
  field:
    BrochureImageField;

  formUrlField:
    keyof Pick<
      BrochureFormState,
      | 'desktopImageFrUrl'
      | 'mobileImageFrUrl'
      | 'desktopImageEnUrl'
      | 'mobileImageEnUrl'
    >;

  cropField:
    keyof Pick<
      HomepageBrochure,
      | 'desktopImageFrCrop'
      | 'mobileImageFrCrop'
      | 'desktopImageEnCrop'
      | 'mobileImageEnCrop'
    >;

  label:
    string;

  description:
    string;

  format:
    'desktop' |
    'mobile';

  language:
    'FR' |
    'EN';

  required:
    boolean;
}> = [
  {
    field:
      'desktopImageFr',

    formUrlField:
      'desktopImageFrUrl',

    cropField:
      'desktopImageFrCrop',

    label:
      'Version française — Desktop',

    description:
      'Image horizontale destinée aux écrans d’ordinateur.',

    format:
      'desktop',

    language:
      'FR',

    required:
      false,
  },

  {
    field:
      'mobileImageFr',

    formUrlField:
      'mobileImageFrUrl',

    cropField:
      'mobileImageFrCrop',

    label:
      'Version française — Mobile',

    description:
      'Image verticale ou adaptée aux écrans de téléphone.',

    format:
      'mobile',

    language:
      'FR',

    required:
      false,
  },

  {
    field:
      'desktopImageEn',

    formUrlField:
      'desktopImageEnUrl',

    cropField:
      'desktopImageEnCrop',

    label:
      'Version anglaise — Desktop',

    description:
      'Cette image sera aussi utilisée pour la version arabe.',

    format:
      'desktop',

    language:
      'EN',

    required:
      false,
  },

  {
    field:
      'mobileImageEn',

    formUrlField:
      'mobileImageEnUrl',

    cropField:
      'mobileImageEnCrop',

    label:
      'Version anglaise — Mobile',

    description:
      'Cette image sera aussi utilisée pour la version arabe sur mobile.',

    format:
      'mobile',

    language:
      'EN',

    required:
      false,
  },
];

const VIDEO_FIELD_CONFIG: Array<{
  field:
    BrochureVideoField;

  formUrlField:
    keyof Pick<
      BrochureFormState,
      | 'desktopVideoFrUrl'
      | 'mobileVideoFrUrl'
      | 'desktopVideoEnUrl'
      | 'mobileVideoEnUrl'
    >;

  label:
    string;

  description:
    string;

  format:
    'desktop' |
    'mobile';

  language:
    'FR' |
    'EN';
}> = [
  {
    field:
      'desktopVideoFr',

    formUrlField:
      'desktopVideoFrUrl',

    label:
      'Version française — Desktop',

    description:
      'Vidéo horizontale destinée aux écrans d’ordinateur.',

    format:
      'desktop',

    language:
      'FR',
  },

  {
    field:
      'mobileVideoFr',

    formUrlField:
      'mobileVideoFrUrl',

    label:
      'Version française — Mobile',

    description:
      'Vidéo verticale adaptée aux écrans de téléphone.',

    format:
      'mobile',

    language:
      'FR',
  },

  {
    field:
      'desktopVideoEn',

    formUrlField:
      'desktopVideoEnUrl',

    label:
      'Version anglaise — Desktop',

    description:
      'Cette vidéo sera également utilisée pour la version arabe.',

    format:
      'desktop',

    language:
      'EN',
  },

  {
    field:
      'mobileVideoEn',

    formUrlField:
      'mobileVideoEnUrl',

    label:
      'Version anglaise — Mobile',

    description:
      'Cette vidéo sera également utilisée pour la version arabe sur mobile.',

    format:
      'mobile',

    language:
      'EN',
  },
];

function getDefaultCrop(
  naturalWidth:
    number,

  naturalHeight:
    number,
): BrochureImageCrop {
  return {
    offsetX:
      0,

    offsetY:
      0,

    zoom:
      1,

    naturalWidth,

    naturalHeight,
  };
}

function brochureToForm(
  brochure:
    HomepageBrochure,
): BrochureFormState {
  return {
    internalName:
      brochure.internalName,

    mediaType:
      brochure.mediaType,      

    desktopImageFrUrl:
      brochure.desktopImageFrUrl ??
      '',

    mobileImageFrUrl:
      brochure.mobileImageFrUrl ??
      '',

    desktopImageEnUrl:
      brochure.desktopImageEnUrl ??
      '',

    mobileImageEnUrl:
      brochure.mobileImageEnUrl ??
      '',

    desktopVideoFrUrl:
      brochure.desktopVideoFrUrl ??
      '',

    mobileVideoFrUrl:
      brochure.mobileVideoFrUrl ??
      '',

    desktopVideoEnUrl:
      brochure.desktopVideoEnUrl ??
      '',

    mobileVideoEnUrl:
      brochure.mobileVideoEnUrl ??
      '',      

    altTextFr:
      brochure.altTextFr ??
      '',

    altTextEn:
      brochure.altTextEn ??
      '',

    linkUrl:
      brochure.linkUrl ??
      '',

    linkTarget:
      brochure.linkTarget,

    sortOrder:
      String(
        brochure.sortOrder,
      ),

    isActive:
      brochure.isActive,
  };
}

function formatFileSize(
  size:
    number,
): string {
  if (
    size <
    1024
  ) {
    return `${size} octets`;
  }

  if (
    size <
    1024 *
      1024
  ) {
    return `${Math.round(
      size /
        1024,
    )} Ko`;
  }

  return `${(
    size /
    1024 /
    1024
  ).toFixed(
    1,
  )} Mo`;
}

function formatDate(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function getErrorMessage(
  error:
    unknown,
): string {
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

  return 'Une erreur inattendue est survenue.';
}

function getPrimaryPreview(
  brochure:
    HomepageBrochure,
): string | null {
  return (
    brochure
      .desktopImageFrUrl ??
    brochure
      .desktopImageEnUrl ??
    brochure
      .mobileImageFrUrl ??
    brochure
      .mobileImageEnUrl
  );
}

function getLanguageAvailability(
  brochure:
    HomepageBrochure,
) {
  return {
    fr:
      Boolean(
        brochure
          .desktopImageFrUrl ||
        brochure
          .mobileImageFrUrl,
      ),

    en:
      Boolean(
        brochure
          .desktopImageEnUrl ||
        brochure
          .mobileImageEnUrl,
      ),
  };
}

type BrochureImageUploadProps = {
  config:
    (typeof IMAGE_FIELD_CONFIG)[number];

  file:
    File | null;

  previewUrl:
    string | null;

  existingUrl:
    string;

  crop:
    BrochureImageCrop | null;

  disabled:
    boolean;

  onChange: (
    field:
      BrochureImageField,

    event:
      ChangeEvent<HTMLInputElement>,
  ) => void;

  onClearSelection: (
    field:
      BrochureImageField,
  ) => void;

  onEditCrop: (
    field:
      BrochureImageField,
  ) => void;
};

function BrochureImageUpload({
  config,
  file,
  previewUrl,
  existingUrl,
  crop,
  disabled,
  onChange,
  onClearSelection,
  onEditCrop,
}: BrochureImageUploadProps) {
  const displayedUrl =
    previewUrl ??
    existingUrl ??
    null;

  const inputId =
    `brochure-${config.field}`;

  return (
    <article
      className="admin-brochure-upload"
      data-format={
        config.format
      }
    >
      <div className="admin-brochure-upload__heading">
        <div>
          <div className="admin-brochure-upload__badges">
            <span>
              {
                config.language
              }
            </span>

            <span>
              {
                config.format ===
                'desktop'
                  ? 'Desktop'
                  : 'Mobile'
              }
            </span>
          </div>

          <h3>
            {
              config.label
            }
          </h3>

          <p>
            {
              config.description
            }
          </p>

<p className="admin-brochure-upload__recommended-size">
  Taille recommandée :
  {' '}

  <strong>
    {
      config.format ===
      'desktop'
        ? '1920 × 800 px'
        : '1080 × 1635 px'
    }
  </strong>
</p>
        </div>
      </div>

      <div
        className="admin-brochure-upload__preview"
        data-format={
          config.format
        }
      >
        {
          displayedUrl
            ? (
                <button
                  type="button"
                  className="admin-brochure-upload__preview-button"
                  disabled={
                    disabled
                  }
                  aria-label={
                    `Modifier le cadrage de ${config.label}`
                  }
                  onClick={
                    () =>
                      onEditCrop(
                        config.field,
                      )
                  }
                >
                  <img
                    src={
                      displayedUrl
                    }
                    alt=""
                    draggable={
                      false
                    }
                    style={{
                      transform:
                        crop
                          ? `translate(${crop.offsetX * 100}%, ${crop.offsetY * 100}%) scale(${crop.zoom})`
                          : undefined,
                    }}
                  />

                  <span className="admin-brochure-upload__edit-overlay">
                    <Pencil
                      size={
                        17
                      }
                      aria-hidden="true"
                    />

                    Modifier le cadrage
                  </span>
                </button>
              )
            : (
                <div className="admin-brochure-upload__empty">
                  <ImagePlus
                    size={
                      30
                    }
                    aria-hidden="true"
                  />

                  <span>
                    Aucune image sélectionnée
                  </span>
                </div>
              )
        }
      </div>

      <div className="admin-brochure-upload__actions">
        <label
          htmlFor={
            inputId
          }
          className="admin-brochure-upload__button"
          aria-disabled={
            disabled
          }
        >
          <Upload
            size={
              17
            }
            aria-hidden="true"
          />

          <span>
            {
              displayedUrl
                ? 'Remplacer l’image'
                : 'Importer une image'
            }
          </span>
        </label>

        <input
          id={
            inputId
          }
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          disabled={
            disabled
          }
          onChange={
            event =>
              onChange(
                config.field,
                event,
              )
          }
        />

        {
          file
            ? (
                <button
                  type="button"
                  className="admin-brochure-upload__cancel"
                  disabled={
                    disabled
                  }
                  onClick={
                    () =>
                      onClearSelection(
                        config.field,
                      )
                  }
                >
                  <X
                    size={
                      16
                    }
                    aria-hidden="true"
                  />

                  Annuler
                </button>
              )
            : null
        }
      </div>

      {
        file
          ? (
              <p className="admin-brochure-upload__file">
                <strong>
                  {
                    file.name
                  }
                </strong>

                <span>
                  {
                    formatFileSize(
                      file.size,
                    )
                  }
                </span>

                <span>
                  Conversion automatique en WebP
                </span>
              </p>
            )
          : existingUrl
            ? (
                <p className="admin-brochure-upload__file">
                  <Check
                    size={
                      15
                    }
                    aria-hidden="true"
                  />

                  Image déjà enregistrée
                </p>
              )
            : (
                <p className="admin-brochure-upload__recommendation">
                  Formats acceptés : JPEG, PNG, WebP et AVIF. Taille maximale : 10 Mo.
                </p>
              )
      }
    </article>
  );
}

export function HomepageBrochuresManager() {
  const {
    authorizedFetch,
  } =
    useAuth();

  const [
    brochures,
    setBrochures,
  ] =
    useState<
      HomepageBrochure[]
    >(
      [],
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isFormOpen,
    setIsFormOpen,
  ] =
    useState(
      false,
    );

  const [
    editingBrochureId,
    setEditingBrochureId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<
      BrochureFormState
    >(
      EMPTY_FORM,
    );

  const [
    files,
    setFiles,
  ] =
    useState<
      BrochureFileState
    >(
      EMPTY_FILES,
    );

  const [
    previews,
    setPreviews,
  ] =
    useState<
      BrochurePreviewState
    >(
      EMPTY_PREVIEWS,
    );

  const [
    videoFiles,
    setVideoFiles,
  ] =
    useState<
      BrochureVideoFileState
    >(
      EMPTY_VIDEO_FILES,
    );

  const [
    videoPreviews,
    setVideoPreviews,
  ] =
    useState<
      BrochureVideoPreviewState
    >(
      EMPTY_VIDEO_PREVIEWS,
    );    

  const [
    crops,
    setCrops,
  ] =
    useState<
      BrochureCropState
    >(
      EMPTY_CROPS,
    );

  const [
    cropEditor,
    setCropEditor,
  ] =
    useState<
      CropEditorState
    >(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  const [
    uploadingField,
    setUploadingField,
  ] =
    useState<
      BrochureUploadField | null
    >(
      null,
    );

    

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    reorderingId,
    setReorderingId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      FeedbackState
    >(
      null,
    );

  const [
    validationError,
    setValidationError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const editingBrochure =
    useMemo(
      () =>
        brochures.find(
          brochure =>
            brochure.id ===
            editingBrochureId,
        ) ??
        null,
      [
        brochures,
        editingBrochureId,
      ],
    );

  const cropEditorConfig =
    useMemo(
      () => {
        if (
          !cropEditor
        ) {
          return null;
        }

        return (
          IMAGE_FIELD_CONFIG.find(
            config =>
              config.field ===
              cropEditor.field,
          ) ??
          null
        );
      },
      [
        cropEditor,
      ],
    );

  const loadBrochures =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        try {
          const response =
            await authorizedFetch<
              HomepageBrochure[]
            >(
              '/homepage-brochures/admin',
            );

          setBrochures(
            response,
          );
        } catch (
          error
        ) {
          setFeedback({
            type:
              'error',

            message:
              getErrorMessage(
                error,
              ),
          });
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        authorizedFetch,
      ],
    );

  useEffect(
    () => {
      void loadBrochures();
    },
    [
      loadBrochures,
    ],
  );

  useEffect(
    () => {
      return () => {
        Object.values(
          previews,
        ).forEach(
          previewUrl => {
            if (
              previewUrl
            ) {
              URL.revokeObjectURL(
                previewUrl,
              );
            }
          },
        );
      };
    },
    [
      previews,
    ],
  );

  useEffect(
    () => {
      return () => {
        Object.values(
          videoPreviews,
        ).forEach(
          previewUrl => {
            if (
              previewUrl
            ) {
              URL.revokeObjectURL(
                previewUrl,
              );
            }
          },
        );
      };
    },
    [
      videoPreviews,
    ],
  );  

  function resetSelectedFiles() {
    Object.values(
      previews,
    ).forEach(
      previewUrl => {
        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl,
          );
        }
      },
    );

    if (
      cropEditor?.file
    ) {
      const committedPreview =
        previews[
          cropEditor.field
        ];

      if (
        cropEditor.imageUrl !==
        committedPreview
      ) {
        URL.revokeObjectURL(
          cropEditor.imageUrl,
        );
      }
    }

    setFiles(
      EMPTY_FILES,
    );

    setPreviews(
      EMPTY_PREVIEWS,
    );

    Object.values(
      videoPreviews,
    ).forEach(
      previewUrl => {
        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl,
          );
        }
      },
    );

    setVideoFiles(
      EMPTY_VIDEO_FILES,
    );

    setVideoPreviews(
      EMPTY_VIDEO_PREVIEWS,
    );    

    setCrops(
      EMPTY_CROPS,
    );

    setCropEditor(
      null,
    );
  }

  function openCreateForm() {
    resetSelectedFiles();

    setEditingBrochureId(
      null,
    );

    setForm({
      ...EMPTY_FORM,

      sortOrder:
        String(
          brochures.length,
        ),
    });

    setValidationError(
      null,
    );

    setFeedback(
      null,
    );

    setIsFormOpen(
      true,
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function openEditForm(
    brochure:
      HomepageBrochure,
  ) {
    resetSelectedFiles();

    setEditingBrochureId(
      brochure.id,
    );

    setForm(
      brochureToForm(
        brochure,
      ),
    );

    setCrops({
      desktopImageFr:
        brochure.desktopImageFrCrop,

      mobileImageFr:
        brochure.mobileImageFrCrop,

      desktopImageEn:
        brochure.desktopImageEnCrop,

      mobileImageEn:
        brochure.mobileImageEnCrop,
    });

    setValidationError(
      null,
    );

    setFeedback(
      null,
    );

    setIsFormOpen(
      true,
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function closeForm() {
    if (
      isSubmitting
    ) {
      return;
    }

    resetSelectedFiles();

    setEditingBrochureId(
      null,
    );

    setForm(
      EMPTY_FORM,
    );

    setValidationError(
      null,
    );

    setIsFormOpen(
      false,
    );
  }

  function updateFormField<
    Key extends keyof BrochureFormState,
  >(
    field:
      Key,

    value:
      BrochureFormState[Key],
  ) {
    setForm(
      currentForm => ({
        ...currentForm,

        [field]:
          value,
      }),
    );
  }

  function handleFileChange(
    field:
      BrochureImageField,

    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      '';

    if (
      !file
    ) {
      return;
    }

    const allowedTypes =
      new Set([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
      ]);

    if (
      !allowedTypes.has(
        file.type,
      )
    ) {
      setFeedback({
        type:
          'error',

        message:
          'Le fichier doit être une image JPEG, PNG, WebP ou AVIF.',
      });

      return;
    }

    if (
      file.size >
      10 *
        1024 *
        1024
    ) {
      setFeedback({
        type:
          'error',

        message:
          'L’image dépasse la taille maximale autorisée de 10 Mo.',
      });

      return;
    }

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    const image =
      new Image();

    image.onload =
      () => {
        setFeedback(
          null,
        );

        setCropEditor({
          field,

          imageUrl:
            previewUrl,

          file,

          crop:
            getDefaultCrop(
              image.naturalWidth,
              image.naturalHeight,
            ),
        });
      };

    image.onerror =
      () => {
        URL.revokeObjectURL(
          previewUrl,
        );

        setFeedback({
          type:
            'error',

          message:
            'Le navigateur ne parvient pas à lire cette image.',
        });
      };

    image.src =
      previewUrl;
  }

  function handleVideoFileChange(
    field:
      BrochureVideoField,

    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      '';

    if (
      !file
    ) {
      return;
    }

    const allowedTypes =
      new Set([
        'video/mp4',
        'video/webm',
      ]);

    if (
      !allowedTypes.has(
        file.type,
      )
    ) {
      setFeedback({
        type:
          'error',

        message:
          'Le fichier doit être une vidéo MP4 ou WebM.',
      });

      return;
    }

    if (
      file.size >
      100 *
        1024 *
        1024
    ) {
      setFeedback({
        type:
          'error',

        message:
          'La vidéo dépasse la taille maximale autorisée de 100 Mo.',
      });

      return;
    }

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setVideoPreviews(
      currentPreviews => {
        const previousPreview =
          currentPreviews[
            field
          ];

        if (
          previousPreview
        ) {
          URL.revokeObjectURL(
            previousPreview,
          );
        }

        return {
          ...currentPreviews,

          [field]:
            previewUrl,
        };
      },
    );

    setVideoFiles(
      currentFiles => ({
        ...currentFiles,

        [field]:
          file,
      }),
    );

    setFeedback(
      null,
    );
  }  

  function openCropEditor(
    field:
      BrochureImageField,
  ) {
    const config =
      IMAGE_FIELD_CONFIG.find(
        item =>
          item.field ===
          field,
      );

    if (
      !config
    ) {
      return;
    }

    const imageUrl =
      previews[
        field
      ] ??
      form[
        config.formUrlField
      ];

    if (
      !imageUrl
    ) {
      return;
    }

    const currentCrop =
      crops[
        field
      ];

    if (
      currentCrop
    ) {
      setCropEditor({
        field,

        imageUrl,

        file:
          files[
            field
          ],

        crop:
          currentCrop,
      });

      return;
    }

    const image =
      new Image();

    image.onload =
      () => {
        setCropEditor({
          field,

          imageUrl,

          file:
            files[
              field
            ],

          crop:
            getDefaultCrop(
              image.naturalWidth,
              image.naturalHeight,
            ),
        });
      };

    image.onerror =
      () => {
        setFeedback({
          type:
            'error',

          message:
            'Impossible de charger cette image pour modifier son cadrage.',
        });
      };

    image.src =
      imageUrl;
  }

  function validateCropEditor(
    crop:
      BrochureImageCrop,
  ) {
    if (
      !cropEditor
    ) {
      return;
    }

    const {
      field,
      file,
      imageUrl,
    } =
      cropEditor;

    if (
      file
    ) {
      setPreviews(
        currentPreviews => {
          const previousPreview =
            currentPreviews[
              field
            ];

          if (
            previousPreview &&
            previousPreview !==
              imageUrl
          ) {
            URL.revokeObjectURL(
              previousPreview,
            );
          }

          return {
            ...currentPreviews,

            [field]:
              imageUrl,
          };
        },
      );

      setFiles(
        currentFiles => ({
          ...currentFiles,

          [field]:
            file,
        }),
      );
    }

    setCrops(
      currentCrops => ({
        ...currentCrops,

        [field]:
          crop,
      }),
    );

    setCropEditor(
      null,
    );
  }

  function cancelCropEditor() {
    if (
      cropEditor?.file
    ) {
      const committedPreview =
        previews[
          cropEditor.field
        ];

      if (
        cropEditor.imageUrl !==
        committedPreview
      ) {
        URL.revokeObjectURL(
          cropEditor.imageUrl,
        );
      }
    }

    setCropEditor(
      null,
    );
  }

  function clearSelectedFile(
    field:
      BrochureImageField,
  ) {
    const previewUrl =
      previews[
        field
      ];

    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setFiles(
      currentFiles => ({
        ...currentFiles,

        [field]:
          null,
      }),
    );

    setPreviews(
      currentPreviews => ({
        ...currentPreviews,

        [field]:
          null,
      }),
    );

    setCrops(
      currentCrops => ({
        ...currentCrops,

        [field]:
          null,
      }),
    );
  }

  function clearSelectedVideo(
    field:
      BrochureVideoField,
  ) {
    const previewUrl =
      videoPreviews[
        field
      ];

    if (
      previewUrl
    ) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setVideoFiles(
      currentFiles => ({
        ...currentFiles,

        [field]:
          null,
      }),
    );

    setVideoPreviews(
      currentPreviews => ({
        ...currentPreviews,

        [field]:
          null,
      }),
    );
  }  

  async function uploadImage(
    field:
      BrochureImageField,

    file:
      File,
  ): Promise<UploadedBrochureImage> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file,
    );

    setUploadingField(
      field,
    );

    try {
      return await authorizedFetch<
        UploadedBrochureImage
      >(
        '/homepage-brochures/upload-image',
        {
          method:
            'POST',

          body:
            formData,
        },
      );
    } finally {
      setUploadingField(
        null,
      );
    }
  }

  async function uploadVideo(
    field:
      BrochureVideoField,

    file:
      File,
  ): Promise<UploadedBrochureVideo> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file,
    );

    setUploadingField(
      field,
    );

    try {
      return await authorizedFetch<
        UploadedBrochureVideo
      >(
        '/homepage-brochures/upload-video',
        {
          method:
            'POST',

          body:
            formData,
        },
      );
    } finally {
      setUploadingField(
        null,
      );
    }
  }

  function validateForm():
    string | null
  {
    if (
      !form.internalName
        .trim()
    ) {
      return 'Renseigne un nom interne pour identifier la brochure dans l’administration.';
    }

    if (
      form.mediaType ===
      'IMAGE'
    ) {
      const hasFrenchDesktop =
        Boolean(
          files
            .desktopImageFr ||
          form
            .desktopImageFrUrl,
        );

      const hasEnglishDesktop =
        Boolean(
          files
            .desktopImageEn ||
          form
            .desktopImageEnUrl,
        );

      if (
        form.isActive &&
        !hasFrenchDesktop &&
        !hasEnglishDesktop
      ) {
        return 'Une brochure image active doit contenir au moins une image desktop en français ou en anglais.';
      }
    }

    if (
      form.mediaType ===
      'VIDEO'
    ) {
      const hasFrenchDesktop =
        Boolean(
          videoFiles
            .desktopVideoFr ||
          form
            .desktopVideoFrUrl,
        );

      const hasEnglishDesktop =
        Boolean(
          videoFiles
            .desktopVideoEn ||
          form
            .desktopVideoEnUrl,
        );

      if (
        form.isActive &&
        !hasFrenchDesktop &&
        !hasEnglishDesktop
      ) {
        return 'Une brochure vidéo active doit contenir au moins une vidéo desktop en français ou en anglais.';
      }
    }

    if (
      form.linkUrl
        .trim()
    ) {
      try {
        const url =
          new URL(
            form.linkUrl
              .trim(),
          );

        if (
          ![
            'http:',
            'https:',
          ].includes(
            url.protocol,
          )
        ) {
          return 'Le lien doit commencer par http:// ou https://.';
        }
      } catch {
        return 'Le lien cliquable n’est pas une URL valide.';
      }
    }

    const parsedSortOrder =
      Number(
        form.sortOrder,
      );

    if (
      !Number.isInteger(
        parsedSortOrder,
      ) ||
      parsedSortOrder <
        0
    ) {
      return 'L’ordre d’affichage doit être un nombre entier positif ou égal à zéro.';
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formError =
      validateForm();

    if (
      formError
    ) {
      setValidationError(
        formError,
      );

      return;
    }

    setValidationError(
      null,
    );

    setFeedback(
      null,
    );

    setIsSubmitting(
      true,
    );

    try {
      const uploadedUrls = {
        desktopImageFrUrl:
          form.desktopImageFrUrl,

        mobileImageFrUrl:
          form.mobileImageFrUrl,

        desktopImageEnUrl:
          form.desktopImageEnUrl,

        mobileImageEnUrl:
          form.mobileImageEnUrl,

        desktopVideoFrUrl:
          form.desktopVideoFrUrl,

        mobileVideoFrUrl:
          form.mobileVideoFrUrl,

        desktopVideoEnUrl:
          form.desktopVideoEnUrl,

        mobileVideoEnUrl:
          form.mobileVideoEnUrl,
      };

      const submittedCrops:
        BrochureCropState = {
          ...crops,
        };

      for (
        const config of
        IMAGE_FIELD_CONFIG
      ) {
        const file =
          files[
            config.field
          ];

        if (
          !file
        ) {
          continue;
        }

        const uploadedImage =
          await uploadImage(
            config.field,
            file,
          );

        uploadedUrls[
          config.formUrlField
        ] =
          uploadedImage.url;

        const currentCrop =
          submittedCrops[
            config.field
          ];

        if (
          currentCrop
        ) {
          submittedCrops[
            config.field
          ] = {
            ...currentCrop,

            naturalWidth:
              uploadedImage.width ??
              currentCrop.naturalWidth,

            naturalHeight:
              uploadedImage.height ??
              currentCrop.naturalHeight,
          };
        }
      }

      for (
        const config of
        VIDEO_FIELD_CONFIG
      ) {
        const file =
          videoFiles[
            config.field
          ];

        if (
          !file
        ) {
          continue;
        }

        const uploadedVideo =
          await uploadVideo(
            config.field,
            file,
          );

        uploadedUrls[
          config.formUrlField
        ] =
          uploadedVideo.url;
      }

      const payload = {
        internalName:
          form.internalName
            .trim(),

        mediaType:
          form.mediaType,            

        desktopImageFrUrl:
          uploadedUrls
            .desktopImageFrUrl ||
          undefined,

        mobileImageFrUrl:
          uploadedUrls
            .mobileImageFrUrl ||
          undefined,

        desktopImageEnUrl:
          uploadedUrls
            .desktopImageEnUrl ||
          undefined,

        mobileImageEnUrl:
          uploadedUrls
            .mobileImageEnUrl ||
          undefined,

        desktopVideoFrUrl:
          uploadedUrls
            .desktopVideoFrUrl ||
          undefined,

        mobileVideoFrUrl:
          uploadedUrls
            .mobileVideoFrUrl ||
          undefined,

        desktopVideoEnUrl:
          uploadedUrls
            .desktopVideoEnUrl ||
          undefined,

        mobileVideoEnUrl:
          uploadedUrls
            .mobileVideoEnUrl ||
          undefined,          

        desktopImageFrCrop:
          submittedCrops
            .desktopImageFr ??
          undefined,

        mobileImageFrCrop:
          submittedCrops
            .mobileImageFr ??
          undefined,

        desktopImageEnCrop:
          submittedCrops
            .desktopImageEn ??
          undefined,

        mobileImageEnCrop:
          submittedCrops
            .mobileImageEn ??
          undefined,

        altTextFr:
          form.altTextFr
            .trim() ||
          undefined,

        altTextEn:
          form.altTextEn
            .trim() ||
          undefined,

        linkUrl:
          form.linkUrl
            .trim() ||
          undefined,

        linkTarget:
          form.linkTarget,

        sortOrder:
          Number(
            form.sortOrder,
          ),

        isActive:
          form.isActive,
      };

      if (
        editingBrochureId
      ) {
        await authorizedFetch<
          HomepageBrochure
        >(
          `/homepage-brochures/${editingBrochureId}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      } else {
        await authorizedFetch<
          HomepageBrochure
        >(
          '/homepage-brochures',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      }

      await loadBrochures();

      const wasEditing =
        Boolean(
          editingBrochureId,
        );

      closeForm();

      setFeedback({
        type:
          'success',

        message:
          wasEditing
            ? 'La brochure a été mise à jour.'
            : 'La brochure a été créée.',
      });
    } catch (
      error
    ) {
      setFeedback({
        type:
          'error',

        message:
          getErrorMessage(
            error,
          ),
      });
    } finally {
      setIsSubmitting(
        false,
      );

      setUploadingField(
        null,
      );
    }
  }

  async function handleDelete(
    brochure:
      HomepageBrochure,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer définitivement la brochure « ${brochure.internalName} » ? Les images associées seront également supprimées.`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingId(
      brochure.id,
    );

    setFeedback(
      null,
    );

    try {
      await authorizedFetch<{
        success:
          boolean;
      }>(
        `/homepage-brochures/${brochure.id}`,
        {
          method:
            'DELETE',
        },
      );

      setBrochures(
        currentBrochures =>
          currentBrochures.filter(
            currentBrochure =>
              currentBrochure.id !==
              brochure.id,
          ),
      );

      if (
        editingBrochureId ===
        brochure.id
      ) {
        closeForm();
      }

      setFeedback({
        type:
          'success',

        message:
          'La brochure a été supprimée.',
      });
    } catch (
      error
    ) {
      setFeedback({
        type:
          'error',

        message:
          getErrorMessage(
            error,
          ),
      });
    } finally {
      setDeletingId(
        null,
      );
    }
  }

  async function moveBrochure(
    brochureId:
      string,

    direction:
      'up' |
      'down',
  ) {
    const currentIndex =
      brochures.findIndex(
        brochure =>
          brochure.id ===
          brochureId,
      );

    if (
      currentIndex <
      0
    ) {
      return;
    }

    const targetIndex =
      direction ===
      'up'
        ? currentIndex -
          1
        : currentIndex +
          1;

    if (
      targetIndex <
        0 ||
      targetIndex >=
        brochures.length
    ) {
      return;
    }

    const reorderedBrochures =
      [
        ...brochures,
      ];

    const [
      movedBrochure,
    ] =
      reorderedBrochures.splice(
        currentIndex,
        1,
      );

    reorderedBrochures.splice(
      targetIndex,
      0,
      movedBrochure,
    );

    const normalizedBrochures =
      reorderedBrochures.map(
        (
          brochure,
          index,
        ) => ({
          ...brochure,

          sortOrder:
            index,
        }),
      );

    setBrochures(
      normalizedBrochures,
    );

    setReorderingId(
      brochureId,
    );

    setFeedback(
      null,
    );

    try {
      const response =
        await authorizedFetch<
          HomepageBrochure[]
        >(
          '/homepage-brochures/reorder',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                items:
                  normalizedBrochures.map(
                    (
                      brochure,
                      index,
                    ) => ({
                      id:
                        brochure.id,

                      sortOrder:
                        index,
                    }),
                  ),
              }),
          },
        );

      setBrochures(
        response,
      );

      setFeedback({
        type:
          'success',

        message:
          'L’ordre des brochures a été enregistré.',
      });
    } catch (
      error
    ) {
      await loadBrochures();

      setFeedback({
        type:
          'error',

        message:
          getErrorMessage(
            error,
          ),
      });
    } finally {
      setReorderingId(
        null,
      );
    }
  }

  async function toggleActive(
    brochure:
      HomepageBrochure,
  ) {
    setFeedback(
      null,
    );

    try {
      const updatedBrochure =
        await authorizedFetch<
          HomepageBrochure
        >(
          `/homepage-brochures/${brochure.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                isActive:
                  !brochure
                    .isActive,
              }),
          },
        );

      setBrochures(
        currentBrochures =>
          currentBrochures.map(
            currentBrochure =>
              currentBrochure.id ===
              brochure.id
                ? updatedBrochure
                : currentBrochure,
          ),
      );

      setFeedback({
        type:
          'success',

        message:
          updatedBrochure
            .isActive
            ? 'La brochure est maintenant visible sur le site.'
            : 'La brochure a été masquée du site.',
      });
    } catch (
      error
    ) {
      setFeedback({
        type:
          'error',

        message:
          getErrorMessage(
            error,
          ),
      });
    }
  }

  return (
    <>
      <section className="admin-brochures">
        <header className="admin-brochures__header">
          <div>
            <p className="admin-brochures__eyebrow">
              Page d’accueil
            </p>

            <h1>
              Brochures
            </h1>

            <p className="admin-brochures__description">
              Gérez les visuels affichés en première section de la page d’accueil. Les images sont automatiquement converties en WebP.
            </p>
          </div>

          <button
            type="button"
            className="admin-brochures__create"
            disabled={
              isSubmitting
            }
            onClick={
              openCreateForm
            }
          >
            <Plus
              size={
                19
              }
              aria-hidden="true"
            />

            Ajouter une brochure
          </button>
        </header>

        {
          feedback
            ? (
                <div
                  className="admin-brochures__feedback"
                  data-type={
                    feedback.type
                  }
                  role={
                    feedback.type ===
                    'error'
                      ? 'alert'
                      : 'status'
                  }
                >
                  {
                    feedback.message
                  }

                  <button
                    type="button"
                    aria-label="Fermer le message"
                    onClick={
                      () =>
                        setFeedback(
                          null,
                        )
                    }
                  >
                    <X
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )
            : null
        }

        {
          isFormOpen
            ? (
                <form
                  className="admin-brochure-form"
                  onSubmit={
                    handleSubmit
                  }
                >
                  <div className="admin-brochure-form__header">
                    <div>
                      <p>
                        {
                          editingBrochure
                            ? 'Modification'
                            : 'Nouvelle brochure'
                        }
                      </p>

                      <h2>
                        {
                          editingBrochure
                            ? editingBrochure
                                .internalName
                            : 'Ajouter un visuel à la page d’accueil'
                        }
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="admin-brochure-form__close"
                      disabled={
                        isSubmitting
                      }
                      aria-label="Fermer le formulaire"
                      onClick={
                        closeForm
                      }
                    >
                      <X
                        size={
                          21
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="admin-brochure-form__section">
                    <div className="admin-brochure-form__section-heading">
                      <span>
                        1
                      </span>

                      <div>
                        <h3>
                          Identification
                        </h3>

                        <p>
                          Le nom interne est visible uniquement dans l’administration.
                        </p>
                      </div>
                    </div>

                    <div className="admin-brochure-form__grid admin-brochure-form__grid--two">
                      <label className="admin-brochure-field">
                        <span>
                          Nom interne

                          <strong>
                            *
                          </strong>
                        </span>

                        <input
                          type="text"
                          value={
                            form.internalName
                          }
                          maxLength={
                            150
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="Ex. Campagne transformation digitale"
                          onChange={
                            event =>
                              updateFormField(
                                'internalName',
                                event
                                  .target
                                  .value,
                              )
                          }
                        />
                      </label>

                      <label className="admin-brochure-field">
                        <span>
                          Ordre d’affichage
                        </span>

                        <input
                          type="number"
                          min={
                            0
                          }
                          step={
                            1
                          }
                          value={
                            form.sortOrder
                          }
                          disabled={
                            isSubmitting
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'sortOrder',
                                event
                                  .target
                                  .value,
                              )
                          }
                        />

                        <small>
                          Tu pourras aussi ajuster l’ordre avec les flèches dans la liste.
                        </small>
                      </label>
                    </div>
                  </div>

                  <div className="admin-brochure-form__section">
                    <div className="admin-brochure-form__section-heading">
                      <span>
                        2
                      </span>

                      <div>
                        <h3>
                          Média de la brochure
                        </h3>

                        <p>
                          Choisis le type de média, puis importe les versions adaptées aux écrans desktop et mobile.
                        </p>
                      </div>
                    </div>

                    <div
                      className="admin-brochure-media-type"
                      role="radiogroup"
                      aria-label="Type de média"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={
                          form.mediaType ===
                          'IMAGE'
                        }
                        data-active={
                          form.mediaType ===
                          'IMAGE'
                        }
                        disabled={
                          isSubmitting
                        }
                        onClick={
                          () =>
                            updateFormField(
                              'mediaType',
                              'IMAGE',
                            )
                        }
                      >
                        <span className="admin-brochure-media-type__icon">
                          <ImageIcon
                            size={
                              22
                            }
                            aria-hidden="true"
                          />
                        </span>

                        <span>
                          <strong>
                            Image
                          </strong>

                          <small>
                            Défilement automatique selon le délai du carrousel.
                          </small>
                        </span>
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={
                          form.mediaType ===
                          'VIDEO'
                        }
                        data-active={
                          form.mediaType ===
                          'VIDEO'
                        }
                        disabled={
                          isSubmitting
                        }
                        onClick={
                          () =>
                            updateFormField(
                              'mediaType',
                              'VIDEO',
                            )
                        }
                      >
                        <span className="admin-brochure-media-type__icon">
                          <Film
                            size={
                              22
                            }
                            aria-hidden="true"
                          />
                        </span>

                        <span>
                          <strong>
                            Vidéo
                          </strong>

                          <small>
                            Passage à la brochure suivante à la fin de la vidéo.
                          </small>
                        </span>
                      </button>
                    </div>

                    <div className="admin-brochure-form__media-summary">
                      <div>
                        <strong>
                          {
                            form.mediaType ===
                            'VIDEO'
                              ? 'Importer les vidéos'
                              : 'Importer les images'
                          }
                        </strong>

                        <span>
                          {
                            form.mediaType ===
                            'VIDEO'
                              ? 'MP4 ou WebM, maximum 100 Mo par fichier.'
                              : 'JPEG, PNG, WebP ou AVIF.'
                          }
                        </span>
                      </div>

                      <div>
                        <span>
                          FR
                        </span>

                        <span>
                          EN / AR
                        </span>

                        <span>
                          Desktop
                        </span>

                        <span>
                          Mobile
                        </span>
                      </div>
                    </div>

                    <div className="admin-brochure-form__language-note">
                      <span>
                        La version française utilise en priorité le média FR.
                      </span>

                      <span>
                        Les versions anglaise et arabe utilisent en priorité le média EN.
                      </span>

                      <span>
                        Si une version manque, le média disponible est utilisé automatiquement.
                      </span>
                    </div>

                    <div className="admin-brochure-form__uploads">
                      {
                        form.mediaType ===
                        'IMAGE'
                          ? IMAGE_FIELD_CONFIG.map(
                              config => (
                                <BrochureImageUpload
                                  key={
                                    config.field
                                  }
                                  config={
                                    config
                                  }
                                  file={
                                    files[
                                      config.field
                                    ]
                                  }
                                  previewUrl={
                                    previews[
                                      config.field
                                    ]
                                  }
                                  existingUrl={
                                    form[
                                      config.formUrlField
                                    ]
                                  }
                                  crop={
                                    crops[
                                      config.field
                                    ]
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  onChange={
                                    handleFileChange
                                  }
                                  onClearSelection={
                                    clearSelectedFile
                                  }
                                  onEditCrop={
                                    openCropEditor
                                  }
                                />
                              ),
                            )
                          : VIDEO_FIELD_CONFIG.map(
                              config => (
                                <BrochureVideoUpload
                                  key={
                                    config.field
                                  }
                                  config={
                                    config
                                  }
                                  file={
                                    videoFiles[
                                      config.field
                                    ]
                                  }
                                  previewUrl={
                                    videoPreviews[
                                      config.field
                                    ]
                                  }
                                  existingUrl={
                                    form[
                                      config.formUrlField
                                    ]
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  onChange={
                                    handleVideoFileChange
                                  }
                                  onClearSelection={
                                    clearSelectedVideo
                                  }
                                />
                              ),
                            )
                      }
                    </div>
                  </div>

                  <div className="admin-brochure-form__section">
                    <div className="admin-brochure-form__section-heading">
                      <span>
                        3
                      </span>

                      <div>
                        <h3>
                          Lien cliquable
                        </h3>

                        <p>
                          Cette partie est facultative. Toute la brochure deviendra cliquable lorsqu’un lien est renseigné.
                        </p>
                      </div>
                    </div>

                    <div className="admin-brochure-form__grid admin-brochure-form__grid--link">
                      <label className="admin-brochure-field">
                        <span>
                          URL de destination
                        </span>

                        <input
                          type="url"
                          value={
                            form.linkUrl
                          }
                          disabled={
                            isSubmitting
                          }
                          placeholder="https://www.exemple.com/page"
                          onChange={
                            event =>
                              updateFormField(
                                'linkUrl',
                                event
                                  .target
                                  .value,
                              )
                          }
                        />

                        <small>
                          Le lien doit commencer par http:// ou https://.
                        </small>
                      </label>

                      <label className="admin-brochure-field">
                        <span>
                          Ouverture du lien
                        </span>

                        <select
                          value={
                            form.linkTarget
                          }
                          disabled={
                            isSubmitting ||
                            !form.linkUrl
                              .trim()
                          }
                          onChange={
                            event =>
                              updateFormField(
                                'linkTarget',
                                event
                                  .target
                                  .value as
                                  '_self' |
                                  '_blank',
                              )
                          }
                        >
                          <option value="_self">
                            Dans la même fenêtre
                          </option>

                          <option value="_blank">
                            Dans un nouvel onglet
                          </option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="admin-brochure-form__section">
                    <div className="admin-brochure-form__section-heading">
                      <span>
                        4
                      </span>

                      <div>
                        <h3>
                          Publication
                        </h3>

                        <p>
                          Une brochure inactive reste enregistrée, mais n’apparaît pas sur le site.
                        </p>
                      </div>
                    </div>

                    <label className="admin-brochure-switch">
                      <input
                        type="checkbox"
                        checked={
                          form.isActive
                        }
                        disabled={
                          isSubmitting
                        }
                        onChange={
                          event =>
                            updateFormField(
                              'isActive',
                              event
                                .target
                                .checked,
                            )
                        }
                      />

                      <span className="admin-brochure-switch__track">
                        <span />
                      </span>

                      <span className="admin-brochure-switch__copy">
                        <strong>
                          Publier cette brochure
                        </strong>

                        <small>
                          Elle sera visible dans le carrousel de la page d’accueil.
                        </small>
                      </span>
                    </label>
                  </div>

                  {
                    validationError
                      ? (
                          <div
                            className="admin-brochure-form__error"
                            role="alert"
                          >
                            {
                              validationError
                            }
                          </div>
                        )
                      : null
                  }

                  <div className="admin-brochure-form__footer">
                    <button
                      type="button"
                      className="admin-brochure-form__secondary"
                      disabled={
                        isSubmitting
                      }
                      onClick={
                        closeForm
                      }
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      className="admin-brochure-form__submit"
                      disabled={
                        isSubmitting
                      }
                    >
                      {
                        isSubmitting
                          ? (
                              <LoaderCircle
                                size={
                                  18
                                }
                                className="admin-spinner"
                                aria-hidden="true"
                              />
                            )
                          : (
                              <Save
                                size={
                                  18
                                }
                                aria-hidden="true"
                              />
                            )
                      }

                      {
                        uploadingField
                          ? 'Conversion et import de l’image…'
                          : isSubmitting
                            ? 'Enregistrement…'
                            : editingBrochureId
                              ? 'Enregistrer les modifications'
                              : 'Créer la brochure'
                      }
                    </button>
                  </div>
                </form>
              )
            : null
        }

        <div className="admin-brochures__list-heading">
          <div>
            <h2>
              Brochures enregistrées
            </h2>

            <p>
              {
                brochures.length
              }

              {
                brochures.length >
                1
                  ? ' brochures'
                  : ' brochure'
              }
            </p>
          </div>

          <p>
            La première brochure active de la liste est affichée en premier sur la page d’accueil.
          </p>
        </div>

        {
          isLoading
            ? (
                <div className="admin-brochures__loading">
                  <LoaderCircle
                    size={
                      30
                    }
                    className="admin-spinner"
                    aria-hidden="true"
                  />

                  Chargement des brochures…
                </div>
              )
            : brochures.length ===
                0
              ? (
                  <div className="admin-brochures__empty">
                    <div>
                      <Images
                        size={
                          34
                        }
                        aria-hidden="true"
                      />
                    </div>

                    <h2>
                      Aucune brochure
                    </h2>

                    <p>
                      Ajoute le premier visuel qui accueillera les visiteurs dès leur arrivée sur le site.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openCreateForm
                      }
                    >
                      <Plus
                        size={
                          18
                        }
                        aria-hidden="true"
                      />

                      Ajouter la première brochure
                    </button>
                  </div>
                )
              : (
                  <div className="admin-brochures__list">
                    {
                      brochures.map(
                        (
                          brochure,
                          index,
                        ) => {
                          const previewUrl =
                            getPrimaryPreview(
                              brochure,
                            );

                          const languageAvailability =
                            getLanguageAvailability(
                              brochure,
                            );

                          const isReordering =
                            reorderingId ===
                            brochure.id;

                          const isDeleting =
                            deletingId ===
                            brochure.id;

                          return (
                            <article
                              key={
                                brochure.id
                              }
                              className="admin-brochure-card"
                              data-active={
                                brochure.isActive
                              }
                            >
                              <div className="admin-brochure-card__order">
                                <strong>
                                  {
                                    index +
                                    1
                                  }
                                </strong>

                                <div>
                                  <button
                                    type="button"
                                    aria-label="Déplacer la brochure vers le haut"
                                    disabled={
                                      index ===
                                        0 ||
                                      Boolean(
                                        reorderingId,
                                      )
                                    }
                                    onClick={
                                      () =>
                                        void moveBrochure(
                                          brochure.id,
                                          'up',
                                        )
                                    }
                                  >
                                    {
                                      isReordering
                                        ? (
                                            <LoaderCircle
                                              size={
                                                17
                                              }
                                              className="admin-spinner"
                                              aria-hidden="true"
                                            />
                                          )
                                        : (
                                            <ArrowUp
                                              size={
                                                17
                                              }
                                              aria-hidden="true"
                                            />
                                          )
                                    }
                                  </button>

                                  <button
                                    type="button"
                                    aria-label="Déplacer la brochure vers le bas"
                                    disabled={
                                      index ===
                                        brochures.length -
                                          1 ||
                                      Boolean(
                                        reorderingId,
                                      )
                                    }
                                    onClick={
                                      () =>
                                        void moveBrochure(
                                          brochure.id,
                                          'down',
                                        )
                                    }
                                  >
                                    <ArrowDown
                                      size={
                                        17
                                      }
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </div>

                              <div className="admin-brochure-card__preview">
                                {
                                  previewUrl
                                    ? (
                                        <img
                                          src={
                                            previewUrl
                                          }
                                          alt={
                                            brochure
                                              .altTextFr ??
                                            brochure
                                              .altTextEn ??
                                            brochure
                                              .internalName
                                          }
                                        />
                                      )
                                    : (
                                        <Images
                                          size={
                                            32
                                          }
                                          aria-hidden="true"
                                        />
                                      )
                                }

                                <span
                                  className="admin-brochure-card__status"
                                  data-active={
                                    brochure.isActive
                                  }
                                >
                                  {
                                    brochure.isActive
                                      ? 'Publiée'
                                      : 'Masquée'
                                  }
                                </span>
                              </div>

                              <div className="admin-brochure-card__content">
                                <div className="admin-brochure-card__title">
                                  <div>
                                    <h3>
                                      {
                                        brochure.internalName
                                      }
                                    </h3>

                                    <p>
                                      Modifiée le
                                      {' '}

                                      {
                                        formatDate(
                                          brochure.updatedAt,
                                        )
                                      }
                                    </p>
                                  </div>

                                  <div className="admin-brochure-card__languages">
                                    <span
                                      data-available={
                                        languageAvailability.fr
                                      }
                                    >
                                      FR
                                    </span>

                                    <span
                                      data-available={
                                        languageAvailability.en
                                      }
                                    >
                                      EN
                                    </span>

                                    <span
                                      data-available={
                                        languageAvailability.en
                                      }
                                    >
                                      AR
                                    </span>
                                  </div>
                                </div>

                                <div className="admin-brochure-card__details">
                                  <span>
                                    Desktop FR :
                                    {' '}

                                    <strong>
                                      {
                                        brochure
                                          .desktopImageFrUrl
                                          ? 'oui'
                                          : 'non'
                                      }
                                    </strong>
                                  </span>

                                  <span>
                                    Mobile FR :
                                    {' '}

                                    <strong>
                                      {
                                        brochure
                                          .mobileImageFrUrl
                                          ? 'oui'
                                          : 'repli automatique'
                                      }
                                    </strong>
                                  </span>

                                  <span>
                                    Desktop EN :
                                    {' '}

                                    <strong>
                                      {
                                        brochure
                                          .desktopImageEnUrl
                                          ? 'oui'
                                          : 'repli automatique'
                                      }
                                    </strong>
                                  </span>

                                  <span>
                                    Mobile EN :
                                    {' '}

                                    <strong>
                                      {
                                        brochure
                                          .mobileImageEnUrl
                                          ? 'oui'
                                          : 'repli automatique'
                                      }
                                    </strong>
                                  </span>
                                </div>

                                {
                                  brochure.linkUrl
                                    ? (
                                        <a
                                          href={
                                            brochure.linkUrl
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="admin-brochure-card__link"
                                        >
                                          <ExternalLink
                                            size={
                                              15
                                            }
                                            aria-hidden="true"
                                          />

                                          {
                                            brochure.linkUrl
                                          }
                                        </a>
                                      )
                                    : (
                                        <p className="admin-brochure-card__no-link">
                                          Aucun lien cliquable
                                        </p>
                                      )
                                }

                                <div className="admin-brochure-card__actions">
                                  <button
                                    type="button"
                                    className="admin-brochure-card__publish"
                                    data-active={
                                      brochure.isActive
                                    }
                                    disabled={
                                      isDeleting
                                    }
                                    onClick={
                                      () =>
                                        void toggleActive(
                                          brochure,
                                        )
                                    }
                                  >
                                    <span />

                                    {
                                      brochure.isActive
                                        ? 'Masquer'
                                        : 'Publier'
                                    }
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-brochure-card__edit"
                                    disabled={
                                      isDeleting
                                    }
                                    onClick={
                                      () =>
                                        openEditForm(
                                          brochure,
                                        )
                                    }
                                  >
                                    <Pencil
                                      size={
                                        16
                                      }
                                      aria-hidden="true"
                                    />

                                    Modifier
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-brochure-card__delete"
                                    disabled={
                                      isDeleting
                                    }
                                    onClick={
                                      () =>
                                        void handleDelete(
                                          brochure,
                                        )
                                    }
                                  >
                                    {
                                      isDeleting
                                        ? (
                                            <LoaderCircle
                                              size={
                                                16
                                              }
                                              className="admin-spinner"
                                              aria-hidden="true"
                                            />
                                          )
                                        : (
                                            <Trash2
                                              size={
                                                16
                                              }
                                              aria-hidden="true"
                                            />
                                          )
                                    }

                                    Supprimer
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

      {
        cropEditor &&
        cropEditorConfig
          ? (
              <BrochureImageCropModal
                isOpen={
                  true
                }
                imageUrl={
                  cropEditor.imageUrl
                }
                imageLabel={
                  cropEditorConfig.label
                }
                format={
                  cropEditorConfig.format
                }
                initialCrop={
                  cropEditor.crop
                }
                onCancel={
                  cancelCropEditor
                }
                onValidate={
                  validateCropEditor
                }
              />
            )
          : null
      }
    </>
  );
}

type BrochureVideoUploadProps = {
  config:
    (typeof VIDEO_FIELD_CONFIG)[number];

  file:
    File | null;

  previewUrl:
    string | null;

  existingUrl:
    string;

  disabled:
    boolean;

  onChange: (
    field:
      BrochureVideoField,

    event:
      ChangeEvent<HTMLInputElement>,
  ) => void;

  onClearSelection: (
    field:
      BrochureVideoField,
  ) => void;
};

function BrochureVideoUpload({
  config,
  file,
  previewUrl,
  existingUrl,
  disabled,
  onChange,
  onClearSelection,
}: BrochureVideoUploadProps) {
  const displayedUrl =
    previewUrl ||
    existingUrl ||
    null;

  const inputId =
    `brochure-${config.field}`;

  return (
    <article
      className="admin-brochure-upload admin-brochure-upload--video"
      data-format={
        config.format
      }
    >
      <div className="admin-brochure-upload__heading">
        <div>
          <div className="admin-brochure-upload__badges">
            <span>
              {
                config.language
              }
            </span>

            <span>
              {
                config.format ===
                'desktop'
                  ? 'Desktop'
                  : 'Mobile'
              }
            </span>

            <span>
              Vidéo
            </span>
          </div>

          <h3>
            {
              config.label
            }
          </h3>

          <p>
            {
              config.description
            }
          </p>

          <p className="admin-brochure-upload__recommended-size">
            Format recommandé :
            {' '}

            <strong>
              {
                config.format ===
                'desktop'
                  ? '1920 × 800 px'
                  : '1080 × 1635 px'
              }
            </strong>
          </p>
        </div>
      </div>

      <div
        className="admin-brochure-upload__preview"
        data-format={
          config.format
        }
      >
        {
          displayedUrl
            ? (
                <div className="admin-brochure-video-preview">
                  <video
                    src={
                      displayedUrl
                    }
                    muted
                    playsInline
                    controls
                    preload="metadata"
                  />

                  <span className="admin-brochure-video-preview__badge">
                    <Play
                      size={
                        15
                      }
                      aria-hidden="true"
                    />

                    Aperçu vidéo
                  </span>
                </div>
              )
            : (
                <div className="admin-brochure-upload__empty">
                  <Video
                    size={
                      32
                    }
                    aria-hidden="true"
                  />

                  <span>
                    Aucune vidéo sélectionnée
                  </span>
                </div>
              )
        }
      </div>

      <div className="admin-brochure-upload__actions">
        <label
          htmlFor={
            inputId
          }
          className="admin-brochure-upload__button"
          aria-disabled={
            disabled
          }
        >
          <Upload
            size={
              17
            }
            aria-hidden="true"
          />

          <span>
            {
              displayedUrl
                ? 'Remplacer la vidéo'
                : 'Importer une vidéo'
            }
          </span>
        </label>

        <input
          id={
            inputId
          }
          type="file"
          accept="video/mp4,video/webm"
          hidden
          disabled={
            disabled
          }
          onChange={
            event =>
              onChange(
                config.field,
                event,
              )
          }
        />

        {
          file
            ? (
                <button
                  type="button"
                  className="admin-brochure-upload__cancel"
                  disabled={
                    disabled
                  }
                  onClick={
                    () =>
                      onClearSelection(
                        config.field,
                      )
                  }
                >
                  <X
                    size={
                      16
                    }
                    aria-hidden="true"
                  />

                  Annuler
                </button>
              )
            : null
        }
      </div>

      {
        file
          ? (
              <p className="admin-brochure-upload__file">
                <strong>
                  {
                    file.name
                  }
                </strong>

                <span>
                  {
                    formatFileSize(
                      file.size,
                    )
                  }
                </span>

                <span>
                  Import sans conversion
                </span>
              </p>
            )
          : existingUrl
            ? (
                <p className="admin-brochure-upload__file">
                  <Check
                    size={
                      15
                    }
                    aria-hidden="true"
                  />

                  Vidéo déjà enregistrée
                </p>
              )
            : (
                <p className="admin-brochure-upload__recommendation">
                  Formats acceptés : MP4 et WebM. Taille maximale : 100 Mo.
                </p>
              )
      }
    </article>
  );
}