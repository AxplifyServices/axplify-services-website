import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  CONTACT_REQUEST_LOCALES,
  CONTACT_REQUEST_SOURCES,
} from '../contact-request.constants';

import type {
  ContactRequestLocale,
  ContactRequestSource,
} from '../contact-request.constants';

function trimmedString({
  value,
}: {
  value:
    unknown;
}) {
  return typeof value ===
    'string'
    ? value.trim()
    : value;
}

function normalizedEmail({
  value,
}: {
  value:
    unknown;
}) {
  return typeof value ===
    'string'
    ? value
        .trim()
        .toLowerCase()
    : value;
}

export class CreateContactRequestAvailabilityDto {
  @IsDateString()
  startsAt:
    string;

  @IsDateString()
  endsAt:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    80,
  )
  @Transform(
    trimmedString,
  )
  timezone?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    500,
  )
  @Transform(
    trimmedString,
  )
  note?:
    string;
}

export class CreateContactRequestDto {
  @IsIn(
    CONTACT_REQUEST_SOURCES,
    {
      message:
        'La source de la demande est invalide.',
    },
  )
  source:
    ContactRequestSource;

  @IsIn(
    CONTACT_REQUEST_LOCALES,
    {
      message:
        'La langue de la demande est invalide.',
    },
  )
  locale:
    ContactRequestLocale;

  @IsString()
  @MinLength(
    2,
  )
  @MaxLength(
    100,
  )
  @Transform(
    trimmedString,
  )
  firstName:
    string;

  @IsString()
  @MinLength(
    2,
  )
  @MaxLength(
    100,
  )
  @Transform(
    trimmedString,
  )
  lastName:
    string;

  @IsString()
  @MinLength(
    2,
  )
  @MaxLength(
    180,
  )
  @Transform(
    trimmedString,
  )
  companyName:
    string;

  @IsString()
  @MinLength(
    2,
  )
  @MaxLength(
    180,
  )
  @Transform(
    trimmedString,
  )
  jobTitle:
    string;

  @IsString()
  @MinLength(
    20,
  )
  @MaxLength(
    5000,
  )
  @Transform(
    trimmedString,
  )
  needDescription:
    string;

  @IsString()
  @MinLength(
    6,
  )
  @MaxLength(
    40,
  )
  @Transform(
    trimmedString,
  )
  phoneNumber:
    string;

  @IsEmail(
    {},
    {
      message:
        'L’adresse e-mail est invalide.',
    },
  )
  @MaxLength(
    254,
  )
  @Transform(
    normalizedEmail,
  )
  email:
    string;

  @IsBoolean()
  wantsAppointment:
    boolean;

  @IsBoolean()
  privacyConsent:
    boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(
    3,
    {
      message:
        'Vous pouvez proposer au maximum trois disponibilités.',
    },
  )
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      CreateContactRequestAvailabilityDto,
  )
  availabilities?:
    CreateContactRequestAvailabilityDto[];

  /*
   * Honeypot invisible.
   * Le frontend devra transmettre une chaîne vide.
   * Une valeur non vide indique probablement un robot.
   */
  @IsOptional()
  @IsString()
  @MaxLength(
    0,
  )
  website?:
    string;
}