import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

import {
  PUBLICATION_LOCALES,
  PUBLICATION_MEDIA_TYPES,
} from '../publication.constants';

import type {
  PublicationLocale,
  PublicationMediaType,
} from '../publication.constants';

import {
  normalizeBoolean,
  optionalTrimmedString,
  trimRequiredString,
} from '../publication-transformers';

export class PublicationMediaTranslationInputDto {
  @IsIn(
    PUBLICATION_LOCALES,
    {
      message:
        'La langue du média est invalide.',
    },
  )
  locale!:
    PublicationLocale;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
    {
      message:
        'Le texte alternatif du média ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  altText?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    2_000,
    {
      message:
        'La légende du média ne peut pas dépasser 2 000 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  caption?:
    string;
}

export class PublicationMediaInputDto {
  @IsIn(
    PUBLICATION_MEDIA_TYPES,
    {
      message:
        'Le type du média est invalide.',
    },
  )
  mediaType!:
    PublicationMediaType;

  @IsString()
  @MaxLength(
    2_000,
    {
      message:
        'L’URL du média est trop longue.',
    },
  )
  @Transform(
    trimRequiredString,
  )
  mediaUrl!:
    string;

  @IsOptional()
  @Transform(
    normalizeBoolean,
  )
  @IsBoolean({
    message:
      'La valeur du média d’affiche est invalide.',
  })
  isCardCover?:
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
    10_000,
  )
  sortOrder?:
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
    50_000,
  )
  width?:
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
    50_000,
  )
  height?:
    number;

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
    86_400,
  )
  durationSeconds?:
    number;

  @IsOptional()
  @IsArray({
    message:
      'Les traductions du média doivent être fournies sous forme de liste.',
  })
  @ArrayMaxSize(
    PUBLICATION_LOCALES.length,
    {
      message:
        'Un média ne peut pas avoir plus de deux traductions.',
    },
  )
  @ArrayUnique(
    (
      translation:
        PublicationMediaTranslationInputDto,
    ) =>
      translation.locale,
    {
      message:
        'Une langue ne peut apparaître qu’une seule fois pour un même média.',
    },
  )
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      PublicationMediaTranslationInputDto,
  )
  translations?:
    PublicationMediaTranslationInputDto[];
}