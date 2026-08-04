import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

import {
  EVENT_LOCATION_TYPES,
  EVENT_STATUSES,
  PROJECT_EXPERTISE_CODES,
  PUBLICATION_CONTENT_TYPES,
  PUBLICATION_LOCALES,
  MAX_PUBLICATION_MEDIA,
} from '../publication.constants';

import type {
  EventLocationType,
  EventStatus,
  PublicationContentType,
  PublicationExpertiseCode,
} from '../publication.constants';

import {
  normalizeBoolean,
  normalizeStringArray,
  optionalTrimmedString,
} from '../publication-transformers';

import {
  PublicationMediaInputDto,
} from './publication-media-input.dto';

import {
  PublicationTranslationInputDto,
} from './publication-translation-input.dto';

export class CreatePublicationDto {
  @IsIn(
    PUBLICATION_CONTENT_TYPES,
    {
      message:
        'Le type de publication est invalide.',
    },
  )
  contentType!:
    PublicationContentType;

  @IsOptional()
  @Transform(
    normalizeBoolean,
  )
  @IsBoolean({
    message:
      'La valeur de mise en avant est invalide.',
  })
  isFeatured?:
    boolean;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(
    0,
  )
  @Max(
    100_000,
  )
  featuredSortOrder?:
    number;

  @IsOptional()
  @Transform(
    normalizeBoolean,
  )
  @IsBoolean({
    message:
      'La valeur d’indexation SEO est invalide.',
  })
  allowIndexing?:
    boolean;

  /*
   * Champs propres aux événements.
   * Leur cohérence avec contentType est contrôlée dans le service.
   */

  @IsOptional()
  @IsISO8601(
    {
      strict:
        true,
      strictSeparator:
        true,
    },
    {
      message:
        'La date de début de l’événement est invalide.',
    },
  )
  eventStartAt?:
    string;

  @IsOptional()
  @IsISO8601(
    {
      strict:
        true,
      strictSeparator:
        true,
    },
    {
      message:
        'La date de fin de l’événement est invalide.',
    },
  )
  eventEndAt?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    80,
    {
      message:
        'Le fuseau horaire ne peut pas dépasser 80 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  eventTimezone?:
    string;

  @IsOptional()
  @IsIn(
    EVENT_LOCATION_TYPES,
    {
      message:
        'Le type de lieu de l’événement est invalide.',
    },
  )
  eventLocationType?:
    EventLocationType;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
    {
      message:
        'Le nom du lieu ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  eventLocationName?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    2_000,
    {
      message:
        'L’adresse de l’événement ne peut pas dépasser 2 000 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  eventAddress?:
    string;

  @IsOptional()
  @IsUrl(
    {
      require_protocol:
        true,
      protocols: [
        'http',
        'https',
      ],
    },
    {
      message:
        'Le lien de participation en ligne est invalide.',
    },
  )
  @MaxLength(
    2_000,
  )
  @Transform(
    optionalTrimmedString,
  )
  eventOnlineUrl?:
    string;

  @IsOptional()
  @IsUrl(
    {
      require_protocol:
        true,
      protocols: [
        'http',
        'https',
      ],
    },
    {
      message:
        'Le lien d’inscription à l’événement est invalide.',
    },
  )
  @MaxLength(
    2_000,
  )
  @Transform(
    optionalTrimmedString,
  )
  eventRegistrationUrl?:
    string;

  @IsOptional()
  @IsISO8601(
    {
      strict:
        true,
      strictSeparator:
        true,
    },
    {
      message:
        'La date limite d’inscription est invalide.',
    },
  )
  eventRegistrationDeadline?:
    string;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(
    1,
  )
  @Max(
    1_000_000,
  )
  eventCapacity?:
    number;

  @IsOptional()
  @IsIn(
    EVENT_STATUSES,
    {
      message:
        'Le statut de l’événement est invalide.',
    },
  )
  eventStatus?:
    EventStatus;

  /*
   * Contenu multilingue.
   */

  @IsArray({
    message:
      'Les traductions doivent être fournies sous forme de liste.',
  })
  @ArrayMaxSize(
    PUBLICATION_LOCALES.length,
    {
      message:
        'Une publication ne peut pas avoir plus de trois traductions.',
    },
  )
  @ArrayUnique(
    (
      translation:
        PublicationTranslationInputDto,
    ) =>
      translation.locale,
    {
      message:
        'Une langue ne peut apparaître qu’une seule fois dans les traductions.',
    },
  )
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      PublicationTranslationInputDto,
  )
  translations!:
    PublicationTranslationInputDto[];

  @ArrayMinSize(
    1,
    {
      message:
        'Ajoutez au moins une traduction française ou anglaise.',
    },
  )

  /*
   * Relations avec les domaines d’expertise Axplify.
   */



  @IsOptional()
  @IsArray({
    message:
      'Les domaines d’expertise doivent être fournis sous forme de liste.',
  })
  @ArrayMaxSize(
    PROJECT_EXPERTISE_CODES.length,
    {
      message:
        'Le nombre de domaines d’expertise est invalide.',
    },
  )
  @ArrayUnique({
    message:
      'Un domaine d’expertise ne peut pas apparaître plusieurs fois.',
  })
  @IsIn(
    PROJECT_EXPERTISE_CODES,
    {
      each:
        true,

      message:
        'Un des domaines d’expertise est invalide.',
    },
  )
  @Transform(
    normalizeStringArray,
  )
  expertiseCodes?:
    PublicationExpertiseCode[];

  /*
   * Projets liés, principalement destinés aux cas d’étude.
   */

  @IsOptional()
  @IsArray({
    message:
      'Les projets associés doivent être fournis sous forme de liste.',
  })
  @ArrayMaxSize(
    50,
    {
      message:
        'Une publication ne peut pas être liée à plus de 50 projets.',
    },
  )
  @ArrayUnique({
    message:
      'Un projet ne peut pas être associé plusieurs fois.',
  })
  @IsUUID(
    '4',
    {
      each:
        true,

      message:
        'Un des projets sélectionnés est invalide.',
    },
  )
  @Transform(
    normalizeStringArray,
  )
  projectIds?:
    string[];

  /*
   * Galerie, vidéos et documents complémentaires.
   */

  @IsOptional()
  @IsArray({
    message:
      'Les médias doivent être fournis sous forme de liste.',
  })
  @ArrayMaxSize(
    MAX_PUBLICATION_MEDIA,
    {
      message:
        'Une publication ne peut pas contenir plus de 5 médias.',
    },
  )
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      PublicationMediaInputDto,
  )
  media?:
    PublicationMediaInputDto[];
}