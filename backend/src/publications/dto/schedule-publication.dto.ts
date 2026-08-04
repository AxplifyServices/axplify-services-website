import {
  IsISO8601,
} from 'class-validator';

export class SchedulePublicationDto {
  @IsISO8601(
    {
      strict:
        true,

      strictSeparator:
        true,
    },
    {
      message:
        'La date de publication programmée est invalide.',
    },
  )
  scheduledAt!:
    string;
}