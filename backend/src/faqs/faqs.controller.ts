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
  AdminFaqQueryDto,
} from './dto/admin-faq-query.dto';

import {
  CreateFaqDto,
} from './dto/create-faq.dto';

import {
  UpdateFaqDto,
} from './dto/update-faq.dto';

import {
  UpdateFaqVisibilityDto,
} from './dto/update-faq-visibility.dto';

import {
  FaqsService,
} from './faqs.service';

@Controller(
  'faqs',
)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  'SUPER_ADMIN',
)
export class FaqsController {
  constructor(
    private readonly faqsService:
      FaqsService,
  ) {}

  @Get(
    'admin',
  )
  findAllAdmin(
    @Query()
    query:
      AdminFaqQueryDto,
  ) {
    return this.faqsService
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
    id:
      string,
  ) {
    return this.faqsService
      .findOneAdmin(
        id,
      );
  }

  @Post()
  @Throttle({
    default: {
      limit:
        30,

      ttl:
        60_000,
    },
  })
  create(
    @Body()
    dto:
      CreateFaqDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.faqsService
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
    id:
      string,

    @Body()
    dto:
      UpdateFaqDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.faqsService
      .update(
        id,
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id/visibility',
  )
  updateVisibility(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      UpdateFaqVisibilityDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.faqsService
      .updateVisibility(
        id,
        dto.isVisible,
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
    id:
      string,
  ) {
    return this.faqsService
      .remove(
        id,
      );
  }
}