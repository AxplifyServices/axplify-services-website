import {
  Transform,
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  ProductTranslationInputDto,
} from './product-translation-input.dto';

const trimString = ({
  value,
}: {
  value: unknown;
}) =>
  typeof value === 'string'
    ? value.trim()
    : value;

export class CreateProductDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  linkUrl: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  showOnHomepage?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  homepageSortOrder?: number;

  @IsArray()
  @ArrayMinSize(
    2,
    {
      message:
        'Les traductions française et anglaise sont obligatoires.',
    },
  )
  @ArrayMaxSize(
    3,
    {
      message:
        'Une seule traduction est autorisée par langue.',
    },
  )
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      ProductTranslationInputDto,
  )
  translations:
    ProductTranslationInputDto[];
}