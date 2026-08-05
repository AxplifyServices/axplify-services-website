'use client';

import {
  Archive,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Home,
  LoaderCircle,
  RefreshCcw,
  Save,
  Search,
} from 'lucide-react';

import Link from 'next/link';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  toast,
} from 'sonner';

import {
  useAuth,
} from '@/components/admin/auth-provider';

import {
  PublicationMediaManager,
} from '@/components/admin/publication-media-manager';

import type {
  PublicationMediaItem,
} from '@/components/admin/publication-media-manager';

import {
  PublicationRichTextEditor,
} from '@/components/admin/publication-rich-text-editor';

import {
  AdminApiError,
} from '@/lib/admin-api';

const PUBLICATION_CONTENT_TYPES = [
  'ARTICLE',
  'CASE_STUDY',
  'NEWS',
  'EVENT',
  'PRESS_RELEASE',
  'ANNOUNCEMENT',
  'GUIDE',
  'RESOURCE',
] as const;

type PublicationContentType =
  (typeof PUBLICATION_CONTENT_TYPES)[number];

const EXPERTISE_CODES = [
  'digital',
  'automation',
  'data',
  'ai',
  'crm',
  'architecture',
  'analytics',
  'leadGeneration',
  'marketingStrategy',
] as const;

type ExpertiseCode =
  (typeof EXPERTISE_CODES)[number];

type StoredLocale =
  | 'fr'
  | 'en';

type EventLocationType =
  | 'PHYSICAL'
  | 'ONLINE'
  | 'HYBRID';

type EventStatus =
  | 'UPCOMING'
  | 'REGISTRATION_OPEN'
  | 'FULL'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'POSTPONED';

type PublicationState =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';  

type PublicationTranslationResponse = {
  id:
    string;

  locale:
    StoredLocale;

  title:
    string;

  slug:
    string;

  excerpt:
    string | null;

  body:
    string | null;

  coverAltText:
    string | null;

  seoTitle:
    string | null;

  seoDescription:
    string | null;

  canonicalUrl:
    string | null;
};

type PublicationResponse = {
  id:
    string;

  contentType:
    PublicationContentType;

  status:
    'DRAFT' |
    'PUBLISHED' |
    'ARCHIVED';

  state:
    PublicationState;

  isFeatured:
    boolean;

  featuredSortOrder:
    number;

  allowIndexing:
    boolean;

  event: {
    startAt:
      string | null;

    endAt:
      string | null;

    timezone:
      string | null;

    locationType:
      EventLocationType | null;

    locationName:
      string | null;

    address:
      string | null;

    onlineUrl:
      string | null;

    registrationUrl:
      string | null;

    registrationDeadline:
      string | null;

    capacity:
      number | null;

    status:
      EventStatus | null;
  };

  translations:
    PublicationTranslationResponse[];

  media:
    Array<{
      id:
        string;

      mediaType:
        'IMAGE' |
        'VIDEO';

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
        Array<{
          id:
            string;

          locale:
            StoredLocale;

          altText:
            string | null;

          caption:
            string | null;
        }>;
    }>;

  expertiseCodes:
    ExpertiseCode[];

  projects:
    Array<{
      id:
        string;

      titleFr:
        string;

      titleEn:
        string | null;

      status:
        string;
    }>;

  scheduledAt:
    string | null;

  publishedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type TranslationFormState = {
  enabled:
    boolean;

  title:
    string;

  slug:
    string;

  excerpt:
    string;

  body:
    string;

  coverAltText:
    string;

  seoTitle:
    string;

  seoDescription:
    string;

  canonicalUrl:
    string;
};

type PublicationFormState = {
  contentType:
    PublicationContentType;

  isFeatured:
    boolean;

  featuredSortOrder:
    string;

  allowIndexing:
    boolean;

  expertiseCodes:
    ExpertiseCode[];

  media:
    PublicationMediaItem[];

  translations: {
    fr:
      TranslationFormState;

    en:
      TranslationFormState;
  };

  eventStartAt:
    string;

  eventEndAt:
    string;

  eventTimezone:
    string;

  eventLocationType:
    EventLocationType;

  eventLocationName:
    string;

  eventAddress:
    string;

  eventOnlineUrl:
    string;

  eventRegistrationUrl:
    string;

  eventRegistrationDeadline:
    string;

  eventCapacity:
    string;

  eventStatus:
    EventStatus;
};

type PublicationEditorProps = {
  publicationId?:
    string;
};

const CONTENT_TYPE_LABELS:
  Record<
    PublicationContentType,
    string
  > = {
    ARTICLE:
      'Article',

    CASE_STUDY:
      'Cas d’étude',

    NEWS:
      'Actualité',

    EVENT:
      'Événement',

    PRESS_RELEASE:
      'Communiqué',

    ANNOUNCEMENT:
      'Annonce',

    GUIDE:
      'Guide',

    RESOURCE:
      'Ressource',
  };

const EXPERTISE_LABELS:
  Record<
    ExpertiseCode,
    string
  > = {
    digital:
      'Sites, applications et plateformes',

    automation:
      'Automatisation des processus',

    data:
      'Exploitation des données',

    ai:
      'Intelligence artificielle',

    crm:
      'CRM et outils métiers',

    architecture:
      'Architecture et infrastructure',

    analytics:
      'Tableaux de bord et analytics',

    leadGeneration:
      'Génération de prospects',

    marketingStrategy:
      'Stratégie marketing',
  };

const EVENT_STATUS_LABELS:
  Record<
    EventStatus,
    string
  > = {
    UPCOMING:
      'À venir',

    REGISTRATION_OPEN:
      'Inscriptions ouvertes',

    FULL:
      'Complet',

    ONGOING:
      'En cours',

    COMPLETED:
      'Terminé',

    CANCELLED:
      'Annulé',

    POSTPONED:
      'Reporté',
  };

const PUBLICATION_STATE_LABELS:
  Record<
    PublicationState,
    string
  > = {
    DRAFT:
      'Brouillon',

    SCHEDULED:
      'Programmée',

    PUBLISHED:
      'Publiée',

    ARCHIVED:
      'Archivée',
  };  

function createEmptyTranslation({
  enabled,
}: {
  enabled:
    boolean;
}): TranslationFormState {
  return {
    enabled,

    title:
      '',

    slug:
      '',

    excerpt:
      '',

    body:
      '',

    coverAltText:
      '',

    seoTitle:
      '',

    seoDescription:
      '',

    canonicalUrl:
      '',
  };
}

function createInitialForm():
  PublicationFormState
{
  return {
    contentType:
      'ARTICLE',

    isFeatured:
      false,

    featuredSortOrder:
      '0',

    allowIndexing:
      true,

    expertiseCodes:
      [],

    media:
      [],

    translations: {
      fr:
        createEmptyTranslation({
          enabled:
            true,
        }),

      en:
        createEmptyTranslation({
          enabled:
            false,
        }),
    },

    eventStartAt:
      '',

    eventEndAt:
      '',

    eventTimezone:
      'Africa/Casablanca',

    eventLocationType:
      'PHYSICAL',

    eventLocationName:
      '',

    eventAddress:
      '',

    eventOnlineUrl:
      '',

    eventRegistrationUrl:
      '',

    eventRegistrationDeadline:
      '',

    eventCapacity:
      '',

    eventStatus:
      'UPCOMING',
  };
}

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

  return 'Une erreur est survenue.';
}

