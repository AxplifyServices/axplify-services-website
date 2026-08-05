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
  CONTACT_REQUEST_STATUSES,
} from '../contact-request.constants';

import type {
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

export class UpdateContactRequestStatusDto {
  @IsIn(
    CONTACT_REQUEST_STATUSES,
    {
      message:
        'Le nouveau statut est invalide.',
    },
  )
  status:
    ContactRequestStatus;

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