import {
  Module,
} from '@nestjs/common';

import {
  DatabaseModule,
} from '../database/database.module';

import {
  PublicationsPublicController,
} from './publications-public.controller';

import {
  PublicationsController,
} from './publications.controller';

import {
  PublicationsService,
} from './publications.service';

@Module({
  imports: [
    DatabaseModule,
  ],

  controllers: [
    PublicationsPublicController,

    PublicationsController,
  ],

  providers: [
    PublicationsService,
  ],

  exports: [
    PublicationsService,
  ],
})
export class PublicationsModule {}