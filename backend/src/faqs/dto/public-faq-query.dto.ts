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
  FAQ_CATEGORY_CODES,
  FAQ_LOCALES,
} from '../faq.constants';

import type {
  FaqCategoryCode,
  FaqLocale,
} from '../faq.constants';

const emptyStringToUndefined = ({
  value,
}: {
  value:
    unknown;
}) => {
  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue
    ? normalizedValue
    : undefined;
};

export class PublicFaqQueryDto {
  @IsOptional()
  @IsIn(
    FAQ_LOCALES,
  )
  locale?:
    FaqLocale;

  @IsOptional()
  @IsIn(
    FAQ_CATEGORY_CODES,
  )
  categoryCode?:
    FaqCategoryCode;

  @IsOptional()
  @Transform(
    emptyStringToUndefined,
  )
  @IsString()
  @MaxLength(
    200,
  )
  search?:
    string;

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
    25,
  )
  limit?:
    number;
}