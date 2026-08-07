import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  FaqsPublicController,
} from './faqs-public.controller';

import {
  FaqsController,
} from './faqs.controller';

import {
  FaqsService,
} from './faqs.service';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    FaqsController,
    FaqsPublicController,
  ],

  providers: [
    FaqsService,
  ],

  exports: [
    FaqsService,
  ],
})
export class FaqsModule {}