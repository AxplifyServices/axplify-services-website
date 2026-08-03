import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimString({
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

function emptyStringToUndefined({
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

export class CreateClientDto {
  @IsString()
  @MinLength(
    2,
    {
      message:
        'Le nom du client doit contenir au moins 2 caractères.',
    },
  )
  @MaxLength(
    180,
    {
      message:
        'Le nom du client ne peut pas dépasser 180 caractères.',
    },
  )
  @Transform(
    trimString,
  )
  name:
    string;

  @IsString()
  @MinLength(
    2,
    {
      message:
        'Le secteur d’activité français doit contenir au moins 2 caractères.',
    },
  )
  @MaxLength(
    180,
    {
      message:
        'Le secteur d’activité français ne peut pas dépasser 180 caractères.',
    },
  )
  @Transform(
    trimString,
  )
  industryFr:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    180,
    {
      message:
        'Le secteur d’activité anglais ne peut pas dépasser 180 caractères.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  industryEn?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    180,
    {
      message:
        'Le secteur d’activité arabe ne peut pas dépasser 180 caractères.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  industryAr?:
    string;

  @IsUrl(
    {
      require_protocol:
        true,

      require_tld:
        false,

      protocols: [
        'http',
        'https',
      ],
    },
    {
      message:
        'L’adresse du logo n’est pas valide.',
    },
  )
  @Transform(
    trimString,
  )
  logoUrl:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
    {
      message:
        'Le texte alternatif français ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  logoAltFr?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
    {
      message:
        'Le texte alternatif anglais ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  logoAltEn?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
    {
      message:
        'Le texte alternatif arabe ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  logoAltAr?:
    string;

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
  @Min(
    0,
  )
  @Max(
    10_000,
  )
  homepageSortOrder?:
    number;

  @IsOptional()
  @IsBoolean()
  isActive?:
    boolean;
}