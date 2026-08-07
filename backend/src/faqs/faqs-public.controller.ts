import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  PublicFaqQueryDto,
} from './dto/public-faq-query.dto';

import {
  FaqsService,
} from './faqs.service';

@Controller(
  'faqs/public',
)
export class FaqsPublicController {
  constructor(
    private readonly faqsService:
      FaqsService,
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
  findAll(
    @Query()
    query:
      PublicFaqQueryDto,
  ) {
    return this.faqsService
      .findAllPublic(
        query,
      );
  }
}