function slugify(
  value:
    string,
) {
  return value
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    );
}

function toDateTimeLocal(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return '';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const timezoneOffset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
    timezoneOffset,
  )
    .toISOString()
    .slice(
      0,
      16,
    );
}

function toIsoString(
  value:
    string,
) {
  return value
    ? new Date(
        value,
      ).toISOString()
    : undefined;
}

function mapTranslation(
  translation:
    PublicationTranslationResponse |
    undefined,

  enabled:
    boolean,
): TranslationFormState {
  return {
    enabled,

    title:
      translation?.title ??
      '',

    slug:
      translation?.slug ??
      '',

    excerpt:
      translation?.excerpt ??
      '',

    body:
      translation?.body ??
      '',

    coverAltText:
      translation?.coverAltText ??
      '',

    seoTitle:
      translation?.seoTitle ??
      '',

    seoDescription:
      translation?.seoDescription ??
      '',

    canonicalUrl:
      translation?.canonicalUrl ??
      '',
  };
}

function mapPublicationMedia(
  media:
    PublicationResponse['media'],
): PublicationMediaItem[] {
  return media
    .slice()
    .sort(
      (
        first,
        second,
      ) =>
        first.sortOrder -
        second.sortOrder,
    )
    .map(
      item => ({
        id:
          item.id,

        mediaType:
          item.mediaType,

        mediaUrl:
          item.mediaUrl,

        posterUrl:
          item.posterUrl,

        posterFrameSeconds:
          item.posterFrameSeconds,

        isCardCover:
          item.isCardCover,

        sortOrder:
          item.sortOrder,

        width:
          item.width,

        height:
          item.height,

        durationSeconds:
          item.durationSeconds,

        translations: [
          {
            locale:
              'fr',

            altText:
              item.translations.find(
                translation =>
                  translation.locale ===
                  'fr',
              )?.altText ??
              '',

            caption:
              item.translations.find(
                translation =>
                  translation.locale ===
                  'fr',
              )?.caption ??
              '',
          },

          {
            locale:
              'en',

            altText:
              item.translations.find(
                translation =>
                  translation.locale ===
                  'en',
              )?.altText ??
              '',

            caption:
              item.translations.find(
                translation =>
                  translation.locale ===
                  'en',
              )?.caption ??
              '',
          },
        ],
      }),
    );
}

