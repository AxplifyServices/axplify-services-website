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
  CreateHomepageBrochureDto,
} from './dto/create-homepage-brochure.dto';

import {
  ReorderHomepageBrochuresDto,
} from './dto/reorder-homepage-brochures.dto';

import {
  UpdateHomepageBrochureDto,
} from './dto/update-homepage-brochure.dto';

import {
  HomepageBrochuresService,
} from './homepage-brochures.service';

import {
  Throttle,
} from '@nestjs/throttler';

@Controller(
  'homepage-brochures',
)
export class HomepageBrochuresController {
  constructor(
    private readonly homepageBrochuresService:
      HomepageBrochuresService,

    private readonly storageService:
      StorageService,
  ) {}

  @Get()
  findPublic(
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

    return this.homepageBrochuresService
      .findPublic(
        locale,
      );
  }

  /*
   * Cette route doit rester placée avant @Get(':id').
   * Sinon NestJS interpréterait "admin" comme un UUID.
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
  findAllAdmin() {
    return this.homepageBrochuresService
      .findAllAdmin();
  }

  /*
   * Cette route doit rester placée avant @Get(':id').
   */

@Throttle({
  default: {
    limit:
      20,

    ttl:
      60_000,
  },
})

  @Post(
    'upload-image',
  )
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
            10 *
            1024 *
            1024,
        },
      },
    ),
  )
  uploadImage(
    @UploadedFile()
    file:
      Express.Multer.File,
  ) {
    return this.storageService
      .uploadHomepageBrochureImage(
        file,
      );
  }

  @Throttle({
    default: {
      limit:
        10,

      ttl:
        60_000,
    },
  })
  @Post(
    'upload-video',
  )
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
            100 *
            1024 *
            1024,
        },
      },
    ),
  )
  uploadVideo(
    @UploadedFile()
    file:
      Express.Multer.File,
  ) {
    return this.storageService
      .uploadHomepageBrochureVideo(
        file,
      );
  }

  /*
   * Cette route doit rester placée avant @Patch(':id').
   */
  @Post(
    'reorder',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  reorder(
    @Body()
    dto:
      ReorderHomepageBrochuresDto,
  ) {
    return this.homepageBrochuresService
      .reorder(
        dto,
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
    return this.homepageBrochuresService
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
      CreateHomepageBrochureDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.homepageBrochuresService
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
      UpdateHomepageBrochureDto,
  ) {
    return this.homepageBrochuresService
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
    return this.homepageBrochuresService
      .remove(
        id,
      );
  }
}