import {
  Transform,
} from 'class-transformer';

import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const emptyStringToUndefined = ({
  value,
}: {
  value: unknown;
}) => {
  if (
    typeof value !==
    'string'
  ) {
    return value;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue
    ? normalizedValue
    : undefined;
};

export class AdminProductQueryDto {
  @IsOptional()
  @Transform(
    emptyStringToUndefined,
  )
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsIn([
    'active',
    'inactive',
    'all',
  ])
  activity?:
    | 'active'
    | 'inactive'
    | 'all';

  @IsOptional()
  @IsIn([
    'homepage',
    'catalogOnly',
    'all',
  ])
  homepage?:
    | 'homepage'
    | 'catalogOnly'
    | 'all';
}