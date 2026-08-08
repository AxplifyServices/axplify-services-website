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
  PRODUCT_LOCALES,
} from '../product.constants';

import type {
  ProductLocale,
} from '../product.constants';

const trimString = ({
  value,
}: {
  value: unknown;
}) =>
  typeof value === 'string'
    ? value.trim()
    : value;

export class ProductTranslationInputDto {
  @IsIn(
    PRODUCT_LOCALES,
    {
      message:
        'La langue doit être fr, en ou ar.',
    },
  )
  locale: ProductLocale;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  title: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(4000)
  description: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  category: string;
}