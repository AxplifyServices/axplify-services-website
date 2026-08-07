import {
  Transform,
} from 'class-transformer';

import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  FAQ_CATEGORY_CODES,
} from '../faq.constants';

import type {
  FaqCategoryCode,
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

export class AdminFaqQueryDto {
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
  @IsIn(
    FAQ_CATEGORY_CODES,
  )
  categoryCode?:
    FaqCategoryCode;

  @IsOptional()
  @IsIn([
    'visible',
    'hidden',
    'all',
  ])
  visibility?:
    'visible' |
    'hidden' |
    'all';
}