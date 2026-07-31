import {
  Type,
} from 'class-transformer';

import {
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class HomepageBrochureOrderItemDto {
  @IsUUID()
  id:
    string;

  @IsInt()
  @Min(
    0,
  )
  sortOrder:
    number;
}

export class ReorderHomepageBrochuresDto {
  @IsArray()
  @ValidateNested({
    each:
      true,
  })
  @Type(
    () =>
      HomepageBrochureOrderItemDto,
  )
  items:
    HomepageBrochureOrderItemDto[];
}