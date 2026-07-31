import {
  Transform,
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
} from 'class-validator';

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
  @IsUrl({
    require_protocol:
      true,
  })
  @Transform(
    emptyStringToUndefined,
  )
  desktopImageFrUrl?:
    string;

  @IsOptional()
  @IsUrl({
    require_protocol:
      true,
  })
  @Transform(
    emptyStringToUndefined,
  )
  mobileImageFrUrl?:
    string;

  @IsOptional()
  @IsUrl({
    require_protocol:
      true,
  })
  @Transform(
    emptyStringToUndefined,
  )
  desktopImageEnUrl?:
    string;

  @IsOptional()
  @IsUrl({
    require_protocol:
      true,
  })
  @Transform(
    emptyStringToUndefined,
  )
  mobileImageEnUrl?:
    string;

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