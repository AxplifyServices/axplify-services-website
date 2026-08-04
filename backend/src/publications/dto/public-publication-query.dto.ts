import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  EVENT_STATUSES,
  MAX_PUBLIC_PAGE_SIZE,
  PROJECT_EXPERTISE_CODES,
  PUBLICATION_CONTENT_TYPES,
  PUBLIC_PUBLICATION_LOCALES,
} from '../publication.constants';

import type {
  EventStatus,
  PublicationContentType,
  PublicationExpertiseCode,
  PublicPublicationLocale,
} from '../publication.constants';

import {
  normalizeBoolean,
  optionalTrimmedString,
} from '../publication-transformers';

export class PublicPublicationQueryDto {
  @IsOptional()
  @IsIn(
    PUBLIC_PUBLICATION_LOCALES,
    {
      message:
        'La langue publique sélectionnée est invalide.',
    },
  )
  locale?:
    PublicPublicationLocale;

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
  @IsString()
  @MaxLength(
    120,
    {
      message:
        'Le tag sélectionné est trop long.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  tag?:
    string;

  @IsOptional()
  @Transform(
    normalizeBoolean,
  )
  @IsBoolean({
    message:
      'Le filtre de mise en avant est invalide.',
  })
  featured?:
    boolean;

  @IsOptional()
  @Transform(
    normalizeBoolean,
  )
  @IsBoolean({
    message:
      'Le filtre des événements passés est invalide.',
  })
  includePastEvents?:
    boolean;

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
    MAX_PUBLIC_PAGE_SIZE,
  )
  limit?:
    number;
}