export function PublicationEditor({
  publicationId,
}: PublicationEditorProps) {
  const router =
    useRouter();

  const {
    authorizedFetch,
  } =
    useAuth();

  const isEditing =
    Boolean(
      publicationId,
    );

  const [
    form,
    setForm,
  ] =
    useState<PublicationFormState>(
      createInitialForm,
    );

  const [
    activeLocale,
    setActiveLocale,
  ] =
    useState<StoredLocale>(
      'fr',
    );

  const [
    publication,
    setPublication,
  ] =
    useState<PublicationResponse | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      isEditing,
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );

  const [
    isWorkflowBusy,
    setIsWorkflowBusy,
  ] =
    useState(
      false,
    );

  const [
    scheduledAt,
    setScheduledAt,
  ] =
    useState(
      '',
    );    

  const activeTranslation =
    form.translations[
      activeLocale
    ];

  const isEvent =
    form.contentType ===
    'EVENT';

  const canSave =
    useMemo(
      () =>
        form.translations.fr.enabled ||
        form.translations.en.enabled,
      [
        form.translations.en.enabled,
        form.translations.fr.enabled,
      ],
    );

  const loadPublication =
    useCallback(
      async () => {
        if (
          !publicationId
        ) {
          return;
        }

        setIsLoading(
          true,
        );

        try {
          const response =
            await authorizedFetch<
              PublicationResponse
            >(
              `/publications/admin/${publicationId}`,
            );

          const frenchTranslation =
            response.translations.find(
              translation =>
                translation.locale ===
                'fr',
            );

          const englishTranslation =
            response.translations.find(
              translation =>
                translation.locale ===
                'en',
            );

          setPublication(
            response,
          );

          setForm({
            contentType:
              response.contentType,

            isFeatured:
              response.isFeatured,

            featuredSortOrder:
              String(
                response.featuredSortOrder,
              ),

            allowIndexing:
              response.allowIndexing,

            expertiseCodes:
              response.expertiseCodes,

            media:
              mapPublicationMedia(
                response.media,
              ),

            translations: {
              fr:
                mapTranslation(
                  frenchTranslation,
                  Boolean(
                    frenchTranslation,
                  ),
                ),

              en:
                mapTranslation(
                  englishTranslation,
                  Boolean(
                    englishTranslation,
                  ),
                ),
            },

            eventStartAt:
              toDateTimeLocal(
                response.event.startAt,
              ),

            eventEndAt:
              toDateTimeLocal(
                response.event.endAt,
              ),

            eventTimezone:
              response.event.timezone ??
              'Africa/Casablanca',

            eventLocationType:
              response.event.locationType ??
              'PHYSICAL',

            eventLocationName:
              response.event.locationName ??
              '',

            eventAddress:
              response.event.address ??
              '',

            eventOnlineUrl:
              response.event.onlineUrl ??
              '',

            eventRegistrationUrl:
              response.event.registrationUrl ??
              '',

            eventRegistrationDeadline:
              toDateTimeLocal(
                response.event.registrationDeadline,
              ),

            eventCapacity:
              response.event.capacity
                ? String(
                    response.event.capacity,
                  )
                : '',

            eventStatus:
              response.event.status ??
              'UPCOMING',
          });

          setActiveLocale(
            frenchTranslation
              ? 'fr'
              : 'en',
          );

          setScheduledAt(
            toDateTimeLocal(
              response.scheduledAt,
            ),
          );

        } catch (
          error
        ) {
          toast.error(
            getErrorMessage(
              error,
            ),
          );

          router.replace(
            '/admin/publications',
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        authorizedFetch,
        publicationId,
        router,
      ],
    );

  useEffect(
    () => {
      void loadPublication();
    },
    [
      loadPublication,
    ],
  );

  function updateTranslation(
    locale:
      StoredLocale,

    field:
      keyof Omit<
        TranslationFormState,
        'enabled'
      >,

    value:
      string,
  ) {
    setForm(
      current => ({
        ...current,

        translations: {
          ...current.translations,

          [locale]: {
            ...current.translations[
              locale
            ],

            [field]:
              value,
          },
        },
      }),
    );
  }

  function updateTranslationEnabled(
    locale:
      StoredLocale,

    enabled:
      boolean,
  ) {
    setForm(
      current => ({
        ...current,

        translations: {
          ...current.translations,

          [locale]: {
            ...current.translations[
              locale
            ],

            enabled,
          },
        },
      }),
    );

    if (
      enabled
    ) {
      setActiveLocale(
        locale,
      );
    } else if (
      activeLocale ===
      locale
    ) {
      setActiveLocale(
        locale ===
          'fr'
          ? 'en'
          : 'fr',
      );
    }
  }

  function toggleExpertise(
    expertise:
      ExpertiseCode,
  ) {
    setForm(
      current => {
        const isSelected =
          current
            .expertiseCodes
            .includes(
              expertise,
            );

        return {
          ...current,

          expertiseCodes:
            isSelected
              ? current
                  .expertiseCodes
                  .filter(
                    code =>
                      code !==
                      expertise,
                  )
              : [
                  ...current.expertiseCodes,
                  expertise,
                ],
        };
      },
    );
  }

  function buildTranslationsPayload() {
    return (
      [
        'fr',
        'en',
      ] as const
    )
      .filter(
        locale =>
          form.translations[
            locale
          ].enabled,
      )
      .map(
        locale => {
          const translation =
            form.translations[
              locale
            ];

          return {
            locale,

            title:
              translation.title.trim(),

            slug:
              translation.slug.trim(),

            excerpt:
              translation.excerpt.trim() ||
              undefined,

            body:
              translation.body.trim() ||
              undefined,

            coverAltText:
              translation.coverAltText.trim() ||
              undefined,

            seoTitle:
              translation.seoTitle.trim() ||
              undefined,

            seoDescription:
              translation.seoDescription.trim() ||
              undefined,

            canonicalUrl:
              translation.canonicalUrl.trim() ||
              undefined,
          };
        },
      );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !canSave
    ) {
      toast.error(
        'Activez au moins une langue.',
      );

      return;
    }

    const translations =
      buildTranslationsPayload();

    const invalidTranslation =
      translations.find(
        translation =>
          !translation.title ||
          !translation.slug,
      );

    if (
      invalidTranslation
    ) {
      toast.error(
        'Le titre et le slug sont obligatoires dans chaque langue active.',
      );

      setActiveLocale(
        invalidTranslation.locale,
      );

      return;
    }

    if (
      isEvent &&
      !form.eventStartAt
    ) {
      toast.error(
        'La date de début de l’événement est obligatoire.',
      );

      return;
    }

    const payload = {
      contentType:
        form.contentType,

      isFeatured:
        form.isFeatured,

      featuredSortOrder:
        Number.parseInt(
          form.featuredSortOrder ||
          '0',
          10,
        ) ||
        0,

      allowIndexing:
        form.allowIndexing,

      translations,

      expertiseCodes:
        form.expertiseCodes,

      media:
        form.media.map(
          (
            item,
            index,
          ) => ({
            mediaType:
              item.mediaType,

            mediaUrl:
              item.mediaUrl,

            posterUrl:
              item.posterUrl ??
              undefined,

            posterFrameSeconds:
              item.posterFrameSeconds ??
              undefined,

            isCardCover:
              item.isCardCover,

            sortOrder:
              index,

            width:
              item.width ??
              undefined,

            height:
              item.height ??
              undefined,

            durationSeconds:
              item.durationSeconds ??
              undefined,

            translations:
              item.translations
                .map(
                  translation => ({
                    locale:
                      translation.locale,

                    altText:
                      translation.altText.trim() ||
                      undefined,

                    caption:
                      translation.caption.trim() ||
                      undefined,
                  }),
                )
                .filter(
                  translation =>
                    translation.altText !==
                      undefined ||
                    translation.caption !==
                      undefined,
                ),
          }),
        ),

      ...(isEvent
        ? {
            eventStartAt:
              toIsoString(
                form.eventStartAt,
              ),

            eventEndAt:
              toIsoString(
                form.eventEndAt,
              ),

            eventTimezone:
              form.eventTimezone.trim() ||
              undefined,

            eventLocationType:
              form.eventLocationType,

            eventLocationName:
              form.eventLocationName.trim() ||
              undefined,

            eventAddress:
              form.eventAddress.trim() ||
              undefined,

            eventOnlineUrl:
              form.eventOnlineUrl.trim() ||
              undefined,

            eventRegistrationUrl:
              form.eventRegistrationUrl.trim() ||
              undefined,

            eventRegistrationDeadline:
              toIsoString(
                form.eventRegistrationDeadline,
              ),

            eventCapacity:
              form.eventCapacity
                ? Number.parseInt(
                    form.eventCapacity,
                    10,
                  )
                : undefined,

            eventStatus:
              form.eventStatus,
          }
        : {}),
    };

    setIsSaving(
      true,
    );

    try {
      const response =
        await authorizedFetch<
          PublicationResponse
        >(
          isEditing
            ? `/publications/${publicationId}`
            : '/publications',
          {
            method:
              isEditing
                ? 'PATCH'
                : 'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      toast.success(
        isEditing
          ? 'La publication a été enregistrée.'
          : 'Le brouillon a été créé.',
      );

      if (
        isEditing
      ) {
        setPublication(
          response,
        );

        await loadPublication();
      } else {
        router.replace(
          `/admin/publications/${response.id}`,
        );
      }
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }

  async function executeWorkflowAction({
    endpoint,
    method = 'PATCH',
    body,
    successMessage,
    confirmationMessage,
  }: {
    endpoint:
      string;

    method?:
      'PATCH';

    body?:
      unknown;

    successMessage:
      string;

    confirmationMessage?:
      string;
  }) {
    if (
      !publicationId
    ) {
      toast.error(
        'Enregistrez d’abord le brouillon.',
      );

      return;
    }

    if (
      confirmationMessage &&
      !window.confirm(
        confirmationMessage,
      )
    ) {
      return;
    }

    setIsWorkflowBusy(
      true,
    );

    try {
      const response =
        await authorizedFetch<
          PublicationResponse
        >(
          endpoint,
          {
            method,

            ...(body !==
            undefined
              ? {
                  body:
                    JSON.stringify(
                      body,
                    ),
                }
              : {}),
          },
        );

      setPublication(
        response,
      );

      setScheduledAt(
        toDateTimeLocal(
          response.scheduledAt,
        ),
      );

      toast.success(
        successMessage,
      );

      await loadPublication();
    } catch (
      error
    ) {
      toast.error(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsWorkflowBusy(
        false,
      );
    }
  }

  async function handlePublish() {
    if (
      form.media.length ===
      0
    ) {
      toast.error(
        'Ajoutez au moins un média avant de publier.',
      );

      return;
    }

    if (
      isSaving
    ) {
      toast.error(
        'Attendez la fin de l’enregistrement.',
      );

      return;
    }

    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/publish`,

      successMessage:
        'La publication est maintenant en ligne.',

      confirmationMessage:
        'Publier cette publication immédiatement ?',
    });
  }

  async function handleSchedule() {
    if (
      form.media.length ===
      0
    ) {
      toast.error(
        'Ajoutez au moins un média avant de programmer la publication.',
      );

      return;
    }

    if (
      !scheduledAt
    ) {
      toast.error(
        'Choisissez une date et une heure de publication.',
      );

      return;
    }

    const scheduledDate =
      new Date(
        scheduledAt,
      );

    if (
      Number.isNaN(
        scheduledDate.getTime(),
      )
    ) {
      toast.error(
        'La date de programmation est invalide.',
      );

      return;
    }

    if (
      scheduledDate.getTime() <=
      Date.now()
    ) {
      toast.error(
        'La date de programmation doit être dans le futur.',
      );

      return;
    }

    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/schedule`,

      body: {
        scheduledAt:
          scheduledDate.toISOString(),
      },

      successMessage:
        'La publication a été programmée.',
    });
  }

  async function handleCancelSchedule() {
    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/cancel-schedule`,

      successMessage:
        'La programmation a été annulée.',

      confirmationMessage:
        'Annuler la programmation de cette publication ?',
    });
  }

  async function handleUnpublish() {
    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/unpublish`,

      successMessage:
        'La publication est revenue en brouillon.',

      confirmationMessage:
        'Retirer cette publication du site public ?',
    });
  }

  async function handleArchive() {
    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/archive`,

      successMessage:
        'La publication a été archivée.',

      confirmationMessage:
        'Archiver cette publication ?',
    });
  }

  async function handleRestore() {
    await executeWorkflowAction({
      endpoint:
        `/publications/${publicationId}/restore`,

      successMessage:
        'La publication a été restaurée en brouillon.',
    });
  }

  if (
    isLoading
  ) {
    return (
      <div className="publication-editor__loading">
        <LoaderCircle
          size={
            30
          }
          className="admin-spinner"
          aria-hidden="true"
        />

        <span>
          Chargement de la publication…
        </span>
      </div>
    );
  }

  return (
    <form
      className="publication-editor"
      onSubmit={
        handleSubmit
      }
    >
      <header className="publication-editor__header">
        <div>
          <Link
            href="/admin/publications"
            className="publication-editor__back"
          >
            <ArrowLeft
              size={
                17
              }
              aria-hidden="true"
            />

            <span>
              Retour aux publications
            </span>
          </Link>

          <div className="publication-editor__header-status">
            <span className="publication-editor__eyebrow">
              {
                isEditing
                  ? 'Modifier une publication'
                  : 'Nouvelle publication'
              }
            </span>

            {
              publication
                ? (
                    <span
                      className="publication-editor__state-badge"
                      data-state={
                        publication.state
                      }
                    >
                      {
                        publication.state ===
                        'SCHEDULED'
                          ? (
                              <Clock3
                                size={
                                  14
                                }
                                aria-hidden="true"
                              />
                            )
                          : null
                      }

                      {
                        PUBLICATION_STATE_LABELS[
                          publication.state
                        ]
                      }
                    </span>
                  )
                : null
            }
          </div>

          <h1>
            {
              isEditing
                ? publication
                    ?.translations
                    .find(
                      translation =>
                        translation.locale ===
                        'fr',
                    )
                    ?.title ??
                  publication
                    ?.translations[0]
                    ?.title ??
                  'Publication'
                : 'Créer une publication'
            }
          </h1>

          <p>
            Préparez le contenu en français et en anglais.
            La version arabe utilisera automatiquement
            l’anglais, puis le français.
          </p>
        </div>

        <button
          type="submit"
          className="publication-editor__save"
          disabled={
            isSaving ||
            !canSave
          }
        >
          {
            isSaving
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

          <span>
            {
              isSaving
                ? 'Enregistrement…'
                : 'Enregistrer le brouillon'
            }
          </span>
        </button>
      </header>

      <div className="publication-editor__layout">
        <div className="publication-editor__main">
          <section className="publication-editor__section">
            <div className="publication-editor__section-heading">
              <FileText
                size={
                  21
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  Informations générales
                </h2>

                <p>
                  Choisissez le format éditorial de la publication.
                </p>
              </div>
            </div>

            <label className="publication-editor__field">
              <span>
                Type de publication
              </span>

              <select
                value={
                  form.contentType
                }
                onChange={
                  event =>
                    setForm(
                      current => ({
                        ...current,

                        contentType:
                          event.target.value as
                            PublicationContentType,
                      }),
                    )
                }
              >
                {
                  PUBLICATION_CONTENT_TYPES.map(
                    contentType => (
                      <option
                        key={
                          contentType
                        }
                        value={
                          contentType
                        }
                      >
                        {
                          CONTENT_TYPE_LABELS[
                            contentType
                          ]
                        }
                      </option>
                    ),
                  )
                }
              </select>
            </label>
          </section>

          <section className="publication-editor__section">
            <div className="publication-editor__section-heading">
              <Globe2
                size={
                  21
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  Contenu multilingue
                </h2>

                <p>
                  Activez uniquement les langues que vous souhaitez remplir.
                </p>
              </div>
            </div>

            <div className="publication-editor__language-tabs">
              {
                (
                  [
                    {
                      locale:
                        'fr' as const,

                      label:
                        'Français',
                    },

                    {
                      locale:
                        'en' as const,

                      label:
                        'Anglais',
                    },
                  ]
                ).map(
                  language => {
                    const translation =
                      form.translations[
                        language.locale
                      ];

                    return (
                      <div
                        key={
                          language.locale
                        }
                        className="publication-editor__language-tab-wrapper"
                      >
                        <button
                          type="button"
                          className="publication-editor__language-tab"
                          data-active={
                            activeLocale ===
                            language.locale
                          }
                          disabled={
                            !translation.enabled
                          }
                          onClick={
                            () =>
                              setActiveLocale(
                                language.locale,
                              )
                          }
                        >
                          <span>
                            {language.label}
                          </span>

                          {
                            translation.enabled
                              ? (
                                  <Check
                                    size={
                                      15
                                    }
                                    aria-hidden="true"
                                  />
                                )
                              : null
                          }
                        </button>

                        <label className="publication-editor__language-toggle">
                          <input
                            type="checkbox"
                            checked={
                              translation.enabled
                            }
                            onChange={
                              event =>
                                updateTranslationEnabled(
                                  language.locale,
                                  event.target.checked,
                                )
                            }
                          />

                          <span>
                            Activer
                          </span>
                        </label>
                      </div>
                    );
                  },
                )
              }
            </div>

            {
              activeTranslation.enabled
                ? (
                    <div className="publication-editor__translation-fields">
                      <label className="publication-editor__field">
                        <span>
                          Titre
                        </span>

                        <input
                          type="text"
                          value={
                            activeTranslation.title
                          }
                          maxLength={
                            255
                          }
                          placeholder="Ex. Comment automatiser les processus de votre entreprise"
                          onChange={
                            event => {
                              const title =
                                event.target.value;

                              updateTranslation(
                                activeLocale,
                                'title',
                                title,
                              );

                              if (
                                !activeTranslation.slug
                              ) {
                                updateTranslation(
                                  activeLocale,
                                  'slug',
                                  slugify(
                                    title,
                                  ),
                                );
                              }
                            }
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Slug de l’URL
                        </span>

                        <div className="publication-editor__slug-field">
                          <Search
                            size={
                              17
                            }
                            aria-hidden="true"
                          />

                          <input
                            type="text"
                            value={
                              activeTranslation.slug
                            }
                            maxLength={
                              180
                            }
                            placeholder="comment-automatiser-les-processus"
                            onChange={
                              event =>
                                updateTranslation(
                                  activeLocale,
                                  'slug',
                                  slugify(
                                    event.target.value,
                                  ),
                                )
                            }
                          />
                        </div>
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Résumé
                        </span>

                        <textarea
                          value={
                            activeTranslation.excerpt
                          }
                          rows={
                            4
                          }
                          maxLength={
                            2_000
                          }
                          placeholder="Ce résumé apparaîtra dans les cartes et les listes de publications."
                          onChange={
                            event =>
                              updateTranslation(
                                activeLocale,
                                'excerpt',
                                event.target.value,
                              )
                          }
                        />

                        <small>
                          {
                            activeTranslation
                              .excerpt
                              .length
                          }
                          /2000
                        </small>
                      </label>

                      <div className="publication-editor__field">
                        <span>
                          Contenu
                        </span>

                        <PublicationRichTextEditor
                          value={
                            activeTranslation.body
                          }
                          placeholder="Rédigez le contenu de la publication…"
                          onChange={
                            body =>
                              updateTranslation(
                                activeLocale,
                                'body',
                                body,
                              )
                          }
                        />
                      </div>
                    </div>
                  )
                : (
                    <div className="publication-editor__language-disabled">
                      Activez cette langue pour saisir son contenu.
                    </div>
                  )
            }
          </section>

          <PublicationMediaManager
            media={
              form.media
            }
            activeLocale={
              activeLocale
            }
            authorizedFetch={
              authorizedFetch
            }
            disabled={
              isSaving ||
              isWorkflowBusy
            }
            onChange={
              media =>
                setForm(
                  current => ({
                    ...current,

                    media,
                  }),
                )
            }
          />

          {
            isEvent
              ? (
                  <section className="publication-editor__section">
                    <div className="publication-editor__section-heading">
                      <CalendarDays
                        size={
                          21
                        }
                        aria-hidden="true"
                      />

                      <div>
                        <h2>
                          Informations de l’événement
                        </h2>

                        <p>
                          Dates, lieu, inscription et statut public.
                        </p>
                      </div>
                    </div>

                    <div className="publication-editor__grid">
                      <label className="publication-editor__field">
                        <span>
                          Début de l’événement
                        </span>

                        <input
                          type="datetime-local"
                          value={
                            form.eventStartAt
                          }
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventStartAt:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Fin de l’événement
                        </span>

                        <input
                          type="datetime-local"
                          value={
                            form.eventEndAt
                          }
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventEndAt:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Fuseau horaire
                        </span>

                        <input
                          type="text"
                          value={
                            form.eventTimezone
                          }
                          placeholder="Africa/Casablanca"
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventTimezone:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Statut de l’événement
                        </span>

                        <select
                          value={
                            form.eventStatus
                          }
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventStatus:
                                    event.target.value as
                                      EventStatus,
                                }),
                              )
                          }
                        >
                          {
                            (
                              Object.keys(
                                EVENT_STATUS_LABELS,
                              ) as
                                EventStatus[]
                            ).map(
                              status => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    EVENT_STATUS_LABELS[
                                      status
                                    ]
                                  }
                                </option>
                              ),
                            )
                          }
                        </select>
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Format
                        </span>

                        <select
                          value={
                            form.eventLocationType
                          }
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventLocationType:
                                    event.target.value as
                                      EventLocationType,
                                }),
                              )
                          }
                        >
                          <option value="PHYSICAL">
                            Présentiel
                          </option>

                          <option value="ONLINE">
                            En ligne
                          </option>

                          <option value="HYBRID">
                            Hybride
                          </option>
                        </select>
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Capacité
                        </span>

                        <input
                          type="number"
                          min={
                            1
                          }
                          value={
                            form.eventCapacity
                          }
                          placeholder="Ex. 100"
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventCapacity:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>
                    </div>

                    {
                      form.eventLocationType !==
                      'ONLINE'
                        ? (
                            <div className="publication-editor__grid">
                              <label className="publication-editor__field">
                                <span>
                                  Nom du lieu
                                </span>

                                <input
                                  type="text"
                                  value={
                                    form.eventLocationName
                                  }
                                  onChange={
                                    event =>
                                      setForm(
                                        current => ({
                                          ...current,

                                          eventLocationName:
                                            event.target.value,
                                        }),
                                      )
                                  }
                                />
                              </label>

                              <label className="publication-editor__field">
                                <span>
                                  Adresse
                                </span>

                                <input
                                  type="text"
                                  value={
                                    form.eventAddress
                                  }
                                  onChange={
                                    event =>
                                      setForm(
                                        current => ({
                                          ...current,

                                          eventAddress:
                                            event.target.value,
                                        }),
                                      )
                                  }
                                />
                              </label>
                            </div>
                          )
                        : null
                    }

                    {
                      form.eventLocationType !==
                      'PHYSICAL'
                        ? (
                            <label className="publication-editor__field">
                              <span>
                                Lien de participation en ligne
                              </span>

                              <input
                                type="url"
                                value={
                                  form.eventOnlineUrl
                                }
                                placeholder="https://..."
                                onChange={
                                  event =>
                                    setForm(
                                      current => ({
                                        ...current,

                                        eventOnlineUrl:
                                          event.target.value,
                                      }),
                                    )
                                }
                              />
                            </label>
                          )
                        : null
                    }

                    <div className="publication-editor__grid">
                      <label className="publication-editor__field">
                        <span>
                          Lien d’inscription
                        </span>

                        <input
                          type="url"
                          value={
                            form.eventRegistrationUrl
                          }
                          placeholder="https://..."
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventRegistrationUrl:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Date limite d’inscription
                        </span>

                        <input
                          type="datetime-local"
                          value={
                            form.eventRegistrationDeadline
                          }
                          onChange={
                            event =>
                              setForm(
                                current => ({
                                  ...current,

                                  eventRegistrationDeadline:
                                    event.target.value,
                                }),
                              )
                          }
                        />
                      </label>
                    </div>
                  </section>
                )
              : null
          }
        </div>

        <aside className="publication-editor__sidebar">
          <section className="publication-editor__section publication-editor__workflow">
            <div className="publication-editor__section-heading">
              <CalendarClock
                size={
                  20
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  Publication
                </h2>

                <p>
                  Enregistrez, publiez ou programmez ce contenu.
                </p>
              </div>
            </div>

            {
              !publicationId
                ? (
                    <div className="publication-editor__workflow-notice">
                      <FileText
                        size={
                          20
                        }
                        aria-hidden="true"
                      />

                      <p>
                        Enregistrez d’abord le brouillon pour accéder aux actions de publication.
                      </p>
                    </div>
                  )
                : (
                    <>
                      <div className="publication-editor__workflow-state">
                        <span>
                          État actuel
                        </span>

                        <strong>
                          {
                            publication
                              ? PUBLICATION_STATE_LABELS[
                                  publication.state
                                ]
                              : 'Brouillon'
                          }
                        </strong>
                      </div>

                      {
                        publication?.state ===
                          'SCHEDULED' &&
                        publication.scheduledAt
                          ? (
                              <div className="publication-editor__scheduled-summary">
                                <Clock3
                                  size={
                                    18
                                  }
                                  aria-hidden="true"
                                />

                                <div>
                                  <span>
                                    Publication prévue
                                  </span>

                                  <strong>
                                    {
                                      new Intl.DateTimeFormat(
                                        'fr-FR',
                                        {
                                          dateStyle:
                                            'medium',

                                          timeStyle:
                                            'short',
                                        },
                                      ).format(
                                        new Date(
                                          publication.scheduledAt,
                                        ),
                                      )
                                    }
                                  </strong>
                                </div>
                              </div>
                            )
                          : null
                      }

                      {
                        publication?.state ===
                          'DRAFT' ||
                        publication?.state ===
                          'SCHEDULED'
                          ? (
                              <label className="publication-editor__field">
                                <span>
                                  Date et heure de publication
                                </span>

                                <input
                                  type="datetime-local"
                                  value={
                                    scheduledAt
                                  }
                                  min={
                                    toDateTimeLocal(
                                      new Date(
                                        Date.now() +
                                        60_000,
                                      ).toISOString(),
                                    )
                                  }
                                  onChange={
                                    event =>
                                      setScheduledAt(
                                        event.target.value,
                                      )
                                  }
                                />
                              </label>
                            )
                          : null
                      }

                      <div className="publication-editor__workflow-actions">
                        {
                          publication?.state ===
                          'DRAFT'
                            ? (
                                <>
                                  <button
                                    type="button"
                                    className="publication-editor__workflow-button is-primary"
                                    disabled={
                                      isWorkflowBusy ||
                                      isSaving
                                    }
                                    onClick={
                                      () =>
                                        void handlePublish()
                                    }
                                  >
                                    {
                                      isWorkflowBusy
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
                                            <Eye
                                              size={
                                                17
                                              }
                                              aria-hidden="true"
                                            />
                                          )
                                    }

                                    <span>
                                      Publier maintenant
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    className="publication-editor__workflow-button"
                                    disabled={
                                      isWorkflowBusy ||
                                      isSaving ||
                                      !scheduledAt
                                    }
                                    onClick={
                                      () =>
                                        void handleSchedule()
                                    }
                                  >
                                    <CalendarClock
                                      size={
                                        17
                                      }
                                      aria-hidden="true"
                                    />

                                    <span>
                                      Programmer
                                    </span>
                                  </button>
                                </>
                              )
                            : null
                        }

                        {
                          publication?.state ===
                          'SCHEDULED'
                            ? (
                                <>
                                  <button
                                    type="button"
                                    className="publication-editor__workflow-button is-primary"
                                    disabled={
                                      isWorkflowBusy ||
                                      isSaving
                                    }
                                    onClick={
                                      () =>
                                        void handlePublish()
                                    }
                                  >
                                    <Eye
                                      size={
                                        17
                                      }
                                      aria-hidden="true"
                                    />

                                    <span>
                                      Publier maintenant
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    className="publication-editor__workflow-button"
                                    disabled={
                                      isWorkflowBusy ||
                                      isSaving ||
                                      !scheduledAt
                                    }
                                    onClick={
                                      () =>
                                        void handleSchedule()
                                    }
                                  >
                                    <CalendarClock
                                      size={
                                        17
                                      }
                                      aria-hidden="true"
                                    />

                                    <span>
                                      Modifier la date
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    className="publication-editor__workflow-button is-warning"
                                    disabled={
                                      isWorkflowBusy
                                    }
                                    onClick={
                                      () =>
                                        void handleCancelSchedule()
                                    }
                                  >
                                    <Clock3
                                      size={
                                        17
                                      }
                                      aria-hidden="true"
                                    />

                                    <span>
                                      Annuler la programmation
                                    </span>
                                  </button>
                                </>
                              )
                            : null
                        }

                        {
                          publication?.state ===
                          'PUBLISHED'
                            ? (
                                <button
                                  type="button"
                                  className="publication-editor__workflow-button is-warning"
                                  disabled={
                                    isWorkflowBusy
                                  }
                                  onClick={
                                    () =>
                                      void handleUnpublish()
                                  }
                                >
                                  <EyeOff
                                    size={
                                      17
                                    }
                                    aria-hidden="true"
                                  />

                                  <span>
                                    Dépublier
                                  </span>
                                </button>
                              )
                            : null
                        }

                        {
                          publication?.state !==
                          'ARCHIVED'
                            ? (
                                <button
                                  type="button"
                                  className="publication-editor__workflow-button"
                                  disabled={
                                    isWorkflowBusy
                                  }
                                  onClick={
                                    () =>
                                      void handleArchive()
                                  }
                                >
                                  <Archive
                                    size={
                                      17
                                    }
                                    aria-hidden="true"
                                  />

                                  <span>
                                    Archiver
                                  </span>
                                </button>
                              )
                            : (
                                <button
                                  type="button"
                                  className="publication-editor__workflow-button is-primary"
                                  disabled={
                                    isWorkflowBusy
                                  }
                                  onClick={
                                    () =>
                                      void handleRestore()
                                  }
                                >
                                  <RefreshCcw
                                    size={
                                      17
                                    }
                                    aria-hidden="true"
                                  />

                                  <span>
                                    Restaurer le brouillon
                                  </span>
                                </button>
                              )
                        }
                      </div>
                    </>
                  )
            }
          </section>            
          <section className="publication-editor__section">
            <div className="publication-editor__section-heading">
              <Home
                size={
                  20
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  Visibilité
                </h2>

                <p>
                  Contrôlez la home et l’indexation.
                </p>
              </div>
            </div>

            <label className="publication-editor__switch">
              <input
                type="checkbox"
                checked={
                  form.isFeatured
                }
                onChange={
                  event =>
                    setForm(
                      current => ({
                        ...current,

                        isFeatured:
                          event.target.checked,
                      }),
                    )
                }
              />

              <span>
                Afficher sur la page d’accueil
              </span>
            </label>

            {
              form.isFeatured
                ? (
                    <label className="publication-editor__field">
                      <span>
                        Ordre sur la home
                      </span>

                      <input
                        type="number"
                        min={
                          0
                        }
                        value={
                          form.featuredSortOrder
                        }
                        onChange={
                          event =>
                            setForm(
                              current => ({
                                ...current,

                                featuredSortOrder:
                                  event.target.value,
                              }),
                            )
                        }
                      />
                    </label>
                  )
                : null
            }

            <label className="publication-editor__switch">
              <input
                type="checkbox"
                checked={
                  form.allowIndexing
                }
                onChange={
                  event =>
                    setForm(
                      current => ({
                        ...current,

                        allowIndexing:
                          event.target.checked,
                      }),
                    )
                }
              />

              <span>
                Autoriser l’indexation SEO
              </span>
            </label>
          </section>

          <section className="publication-editor__section">
            <div className="publication-editor__section-heading">
              <Search
                size={
                  20
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  SEO
                </h2>

                <p>
                  Métadonnées de la langue active.
                </p>
              </div>
            </div>

            {
              activeTranslation.enabled
                ? (
                    <>
                      <label className="publication-editor__field">
                        <span>
                          Titre SEO
                        </span>

                        <input
                          type="text"
                          maxLength={
                            255
                          }
                          value={
                            activeTranslation.seoTitle
                          }
                          onChange={
                            event =>
                              updateTranslation(
                                activeLocale,
                                'seoTitle',
                                event.target.value,
                              )
                          }
                        />
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          Description SEO
                        </span>

                        <textarea
                          rows={
                            5
                          }
                          maxLength={
                            320
                          }
                          value={
                            activeTranslation.seoDescription
                          }
                          onChange={
                            event =>
                              updateTranslation(
                                activeLocale,
                                'seoDescription',
                                event.target.value,
                              )
                          }
                        />

                        <small>
                          {
                            activeTranslation
                              .seoDescription
                              .length
                          }
                          /320
                        </small>
                      </label>

                      <label className="publication-editor__field">
                        <span>
                          URL canonique
                        </span>

                        <input
                          type="url"
                          value={
                            activeTranslation.canonicalUrl
                          }
                          placeholder="https://..."
                          onChange={
                            event =>
                              updateTranslation(
                                activeLocale,
                                'canonicalUrl',
                                event.target.value,
                              )
                          }
                        />
                      </label>
                    </>
                  )
                : (
                    <p className="publication-editor__sidebar-note">
                      Activez la langue sélectionnée pour saisir ses métadonnées SEO.
                    </p>
                  )
            }
          </section>

          <section className="publication-editor__section">
            <div className="publication-editor__section-heading">
              <Globe2
                size={
                  20
                }
                aria-hidden="true"
              />

              <div>
                <h2>
                  Domaines d’expertise
                </h2>

                <p>
                  Utilisés pour les filtres et le maillage interne.
                </p>
              </div>
            </div>

            <div className="publication-editor__expertise-list">
              {
                EXPERTISE_CODES.map(
                  expertise => {
                    const isSelected =
                      form
                        .expertiseCodes
                        .includes(
                          expertise,
                        );

                    return (
                      <button
                        key={
                          expertise
                        }
                        type="button"
                        className="publication-editor__expertise"
                        data-selected={
                          isSelected
                        }
                        onClick={
                          () =>
                            toggleExpertise(
                              expertise,
                            )
                        }
                      >
                        <span>
                          {
                            EXPERTISE_LABELS[
                              expertise
                            ]
                          }
                        </span>

                        {
                          isSelected
                            ? (
                                <Check
                                  size={
                                    16
                                  }
                                  aria-hidden="true"
                                />
                              )
                            : null
                        }
                      </button>
                    );
                  },
                )
              }
            </div>
          </section>
        </aside>
      </div>

      <div className="publication-editor__mobile-save">
        <button
          type="submit"
          className="publication-editor__save"
disabled={
  isSaving ||
  isWorkflowBusy ||
  !canSave
}
        >
          {
            isSaving
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

          <span>
            Enregistrer
          </span>
        </button>
      </div>
    </form>
  );
}