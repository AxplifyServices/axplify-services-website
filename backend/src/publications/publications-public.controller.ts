import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  PublicPublicationQueryDto,
} from './dto/public-publication-query.dto';

import {
  PUBLIC_PUBLICATION_LOCALES,
} from './publication.constants';

import type {
  PublicPublicationLocale,
} from './publication.constants';

import {
  PublicationsService,
} from './publications.service';

@Controller(
  'publications/public',
)
export class PublicationsPublicController {
  constructor(
    private readonly publicationsService:
      PublicationsService,
  ) {}

  @Throttle({
    default: {
      limit:
        120,

      ttl:
        60_000,
    },
  })
  @Get()
  findAll(
    @Query()
    query:
      PublicPublicationQueryDto,
  ) {
    return this.publicationsService
      .findAllPublic(
        query,
      );
  }

  @Throttle({
    default: {
      limit:
        120,

      ttl:
        60_000,
    },
  })
  @Get(
    'featured',
  )
  findFeatured(
    @Query()
    query:
      PublicPublicationQueryDto,
  ) {
    return this.publicationsService
      .findFeaturedPublic(
        query,
      );
  }

  @Throttle({
    default: {
      limit:
        120,

      ttl:
        60_000,
    },
  })
  @Get(
    'events/upcoming',
  )
  findUpcomingEvents(
    @Query()
    query:
      PublicPublicationQueryDto,
  ) {
    return this.publicationsService
      .findUpcomingEventsPublic(
        query,
      );
  }

  /*
   * Cette route doit rester après :
   * - featured
   * - events/upcoming
   *
   * Sinon NestJS pourrait interpréter ces mots comme une locale ou un slug.
   */
  @Throttle({
    default: {
      limit:
        180,

      ttl:
        60_000,
    },
  })
  @Get(
    ':locale/:slug',
  )
  findOneBySlug(
    @Param(
      'locale',
    )
    rawLocale:
      string,

    @Param(
      'slug',
    )
    slug:
      string,
  ) {
    const locale =
      this.parseLocale(
        rawLocale,
      );

    return this.publicationsService
      .findOnePublicBySlug(
        locale,
        slug,
      );
  }

  private parseLocale(
    rawLocale:
      string,
  ):
    PublicPublicationLocale
  {
    if (
      PUBLIC_PUBLICATION_LOCALES.includes(
        rawLocale as
          PublicPublicationLocale,
      )
    ) {
      return rawLocale as
        PublicPublicationLocale;
    }

    return 'fr';
  }
}