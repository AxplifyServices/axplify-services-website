import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import type {
  AuthenticatedUser,
} from '../common/types/authenticated-user.type';

import {
  AdminProductQueryDto,
} from './dto/admin-product-query.dto';

import {
  CreateProductDto,
} from './dto/create-product.dto';

import {
  UpdateProductDto,
} from './dto/update-product.dto';

import {
  ProductsService,
} from './products.service';

@Controller(
  'products',
)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  'SUPER_ADMIN',
)
export class ProductsController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  @Get(
    'admin',
  )
  findAllAdmin(
    @Query()
    query:
      AdminProductQueryDto,
  ) {
    return this.productsService
      .findAllAdmin(
        query,
      );
  }

  @Get(
    'admin/:id',
  )
  findOneAdmin(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.productsService
      .findOneAdmin(
        id,
      );
  }

  @Post()
  @Throttle({
    default: {
      limit: 30,
      ttl: 60_000,
    },
  })
  create(
    @Body()
    dto:
      CreateProductDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.productsService
      .create(
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id',
  )
  update(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    dto:
      UpdateProductDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.productsService
      .update(
        id,
        dto,
        currentUser,
      );
  }

  @Delete(
    ':id',
  )
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.productsService
      .remove(
        id,
        currentUser,
      );
  }
}