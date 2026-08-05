import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  CONTACT_REQUEST_SOURCES,
  CONTACT_REQUEST_STATUSES,
} from '../contact-request.constants';

import type {
  ContactRequestSource,
  ContactRequestStatus,
} from '../contact-request.constants';

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

  return trimmedValue.length
    ? trimmedValue
    : undefined;
}

export class AdminContactRequestQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(
    180,
  )
  @Transform(
    optionalTrimmedString,
  )
  search?:
    string;

  @IsOptional()
  @IsIn(
    CONTACT_REQUEST_STATUSES,
    {
      message:
        'Le statut sélectionné est invalide.',
    },
  )
  status?:
    ContactRequestStatus;

  @IsOptional()
  @IsIn(
    CONTACT_REQUEST_SOURCES,
    {
      message:
        'La source sélectionnée est invalide.',
    },
  )
  source?:
    ContactRequestSource;

  @IsOptional()
  @IsUUID(
    '4',
    {
      message:
        'L’administrateur sélectionné est invalide.',
    },
  )
  assignedToUserId?:
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
    100,
  )
  limit?:
    number;
}