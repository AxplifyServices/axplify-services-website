import {
  Transform,
} from 'class-transformer';

import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  FAQ_LOCALES,
} from '../faq.constants';

import type {
  FaqLocale,
} from '../faq.constants';

const trimString = ({
  value,
}: {
  value:
    unknown;
}) =>
  typeof value ===
  'string'
    ? value.trim()
    : value;

export class FaqTranslationInputDto {
  @IsIn(
    FAQ_LOCALES,
    {
      message:
        'La langue doit être fr, en ou ar.',
    },
  )
  locale:
    FaqLocale;

  @Transform(
    trimString,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(
    5,
    {
      message:
        'La question doit contenir au moins 5 caractères.',
    },
  )
  @MaxLength(
    300,
    {
      message:
        'La question ne peut pas dépasser 300 caractères.',
    },
  )
  question:
    string;

  @Transform(
    trimString,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(
    10,
    {
      message:
        'La réponse doit contenir au moins 10 caractères.',
    },
  )
  @MaxLength(
    10_000,
    {
      message:
        'La réponse ne peut pas dépasser 10 000 caractères.',
    },
  )
  answer:
    string;
}