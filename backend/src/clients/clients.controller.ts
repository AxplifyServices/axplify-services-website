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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

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
  StorageService,
} from '../storage/storage.service';

import {
  ClientsService,
} from './clients.service';

import {
  CreateClientDto,
} from './dto/create-client.dto';

import {
  UpdateClientDto,
} from './dto/update-client.dto';

@Controller(
  'clients',
)
export class ClientsController {
  constructor(
    private readonly clientsService:
      ClientsService,

    private readonly storageService:
      StorageService,
  ) {}

  @Get(
    'homepage',
  )
  findHomepageClients(
    @Query(
      'locale',
    )
    requestedLocale?:
      string,
  ) {
    const locale =
      requestedLocale ===
        'en' ||
      requestedLocale ===
        'ar'
        ? requestedLocale
        : 'fr';

    return this.clientsService
      .findHomepageClients(
        locale,
      );
  }

  /*
   * Cette route doit rester avant @Get(':id').
   * Sinon NestJS peut interpréter "admin" comme un identifiant.
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
    @Query(
      'search',
    )
    search?:
      string,

    @Query(
      'homepageVisibility',
    )
    homepageVisibility?:
      string,

    @Query(
      'activeStatus',
    )
    activeStatus?:
      string,
  ) {
    return this.clientsService
      .findAllAdmin(
        search,
        homepageVisibility,
        activeStatus,
      );
  }

  /*
   * Cette route doit rester avant @Get(':id').
   */
  @Post(
    'upload-logo',
  )
  @Throttle({
    default: {
      limit:
        20,

      ttl:
        60_000,
    },
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        limits: {
          files:
            1,

          fileSize:
            5 *
            1024 *
            1024,
        },
      },
    ),
  )
  uploadLogo(
    @UploadedFile()
    file:
      Express.Multer.File,
  ) {
    return this.storageService
      .uploadClientLogo(
        file,
      );
  }

  @Get(
    ':id',
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
    return this.clientsService
      .findOneAdmin(
        id,
      );
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  create(
    @Body()
    dto:
      CreateClientDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.clientsService
      .create(
        dto,
        currentUser,
      );
  }

  @Patch(
    ':id',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
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
      UpdateClientDto,
  ) {
    return this.clientsService
      .update(
        id,
        dto,
      );
  }

  @Delete(
    ':id',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id:
      string,
  ) {
    return this.clientsService
      .remove(
        id,
      );
  }
}