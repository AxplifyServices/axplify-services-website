import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
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
  typeof value ===
  'string'
    ? value.trim()
    : value;

export class ProductImageTranslationInputDto {
  @IsIn(
    PRODUCT_LOCALES,
  )
  locale:
    ProductLocale;

  @IsOptional()
  @Transform(
    trimString,
  )
  @IsString()
  @MaxLength(255)
  altText?:
    string;
}

export class ProductImageInputDto {
  @Transform(
    trimString,
  )
  @IsString()
  @MaxLength(2048)
  imageUrl:
    string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(0)
  @Max(4)
  sortOrder?:
    number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(50_000)
  width?:
    number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(50_000)
  height?:
    number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      ProductImageTranslationInputDto,
  )
  translations?:
    ProductImageTranslationInputDto[];
}