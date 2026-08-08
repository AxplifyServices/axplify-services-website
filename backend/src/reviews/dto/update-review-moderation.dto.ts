import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import {
  REVIEW_STATUSES,
} from '../review.constants';

import type {
  ReviewStatus,
} from '../review.constants';

function normalizeNullableUuid({
  value,
}: {
  value:
    unknown;
}) {
  if (
    value ===
      null
  ) {
    return null;
  }

  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue ||
    null;
}

export class UpdateReviewModerationDto {
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
  @Transform(
    normalizeNullableUuid,
  )
  @IsUUID(
    '4',
    {
      message:
        'La réalisation sélectionnée est invalide.',
    },
  )
  projectId?:
    string | null;

  @IsOptional()
  @IsBoolean()
  showOnHomepage?:
    boolean;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(0)
  @Max(10_000)
  homepageSortOrder?:
    number;
}