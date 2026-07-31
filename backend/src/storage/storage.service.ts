import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  randomUUID,
} from 'node:crypto';

import {
  Client as MinioClient,
} from 'minio';

import sharp from 'sharp';

type UploadedImage = {
  url: string;
  objectName: string;
  mimeType: 'image/webp';
  extension: 'webp';
  width: number | null;
  height: number | null;
  size: number;
};

@Injectable()
export class StorageService
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      StorageService.name,
    );

  private readonly minioClient:
    MinioClient;

  private readonly publicBucket:
    string;

  private readonly publicUrl:
    string;

  private readonly allowedImageTypes:
    Set<string>;

  private readonly maxImageSize:
    number;

  constructor(
    private readonly configService:
      ConfigService,
  ) {
    const endpoint =
      this.configService
        .getOrThrow<string>(
          'MINIO_ENDPOINT',
        );

    const port =
      Number(
        this.configService
          .getOrThrow<string>(
            'MINIO_PORT',
          ),
      );

    const useSSL =
      this.configService
        .get<string>(
          'MINIO_USE_SSL',
          'false',
        ) ===
      'true';

    const accessKey =
      this.configService
        .getOrThrow<string>(
          'MINIO_ACCESS_KEY',
        );

    const secretKey =
      this.configService
        .getOrThrow<string>(
          'MINIO_SECRET_KEY',
        );

    this.publicBucket =
      this.configService
        .getOrThrow<string>(
          'MINIO_PUBLIC_BUCKET',
        );

    this.publicUrl =
      this.configService
        .getOrThrow<string>(
          'MINIO_PUBLIC_URL',
        )
        .replace(
          /\/+$/,
          '',
        );

    this.maxImageSize =
      Number(
        this.configService
          .get<string>(
            'UPLOAD_MAX_IMAGE_SIZE_BYTES',
            '10485760',
          ),
      );

    this.allowedImageTypes =
      new Set(
        this.configService
          .get<string>(
            'UPLOAD_ALLOWED_IMAGE_TYPES',
            'image/jpeg,image/png,image/webp,image/avif',
          )
          .split(
            ',',
          )
          .map(
            (
              mimeType,
            ) =>
              mimeType.trim(),
          )
          .filter(
            Boolean,
          ),
      );

    this.minioClient =
      new MinioClient({
        endPoint:
          endpoint,

        port,

        useSSL,

        accessKey,

        secretKey,
      });
  }

  async onModuleInit():
    Promise<void>
  {
    await this.ensurePublicBucket();
  }

  async uploadHomepageBrochureImage(
    file:
      Express.Multer.File,
  ):
    Promise<UploadedImage>
  {
    this.validateImageFile(
      file,
    );

    let processedImage:
      Buffer;

    let metadata:
      sharp.Metadata;

    try {
      const image =
        sharp(
          file.buffer,
          {
            failOn:
              'error',
          },
        )
          .rotate();

      metadata =
        await image
          .metadata();

      processedImage =
        await image
          .webp({
            quality:
              86,

            effort:
              5,

            smartSubsample:
              true,
          })
          .toBuffer();
    } catch {
      throw new BadRequestException(
        'Le fichier envoyé ne contient pas une image valide.',
      );
    }

    const objectName =
      [
        'homepage',
        'brochures',
        `${randomUUID()}.webp`,
      ].join(
        '/',
      );

    try {
      await this.minioClient
        .putObject(
          this.publicBucket,
          objectName,
          processedImage,
          processedImage.length,
          {
            'Content-Type':
              'image/webp',

            'Cache-Control':
              'public, max-age=31536000, immutable',
          },
        );
    } catch (
      error
    ) {
      this.logger.error(
        'Impossible d’enregistrer la brochure dans MinIO.',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new InternalServerErrorException(
        'Impossible d’enregistrer l’image.',
      );
    }

    return {
      url:
        `${this.publicUrl}/${objectName}`,

      objectName,

      mimeType:
        'image/webp',

      extension:
        'webp',

      width:
        metadata.width ??
        null,

      height:
        metadata.height ??
        null,

      size:
        processedImage.length,
    };
  }

  async deletePublicFileByUrl(
    fileUrl:
      string | null | undefined,
  ):
    Promise<void>
  {
    if (
      !fileUrl
    ) {
      return;
    }

    const expectedPrefix =
      `${this.publicUrl}/`;

    if (
      !fileUrl.startsWith(
        expectedPrefix,
      )
    ) {
      return;
    }

    const objectName =
      fileUrl.slice(
        expectedPrefix.length,
      );

    if (
      !objectName.startsWith(
        'homepage/brochures/',
      )
    ) {
      return;
    }

    try {
      await this.minioClient
        .removeObject(
          this.publicBucket,
          objectName,
        );
    } catch (
      error
    ) {
      this.logger.warn(
        `Impossible de supprimer le fichier MinIO ${objectName}.`,
      );

      this.logger.debug(
        error,
      );
    }
  }

  private validateImageFile(
    file:
      Express.Multer.File | undefined,
  ):
    asserts file is Express.Multer.File
  {
    if (
      !file
    ) {
      throw new BadRequestException(
        'Aucun fichier image n’a été envoyé.',
      );
    }

    if (
      file.size <=
      0
    ) {
      throw new BadRequestException(
        'Le fichier envoyé est vide.',
      );
    }

    if (
      file.size >
      this.maxImageSize
    ) {
      throw new BadRequestException(
        `L’image dépasse la taille maximale autorisée de ${Math.round(
          this.maxImageSize /
            1024 /
            1024,
        )} Mo.`,
      );
    }

    if (
      !this.allowedImageTypes
        .has(
          file.mimetype,
        )
    ) {
      throw new BadRequestException(
        'Format d’image non autorisé. Utilisez JPEG, PNG, WebP ou AVIF.',
      );
    }
  }

  private async ensurePublicBucket():
    Promise<void>
  {
    const exists =
      await this.minioClient
        .bucketExists(
          this.publicBucket,
        );

    if (
      !exists
    ) {
      await this.minioClient
        .makeBucket(
          this.publicBucket,
        );
    }

    const publicReadPolicy =
      JSON.stringify({
        Version:
          '2012-10-17',

        Statement: [
          {
            Effect:
              'Allow',

            Principal: {
              AWS:
                [
                  '*',
                ],
            },

            Action: [
              's3:GetObject',
            ],

            Resource: [
              `arn:aws:s3:::${this.publicBucket}/*`,
            ],
          },
        ],
      });

    await this.minioClient
      .setBucketPolicy(
        this.publicBucket,
        publicReadPolicy,
      );
  }
}