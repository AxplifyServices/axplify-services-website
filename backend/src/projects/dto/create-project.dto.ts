import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  PROJECT_EXPERTISE_CODES,
  PROJECT_STATUSES,
} from '../project-expertise.constants';

import type {
  ProjectExpertiseCode,
  ProjectStatus,
} from '../project-expertise.constants';

function trimRequiredString({
  value,
}: {
  value:
    unknown;
}) {
  return typeof value ===
    'string'
    ? value.trim()
    : value;
}

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

function normalizeExpertiseCodes({
  value,
}: {
  value:
    unknown;
}) {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return value;
  }

  return value
    .filter(
      (
        item,
      ) =>
        typeof item ===
        'string',
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}

export class CreateProjectDto {
  @IsUUID(
    '4',
    {
      message:
        'Le client sélectionné est invalide.',
    },
  )
  clientId!:
    string;

  @IsString()
  @MinLength(
    3,
    {
      message:
        'Le titre français doit contenir au moins 3 caractères.',
    },
  )
  @MaxLength(
    220,
    {
      message:
        'Le titre français ne peut pas dépasser 220 caractères.',
    },
  )
  @Transform(
    trimRequiredString,
  )
  titleFr!:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    220,
    {
      message:
        'Le titre anglais ne peut pas dépasser 220 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  titleEn?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    220,
    {
      message:
        'Le titre arabe ne peut pas dépasser 220 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  titleAr?:
    string;

  @IsString()
  @MinLength(
    10,
    {
      message:
        'La description française doit contenir au moins 10 caractères.',
    },
  )
  @MaxLength(
    1_200,
    {
      message:
        'La description française ne peut pas dépasser 1 200 caractères.',
    },
  )
  @Transform(
    trimRequiredString,
  )
  descriptionFr!:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    1_200,
    {
      message:
        'La description anglaise ne peut pas dépasser 1 200 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  descriptionEn?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    1_200,
    {
      message:
        'La description arabe ne peut pas dépasser 1 200 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  descriptionAr?:
    string;

  @IsArray({
    message:
      'Les domaines d’expertise doivent être fournis sous forme de liste.',
  })
  @ArrayMinSize(
    1,
    {
      message:
        'Sélectionne au moins un domaine d’expertise.',
    },
  )
  @ArrayMaxSize(
    PROJECT_EXPERTISE_CODES.length,
    {
      message:
        'Le nombre de domaines d’expertise sélectionnés est invalide.',
    },
  )
  @ArrayUnique({
    message:
      'Un domaine d’expertise ne peut pas être sélectionné plusieurs fois.',
  })
  @IsIn(
    PROJECT_EXPERTISE_CODES,
    {
      each:
        true,

      message:
        'Un des domaines d’expertise sélectionnés est invalide.',
    },
  )
  @Transform(
    normalizeExpertiseCodes,
  )
  expertiseCodes!:
    ProjectExpertiseCode[];

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
  @IsInt({
    message:
      'L’ordre d’affichage doit être un nombre entier.',
  })
  @Min(
    0,
    {
      message:
        'L’ordre d’affichage ne peut pas être négatif.',
    },
  )
  @Max(
    10_000,
    {
      message:
        'L’ordre d’affichage ne peut pas dépasser 10 000.',
    },
  )
  sortOrder?:
    number;
}