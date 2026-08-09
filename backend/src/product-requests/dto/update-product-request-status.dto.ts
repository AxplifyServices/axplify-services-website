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
  PRODUCT_REQUEST_STATUSES,
} from '../product-request.constants';

import type {
  ProductRequestStatus,
} from '../product-request.constants';

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

  const trimmed =
    value.trim();

  return trimmed.length
    ? trimmed
    : undefined;
}

export class UpdateProductRequestStatusDto {
  @IsIn(
    PRODUCT_REQUEST_STATUSES,
    {
      message:
        'Le statut sélectionné est invalide.',
    },
  )
  status:
    ProductRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(
    500,
  )
  @Transform(
    optionalTrimmedString,
  )
  note?:
    string;
}