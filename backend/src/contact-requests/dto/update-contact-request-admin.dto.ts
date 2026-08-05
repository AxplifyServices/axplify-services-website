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

  const trimmedValue =
    value.trim();

  return trimmedValue.length
    ? trimmedValue
    : null;
}

export class UpdateContactRequestAdminDto {
  @IsOptional()
  @IsUUID(
    '4',
    {
      message:
        'L’administrateur sélectionné est invalide.',
    },
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