import {
  IsIn,
  IsOptional,
} from 'class-validator';

import {
  FAQ_CATEGORY_CODES,
  FAQ_LOCALES,
} from '../faq.constants';

import type {
  FaqCategoryCode,
  FaqLocale,
} from '../faq.constants';

export class PublicFaqQueryDto {
  @IsOptional()
  @IsIn(
    FAQ_LOCALES,
  )
  locale?:
    FaqLocale;

  @IsOptional()
  @IsIn(
    FAQ_CATEGORY_CODES,
  )
  categoryCode?:
    FaqCategoryCode;
}