import {
  Transform,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  REVIEW_LOCALES,
} from '../review.constants';

import type {
  ReviewLocale,
} from '../review.constants';

function trimString({
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

export class CreateReviewDto {
  @IsInt({
    message:
      'La note doit être un nombre entier.',
  })
  @Min(
    1,
    {
      message:
        'La note minimale est de 1.',
    },
  )
  @Max(
    5,
    {
      message:
        'La note maximale est de 5.',
    },
  )
  rating!:
    number;

  @IsString()
  @MinLength(
    10,
    {
      message:
        'Le commentaire doit contenir au moins 10 caractères.',
    },
  )
  @MaxLength(
    3000,
    {
      message:
        'Le commentaire ne peut pas dépasser 3 000 caractères.',
    },
  )
  @Transform(
    trimString,
  )
  comment!:
    string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(
    trimString,
  )
  firstName!:
    string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(
    trimString,
  )
  lastName!:
    string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  @Transform(
    trimString,
  )
  companyName!:
    string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  @Transform(
    trimString,
  )
  companyRole!:
    string;

  @IsIn(
    REVIEW_LOCALES,
    {
      message:
        'La langue sélectionnée est invalide.',
    },
  )
  locale!:
    ReviewLocale;
}