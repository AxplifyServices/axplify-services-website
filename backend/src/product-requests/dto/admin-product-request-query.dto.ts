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
  PRODUCT_REQUEST_STATUSES,
  PRODUCT_REQUEST_TYPES,
} from '../product-request.constants';

import type {
  ProductRequestStatus,
  ProductRequestType,
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

export class AdminProductRequestQueryDto {
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
    PRODUCT_REQUEST_STATUSES,
  )
  status?:
    ProductRequestStatus;

  @IsOptional()
  @IsIn(
    PRODUCT_REQUEST_TYPES,
  )
  requestType?:
    ProductRequestType;

  @IsOptional()
  @IsUUID(
    '4',
  )
  productId?:
    string;

  @IsOptional()
  @IsUUID(
    '4',
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