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
  REVIEW_STATUSES,
} from '../review.constants';

import type {
  ReviewStatus,
} from '../review.constants';

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

  return trimmedValue ||
    undefined;
}

export class AdminReviewQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(
    optionalTrimmedString,
  )
  search?:
    string;

  @IsOptional()
  @IsIn(
    REVIEW_STATUSES,
    {
      message:
        'Le statut sélectionné est invalide.',
    },
  )
  status?:
    ReviewStatus;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(1)
  page?:
    number;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(1)
  @Max(10)
  limit?:
    number;
}