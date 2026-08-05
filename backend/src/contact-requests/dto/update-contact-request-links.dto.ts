import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsUUID,
} from 'class-validator';

import {
  CONTACT_REQUEST_SERVICE_CODES,
} from '../contact-request.constants';

import type {
  ContactRequestServiceCode,
} from '../contact-request.constants';

export class UpdateContactRequestLinksDto {
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(
    20,
  )
  @IsIn(
    CONTACT_REQUEST_SERVICE_CODES,
    {
      each:
        true,

      message:
        'Un ou plusieurs services sélectionnés sont invalides.',
    },
  )
  serviceCodes:
    ContactRequestServiceCode[];

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(
    20,
  )
  @IsUUID(
    '4',
    {
      each:
        true,

      message:
        'Un ou plusieurs projets sélectionnés sont invalides.',
    },
  )
  projectIds:
    string[];
}