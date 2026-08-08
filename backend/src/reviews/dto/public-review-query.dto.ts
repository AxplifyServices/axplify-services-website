import {
  Type,
} from 'class-transformer';

import {
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class PublicReviewQueryDto {
  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(1)
  page?:
    number;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(1)
  @Max(10)
  limit?:
    number;
}