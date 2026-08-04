import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  APP_GUARD,
} from '@nestjs/core';

import {
  ScheduleModule,
} from '@nestjs/schedule';

import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import {
  AuthModule,
} from './auth/auth.module';

import {
  DatabaseModule,
} from './database/database.module';

import {
  AppController,
} from './app.controller';

import {
  AppService,
} from './app.service';

import {
  HomepageBrochuresModule,
} from './homepage-brochures/homepage-brochures.module';

import {
  ProjectsModule,
} from './projects/projects.module';

import {
  StorageModule,
} from './storage/storage.module';

import {
  ClientsModule,
} from './clients/clients.module';

import {
  PublicationsModule,
} from './publications/publications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:
        true,

      envFilePath:
        '.env',
    }),

    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        name:
          'default',

        ttl:
          60_000,

        limit:
          120,
      },
    ]),

    DatabaseModule,

    StorageModule,

    AuthModule,

    ClientsModule,

    HomepageBrochuresModule,

    ProjectsModule,

    PublicationsModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,

    {
      provide:
        APP_GUARD,

      useClass:
        ThrottlerGuard,
    },
  ],
})
export class AppModule {}