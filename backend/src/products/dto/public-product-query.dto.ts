import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  PRODUCT_LOCALES,
} from '../product.constants';

import type {
  ProductLocale,
} from '../product.constants';

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

  const normalizedValue =
    value.trim();

  return normalizedValue.length >
    0
    ? normalizedValue
    : undefined;
}

export class PublicProductQueryDto {
  @IsOptional()
  @IsIn(
    PRODUCT_LOCALES,
  )
  locale?: ProductLocale;

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

  /*
   * La page publique Produit est volontairement
   * limitée à maximum 10 éléments.
   *
   * Cela évite qu'un appel externe puisse contourner
   * la pagination avec ?limit=1000.
   */
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

  /*
   * La catégorie reste une valeur libre en base.
   *
   * Le filtre correspond donc au libellé traduit
   * réellement affiché au visiteur.
   */
  @IsOptional()
  @Transform(
    optionalTrimmedString,
  )
  @IsString()
  @MaxLength(
    150,
  )
  category?:
    string;
}