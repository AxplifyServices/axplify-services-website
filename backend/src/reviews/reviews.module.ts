import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  ReviewsAdminController,
} from './reviews-admin.controller';

import {
  ReviewsPublicController,
} from './reviews-public.controller';

import {
  ReviewsService,
} from './reviews.service';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    ReviewsAdminController,
    ReviewsPublicController,
  ],

  providers: [
    ReviewsService,
  ],

  exports: [
    ReviewsService,
  ],
})
export class ReviewsModule {}