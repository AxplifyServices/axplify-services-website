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
  AdminPublicationQueryDto,
} from './dto/admin-publication-query.dto';

import {
  CreatePublicationDto,
} from './dto/create-publication.dto';

import {
  SchedulePublicationDto,
} from './dto/schedule-publication.dto';

import {
  UpdatePublicationDto,
} from './dto/update-publication.dto';

import {
  PublicationsService,
} from './publications.service';

@Controller(
  'publications',
)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  'SUPER_ADMIN',
)
export class PublicationsController {
  constructor(
    private readonly publicationsService:
      PublicationsService,
  ) {}

  /*
   * Cette route doit rester avant les routes contenant :id.
   */
  @Get(
    'admin',
  )
  findAllAdmin(
    @Query()
    query:
      AdminPublicationQueryDto,
  ) {
    return this.publicationsService
      .findAllAdmin(
        query,
      );
  }

  /*
   * Cette route doit rester avant @Get(':id').
   */
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
    return this.publicationsService
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
      CreatePublicationDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .create(
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id',
  )
  @Throttle({
    default: {
      limit:
        60,

      ttl:
        60_000,
    },
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      UpdatePublicationDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .update(
        id,
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id/publish',
  )
  publish(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .publish(
        id,
        currentUser,
      );
  }

  @Patch(
    ':id/schedule',
  )
  schedule(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      SchedulePublicationDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .schedule(
        id,
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id/cancel-schedule',
  )
  cancelSchedule(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .cancelSchedule(
        id,
        currentUser,
      );
  }

  @Patch(
    ':id/unpublish',
  )
  unpublish(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .unpublish(
        id,
        currentUser,
      );
  }

  @Patch(
    ':id/archive',
  )
  archive(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .archive(
        id,
        currentUser,
      );
  }

  @Patch(
    ':id/restore',
  )
  restore(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .restore(
        id,
        currentUser,
      );
  }

  @Delete(
    ':id',
  )
  @Throttle({
    default: {
      limit:
        20,

      ttl:
        60_000,
    },
  })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.publicationsService
      .remove(
        id,
        currentUser,
      );
  }
}