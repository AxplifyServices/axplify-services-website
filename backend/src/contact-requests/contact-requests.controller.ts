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
  AdminContactRequestQueryDto,
} from './dto/admin-contact-request-query.dto';

import {
  CreateContactRequestDto,
} from './dto/create-contact-request.dto';

import {
  UpdateContactRequestAdminDto,
} from './dto/update-contact-request-admin.dto';

import {
  UpdateContactRequestLinksDto,
} from './dto/update-contact-request-links.dto';

import {
  UpdateContactRequestStatusDto,
} from './dto/update-contact-request-status.dto';

import {
  ContactRequestsService,
} from './contact-requests.service';

@Controller(
  'contact-requests',
)
export class ContactRequestsController {
  constructor(
    private readonly contactRequestsService:
      ContactRequestsService,
  ) {}

  /*
   * Soumission publique.
   *
   * La limite de cinq requêtes par dix minutes
   * est volontairement plus stricte que la limite globale.
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
      CreateContactRequestDto,

    @Headers(
      'user-agent',
    )
    userAgent?:
      string,
  ) {
    return this.contactRequestsService
      .createPublic(
        dto,
        userAgent,
      );
  }

  /*
   * Liste administrateur.
   *
   * Cette route doit rester avant la route dynamique
   * admin/:id.
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
      AdminContactRequestQueryDto,
  ) {
    return this.contactRequestsService
      .findAllAdmin(
        query,
      );
  }

  /*
   * Options nécessaires aux listes déroulantes :
   * statuts, sources, services et administrateurs.
   *
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
    return this.contactRequestsService
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
    return this.contactRequestsService
      .findOneAdmin(
        id,
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
      UpdateContactRequestStatusDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.contactRequestsService
      .updateStatus(
        id,
        dto,
        currentUser,
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
      UpdateContactRequestAdminDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.contactRequestsService
      .updateAdminFields(
        id,
        dto,
        currentUser,
      );
  }

  @Patch(
    'admin/:id/links',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  updateLinks(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,

    @Body()
    dto:
      UpdateContactRequestLinksDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.contactRequestsService
      .updateLinks(
        id,
        dto,
        currentUser,
      );
  }
}