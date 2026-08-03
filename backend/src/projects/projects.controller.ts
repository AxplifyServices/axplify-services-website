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
  CreateProjectDto,
} from './dto/create-project.dto';

import {
  AdminProjectQueryDto,
  PublicProjectQueryDto,
} from './dto/project-query.dto';

import {
  UpdateProjectDto,
} from './dto/update-project.dto';

import {
  ProjectsService,
} from './projects.service';

@Controller(
  'projects',
)
export class ProjectsController {
  constructor(
    private readonly projectsService:
      ProjectsService,
  ) {}

  /*
   * Route publique utilisée par la page "Nos réalisations".
   * Elle doit rester avant la route dynamique @Get(':id').
   */
  @Get(
    'public',
  )
  @Throttle({
    default: {
      limit:
        120,

      ttl:
        60_000,
    },
  })
  findPublic(
    @Query()
    query:
      PublicProjectQueryDto,
  ) {
    return this.projectsService
      .findPublic(
        query,
      );
  }

  /*
   * Route utilisée pour construire la liste déroulante
   * des domaines d’expertise dans l’administration.
   */
  @Get(
    'expertise-options',
  )
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'SUPER_ADMIN',
  )
  getExpertiseOptions() {
    return this.projectsService
      .getExpertiseOptions();
  }

  /*
   * Route administrateur.
   * Elle doit rester avant @Get(':id').
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
      AdminProjectQueryDto,
  ) {
    return this.projectsService
      .findAllAdmin(
        query,
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
    return this.projectsService
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
      CreateProjectDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ) {
    return this.projectsService
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
      UpdateProjectDto,
  ) {
    return this.projectsService
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
    return this.projectsService
      .remove(
        id,
      );
  }
}