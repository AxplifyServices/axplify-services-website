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
  PROJECT_EXPERTISE_CODES,
  PROJECT_STATUSES,
  PUBLIC_LOCALES,
} from '../project-expertise.constants';

import type {
  ProjectExpertiseCode,
  ProjectStatus,
  PublicLocale,
} from '../project-expertise.constants';

function optionalTrimmedString({
  value,
}: {
  value:
    unknown;
}) {
  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue.length
    ? trimmedValue
    : undefined;
}

export class AdminProjectQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(
    150,
  )
  @Transform(
    optionalTrimmedString,
  )
  search?:
    string;

  @IsOptional()
  @IsUUID(
    '4',
    {
      message:
        'Le filtre client est invalide.',
    },
  )
  clientId?:
    string;

  @IsOptional()
  @IsIn(
    PROJECT_EXPERTISE_CODES,
    {
      message:
        'Le domaine d’expertise sélectionné est invalide.',
    },
  )
  expertise?:
    ProjectExpertiseCode;

  @IsOptional()
  @IsIn(
    PROJECT_STATUSES,
    {
      message:
        'Le statut sélectionné est invalide.',
    },
  )
  status?:
    ProjectStatus;

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
    10,
  )
  limit?:
    number;
}

export class PublicProjectQueryDto {
  @IsOptional()
  @IsIn(
    PUBLIC_LOCALES,
    {
      message:
        'La langue sélectionnée est invalide.',
    },
  )
  locale?:
    PublicLocale;

  @IsOptional()
  @IsIn(
    PROJECT_EXPERTISE_CODES,
    {
      message:
        'Le domaine d’expertise sélectionné est invalide.',
    },
  )
  expertise?:
    ProjectExpertiseCode;

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
    100,
  )
  limit?:
    number;
}