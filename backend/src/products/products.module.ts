import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  ProductsPublicController,
} from './products-public.controller';

import {
  ProductsController,
} from './products.controller';

import {
  ProductsService,
} from './products.service';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    ProductsController,
    ProductsPublicController,
  ],

  providers: [
    ProductsService,
  ],

  exports: [
    ProductsService,
  ],
})
export class ProductsModule {}