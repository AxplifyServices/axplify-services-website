import {
  Type,
} from 'class-transformer';

import {
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewInvitationDto {
  @IsOptional()
  @IsUUID(
    '4',
    {
      message:
        'La réalisation sélectionnée est invalide.',
    },
  )
  projectId?:
    string;

  @IsOptional()
  @Type(
    () =>
      Number,
  )
  @IsInt()
  @Min(
    1,
    {
      message:
        'La durée de validité minimale est de 1 jour.',
    },
  )
  @Max(
    90,
    {
      message:
        'La durée de validité maximale est de 90 jours.',
    },
  )
  expiresInDays?:
    number;
}