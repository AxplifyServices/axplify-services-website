import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  EVENT_STATUSES,
  MAX_ADMIN_PAGE_SIZE,
  PROJECT_EXPERTISE_CODES,
  PUBLICATION_ADMIN_STATES,
  PUBLICATION_CONTENT_TYPES,
  PUBLICATION_LOCALES,
  PUBLICATION_SORT_OPTIONS,
} from '../publication.constants';

import type {
  EventStatus,
  PublicationAdminState,
  PublicationContentType,
  PublicationExpertiseCode,
  PublicationLocale,
  PublicationSortOption,
} from '../publication.constants';

import {
  optionalTrimmedString,
} from '../publication-transformers';

export class AdminPublicationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(
    200,
    {
      message:
        'Le texte de recherche ne peut pas dépasser 200 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  search?:
    string;

  @IsOptional()
  @IsIn(
    PUBLICATION_CONTENT_TYPES,
    {
      message:
        'Le type de publication sélectionné est invalide.',
    },
  )
  contentType?:
    PublicationContentType;

  @IsOptional()
  @IsIn(
    PUBLICATION_ADMIN_STATES,
    {
      message:
        'L’état de publication sélectionné est invalide.',
    },
  )
  state?:
    PublicationAdminState;

  @IsOptional()
  @IsIn(
    PUBLICATION_LOCALES,
    {
      message:
        'La langue sélectionnée est invalide.',
    },
  )
  locale?:
    PublicationLocale;

  @IsOptional()
  @IsIn(
    EVENT_STATUSES,
    {
      message:
        'Le statut d’événement sélectionné est invalide.',
    },
  )
  eventStatus?:
    EventStatus;

  @IsOptional()
  @IsIn(
    PROJECT_EXPERTISE_CODES,
    {
      message:
        'Le domaine d’expertise sélectionné est invalide.',
    },
  )
  expertise?:
    PublicationExpertiseCode;

  @IsOptional()
  @IsUUID(
    '4',
    {
      message:
        'Le projet sélectionné est invalide.',
    },
  )
  projectId?:
    string;

  @IsOptional()
  @IsIn(
    PUBLICATION_SORT_OPTIONS,
    {
      message:
        'L’ordre de tri sélectionné est invalide.',
    },
  )
  sort?:
    PublicationSortOption;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(
    1,
  )
  page?:
    number;

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
    MAX_ADMIN_PAGE_SIZE,
  )
  limit?:
    number;
}