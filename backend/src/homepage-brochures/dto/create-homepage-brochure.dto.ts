import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  HomepageBrochureImageCropDto,
} from './homepage-brochure-image-crop.dto';

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

export class CreateHomepageBrochureDto {
  @IsString()
  @MinLength(
    1,
  )
  @MaxLength(
    150,
  )
  @Transform(
    emptyStringToUndefined,
  )
  internalName:
    string;

  @IsOptional()
  @IsIn([
    'IMAGE',
    'VIDEO',
  ])
  mediaType?:
    'IMAGE' |
    'VIDEO';    

  @IsOptional()
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
        'L’adresse de l’image desktop française n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  desktopImageFrUrl?:
    string;

  @IsOptional()
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
        'L’adresse de l’image mobile française n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  mobileImageFrUrl?:
    string;

  @IsOptional()
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
        'L’adresse de l’image desktop anglaise n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  desktopImageEnUrl?:
    string;

  @IsOptional()
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
        'L’adresse de l’image mobile anglaise n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  mobileImageEnUrl?:
    string;

  @IsOptional()
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
        'L’adresse de la vidéo desktop française n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  desktopVideoFrUrl?:
    string;

  @IsOptional()
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
        'L’adresse de la vidéo mobile française n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  mobileVideoFrUrl?:
    string;

  @IsOptional()
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
        'L’adresse de la vidéo desktop anglaise n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  desktopVideoEnUrl?:
    string;

  @IsOptional()
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
        'L’adresse de la vidéo mobile anglaise n’est pas valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  mobileVideoEnUrl?:
    string;    

  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      HomepageBrochureImageCropDto,
  )
  desktopImageFrCrop?:
    HomepageBrochureImageCropDto;

  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      HomepageBrochureImageCropDto,
  )
  mobileImageFrCrop?:
    HomepageBrochureImageCropDto;

  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      HomepageBrochureImageCropDto,
  )
  desktopImageEnCrop?:
    HomepageBrochureImageCropDto;

  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      HomepageBrochureImageCropDto,
  )
  mobileImageEnCrop?:
    HomepageBrochureImageCropDto;    

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
  )
  @Transform(
    emptyStringToUndefined,
  )
  altTextFr?:
    string;

  @IsOptional()
  @IsString()
  @MaxLength(
    255,
  )
  @Transform(
    emptyStringToUndefined,
  )
  altTextEn?:
    string;

  @IsOptional()
  @ValidateIf(
    (
      _object,
      value,
    ) =>
      value !==
      undefined,
  )
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
        'Le lien doit être une URL HTTP ou HTTPS valide.',
    },
  )
  @Transform(
    emptyStringToUndefined,
  )
  linkUrl?:
    string;

  @IsOptional()
  @IsIn([
    '_self',
    '_blank',
  ])
  linkTarget?:
    '_self' |
    '_blank';

  @IsOptional()
  @IsInt()
  @Min(
    0,
  )
  @Max(
    10000,
  )
  sortOrder?:
    number;

  @IsOptional()
  @IsBoolean()
  isActive?:
    boolean;
}