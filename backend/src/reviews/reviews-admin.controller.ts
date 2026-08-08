import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

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
  AdminReviewQueryDto,
} from './dto/admin-review-query.dto';

import {
  CreateReviewInvitationDto,
} from './dto/create-review-invitation.dto';

import {
  UpdateReviewModerationDto,
} from './dto/update-review-moderation.dto';

import {
  ReviewsService,
} from './reviews.service';

@Controller(
  'reviews/admin',
)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  'SUPER_ADMIN',
)
export class ReviewsAdminController {
  constructor(
    private readonly reviewsService:
      ReviewsService,
  ) {}

  @Get()
  findAll(
    @Query()
    query:
      AdminReviewQueryDto,
  ) {
    return this.reviewsService
      .findAllAdmin(
        query,
      );
  }

  @Post(
    'invitations',
  )
  createInvitation(
    @Body()
    dto:
      CreateReviewInvitationDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.reviewsService
      .createInvitation(
        dto,
        currentUser,
      );
  }

  @Patch(
    'invitations/:id/revoke',
  )
  revokeInvitation(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,
  ) {
    return this.reviewsService
      .revokeInvitation(
        id,
      );
  }

  @Get(
    ':id',
  )
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,
  ) {
    return this.reviewsService
      .findOneAdmin(
        id,
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
      UpdateReviewModerationDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.reviewsService
      .updateModeration(
        id,
        dto,
        currentUser,
      );
  }
}