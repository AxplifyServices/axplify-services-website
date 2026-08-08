import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  PublicProductQueryDto,
} from './dto/public-product-query.dto';

import {
  ProductsService,
} from './products.service';

@Controller(
  'products/public',
)
export class ProductsPublicController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  @Get()
  @Throttle({
    default: {
      limit: 180,
      ttl: 60_000,
    },
  })
  findAll(
    @Query()
    query:
      PublicProductQueryDto,
  ) {
    return this.productsService
      .findAllPublic(
        query,
      );
  }

  @Get(
    'featured',
  )
  @Throttle({
    default: {
      limit: 180,
      ttl: 60_000,
    },
  })
  findFeatured(
    @Query()
    query:
      PublicProductQueryDto,
  ) {
    return this.productsService
      .findFeaturedPublic(
        query,
      );
  }
}