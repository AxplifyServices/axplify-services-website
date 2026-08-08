import {
  IsIn,
  IsOptional,
} from 'class-validator';

import {
  PRODUCT_LOCALES,
} from '../product.constants';

import type {
  ProductLocale,
} from '../product.constants';

export class PublicProductQueryDto {
  @IsOptional()
  @IsIn(
    PRODUCT_LOCALES,
  )
  locale?: ProductLocale;
}