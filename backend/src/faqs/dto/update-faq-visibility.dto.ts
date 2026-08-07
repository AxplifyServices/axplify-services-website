import {
  IsBoolean,
} from 'class-validator';

export class UpdateFaqVisibilityDto {
  @IsBoolean()
  isVisible:
    boolean;
}