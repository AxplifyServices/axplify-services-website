import {
  Transform,
} from 'class-transformer';

import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function optionalTrimmedStringOrNull({
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

  const trimmed =
    value.trim();

  return trimmed.length
    ? trimmed
    : null;
}

export class UpdateProductRequestAdminDto {
  @IsOptional()
  @IsUUID(
    '4',
  )
  assignedToUserId?:
    string | null;

  @IsOptional()
  @IsString()
  @MaxLength(
    5000,
  )
  @Transform(
    optionalTrimmedStringOrNull,
  )
  internalNote?:
    string | null;
}