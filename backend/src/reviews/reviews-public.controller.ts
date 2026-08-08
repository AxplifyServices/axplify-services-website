import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  CreateReviewDto,
} from './dto/create-review.dto';

import {
  PublicReviewQueryDto,
} from './dto/public-review-query.dto';

import {
  ReviewsService,
} from './reviews.service';

@Controller(
  'reviews/public',
)
export class ReviewsPublicController {
  constructor(
    private readonly reviewsService:
      ReviewsService,
  ) {}

  @Get()
  @Throttle({
    default: {
      limit:
        180,

      ttl:
        60_000,
    },
  })
  findPublic(
    @Query()
    query:
      PublicReviewQueryDto,
  ) {
    return this.reviewsService
      .findPublic(
        query,
      );
  }

  @Get(
    'homepage',
  )
  @Throttle({
    default: {
      limit:
        180,

      ttl:
        60_000,
    },
  })
  findHomepage() {
    return this.reviewsService
      .findHomepage();
  }

  @Get(
    'invitation/:token',
  )
  @Throttle({
    default: {
      limit:
        30,

      ttl:
        60_000,
    },
  })
  validateInvitation(
    @Param(
      'token',
    )
    token:
      string,
  ) {
    return this.reviewsService
      .validatePublicInvitation(
        token,
      );
  }

  @Post(
    'invitation/:token',
  )
  @Throttle({
    default: {
      limit:
        5,

      ttl:
        600_000,
    },
  })
  submitReview(
    @Param(
      'token',
    )
    token:
      string,

    @Body()
    dto:
      CreateReviewDto,
  ) {
    return this.reviewsService
      .submitPublicReview(
        token,
        dto,
      );
  }
}