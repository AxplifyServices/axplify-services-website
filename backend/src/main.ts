import {
  ValidationPipe,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import compression
  from 'compression';

import cookieParser
  from 'cookie-parser';

import helmet
  from 'helmet';

import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  const configService =
    app.get(
      ConfigService,
    );

  const apiPrefix =
    configService.get<string>(
      'API_PREFIX',
      'api',
    );

  const port =
    configService.get<number>(
      'PORT',
      3000,
    );

  const configuredCorsOrigins =
    configService
      .get<string>(
        'CORS_ORIGINS',
        '',
      )
      .split(
        ',',
      )
      .map(
        (
          origin,
        ) =>
          origin.trim(),
      )
      .filter(
        Boolean,
      );

  /*
   * En développement local, les deux frontends Axplify
   * doivent fonctionner sans dépendre d'un CORS_ORIGINS
   * parfaitement renseigné dans le .env.
   *
   * Ces origines ne sont jamais ajoutées automatiquement
   * en production.
   */
  const localDevelopmentOrigins =
    process.env.NODE_ENV ===
    'production'
      ? []
      : [
          'http://localhost:3001',
          'http://localhost:3002',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3002',
        ];

  const corsOrigins =
    Array.from(
      new Set([
        ...configuredCorsOrigins,
        ...localDevelopmentOrigins,
      ]),
    );

  app.setGlobalPrefix(
    apiPrefix,
  );

  app.use(
    helmet(),
  );

  app.use(
    compression(),
  );

  app.use(
    cookieParser(),
  );

  app.enableCors({
    origin:
      corsOrigins,

    credentials:
      true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:
        true,

      forbidNonWhitelisted:
        true,

      transform:
        true,
    }),
  );

  const swaggerConfiguration =
    new DocumentBuilder()
      .setTitle(
        'Axplify Services API',
      )
      .setDescription(
        'API publique et privée du site Axplify Services.',
      )
      .setVersion(
        '1.0',
      )
      .addBearerAuth()
      .build();

  const swaggerDocument =
    SwaggerModule
      .createDocument(
        app,
        swaggerConfiguration,
      );

  SwaggerModule.setup(
    `${apiPrefix}/docs`,
    app,
    swaggerDocument,
  );

  await app.listen(
    port,
  );
}

void bootstrap();