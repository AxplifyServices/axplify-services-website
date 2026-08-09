import {
  Body,
  Controller,
  Get,
  Headers,
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
  AdminProductRequestQueryDto,
} from './dto/admin-product-request-query.dto';

import {
  CreateProductRequestDto,
} from './dto/create-product-request.dto';

import {
  UpdateProductRequestAdminDto,
} from './dto/update-product-request-admin.dto';

import {
  UpdateProductRequestStatusDto,
} from './dto/update-product-request-status.dto';

import {
  ProductRequestsService,
} from './product-requests.service';

@Controller(
  'product-requests',
)
export class ProductRequestsController {
  constructor(
    private readonly productRequestsService:
      ProductRequestsService,
  ) {}

  /*
   * Endpoint public destiné aux landing pages produits.
   *
   * Il reste volontairement séparé des routes admin.
   */
  @Post(
    'public',
  )
  @Throttle({
    default: {
      limit:
        5,

      ttl:
        600_000,
    },
  })
  createPublic(
    @Body()
    dto:
      CreateProductRequestDto,

    @Headers(
      'user-agent',
    )
    userAgent?:
      string,
  ) {
    return this.productRequestsService
      .createPublic(
        dto,
        userAgent,
      );
  }

  /*
   * ROUTES ADMIN
   */

  @Get(
    'admin',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  findAllAdmin(
    @Query()
    query:
      AdminProductRequestQueryDto,
  ) {
    return this.productRequestsService
      .findAllAdmin(
        query,
      );
  }

  /*
   * Cette route doit rester avant admin/:id.
   */
  @Get(
    'admin/options',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  getAdminOptions() {
    return this.productRequestsService
      .getAdminOptions();
  }

  @Get(
    'admin/:id',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  findOneAdmin(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,
  ) {
    return this.productRequestsService
      .findOneAdmin(
        id,
      );
  }

  @Patch(
    'admin/:id',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  updateAdminFields(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      UpdateProductRequestAdminDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.productRequestsService
      .updateAdminFields(
        id,
        dto,
        currentUser,
      );
  }

  @Patch(
    'admin/:id/status',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  updateStatus(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      UpdateProductRequestStatusDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.productRequestsService
      .updateStatus(
        id,
        dto,
        currentUser,
      );
  }
}