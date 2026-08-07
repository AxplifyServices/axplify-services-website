import {
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  FAQ_CATEGORY_CODES,
} from '../faq.constants';

import type {
  FaqCategoryCode,
} from '../faq.constants';

import {
  FaqTranslationInputDto,
} from './faq-translation-input.dto';

export class CreateFaqDto {
  @IsIn(
    FAQ_CATEGORY_CODES,
    {
      message:
        'La catégorie FAQ est invalide.',
    },
  )
  categoryCode:
    FaqCategoryCode;

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
  @IsBoolean()
  isVisible?:
    boolean;

  @IsArray()
  @ArrayMinSize(
    3,
    {
      message:
        'Les traductions française, anglaise et arabe sont obligatoires.',
    },
  )
  @ArrayMaxSize(
    3,
    {
      message:
        'Une seule traduction est autorisée par langue.',
    },
  )
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      FaqTranslationInputDto,
  )
  translations:
    FaqTranslationInputDto[];
}