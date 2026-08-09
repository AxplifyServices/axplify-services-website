import {
  Transform,
} from 'class-transformer';

import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  PRODUCT_REQUEST_LOCALES,
  PRODUCT_REQUEST_TYPES,
} from '../product-request.constants';

import type {
  ProductRequestLocale,
  ProductRequestType,
} from '../product-request.constants';

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

export class CreateProductRequestDto {
  @IsUUID(
    '4',
    {
      message:
        'La clé du produit est invalide.',
    },
  )
  productKey:
    string;

  @IsIn(
    PRODUCT_REQUEST_TYPES,
    {
      message:
        'Le type de demande produit est invalide.',
    },
  )
  requestType:
    ProductRequestType;

  @IsIn(
    PRODUCT_REQUEST_LOCALES,
    {
      message:
        'La langue de la demande est invalide.',
    },
  )
  locale:
    ProductRequestLocale;

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

  @IsOptional()
  @IsString()
  @MaxLength(
    180,
  )
  @Transform(
    optionalTrimmedString,
  )
  companyName?:
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

  @IsOptional()
  @IsString()
  @MinLength(
    6,
  )
  @MaxLength(
    40,
  )
  @Transform(
    optionalTrimmedString,
  )
  phoneNumber?:
    string;

  @IsString()
  @MinLength(
    10,
  )
  @MaxLength(
    5000,
  )
  @Transform(
    trimmedString,
  )
  message:
    string;

  @IsOptional()
  @IsUrl(
    {
      require_protocol:
        true,
      protocols: [
        'http',
        'https',
      ],
    },
    {
      message:
        'L’URL source est invalide.',
    },
  )
  @MaxLength(
    2000,
  )
  @Transform(
    optionalTrimmedString,
  )
  sourceUrl?:
    string;

  @IsBoolean()
  privacyConsent:
    boolean;

  /*
   * Honeypot anti-bot.
   *
   * Il doit être transmis vide
   * par les futures landing pages.
   */
  @IsOptional()
  @IsString()
  @MaxLength(
    0,
  )
  website?:
    string;
}