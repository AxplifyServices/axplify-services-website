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

type UploadedVideo = {
  url:
    string;

  objectName:
    string;

  mimeType:
    'video/mp4' |
    'video/webm';

  extension:
    'mp4' |
    'webm';

  width:
    null;

  height:
    null;

  size:
    number;
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

  private readonly allowedVideoTypes:
    Set<string>;

  private readonly maxVideoSize:
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

    this.maxVideoSize =
      Number(
        this.configService
          .get<string>(
            'UPLOAD_MAX_VIDEO_SIZE_BYTES',
            '104857600',
          ),
      );

    this.allowedVideoTypes =
      new Set(
        this.configService
          .get<string>(
            'UPLOAD_ALLOWED_VIDEO_TYPES',
            'video/mp4,video/webm',
          )
          .split(
            ',',
          )
          .map(
            mimeType =>
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

    let outputWidth:
      number;

    let outputHeight:
      number;

    try {
      const result =
        await sharp(
          file.buffer,
          {
            failOn:
              'error',
          },
        )
          .rotate()
          .webp({
            quality:
              86,

            effort:
              5,

            smartSubsample:
              true,
          })
          .toBuffer({
            resolveWithObject:
              true,
          });

      processedImage =
        result.data;

      outputWidth =
        result.info.width;

      outputHeight =
        result.info.height;
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
        outputWidth,

      height:
        outputHeight,

      size:
        processedImage.length,
    };
  }

  async uploadClientLogo(
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

    let outputWidth:
      number;

    let outputHeight:
      number;

    try {
      const result =
        await sharp(
          file.buffer,
          {
            failOn:
              'error',
          },
        )
          .rotate()
          .resize({
            width:
              1200,

            height:
              700,

            fit:
              'inside',

            withoutEnlargement:
              true,
          })
          .webp({
            quality:
              90,

            effort:
              5,

            smartSubsample:
              true,

            alphaQuality:
              100,
          })
          .toBuffer({
            resolveWithObject:
              true,
          });

      processedImage =
        result.data;

      outputWidth =
        result.info.width;

      outputHeight =
        result.info.height;
    } catch {
      throw new BadRequestException(
        'Le fichier envoyé ne contient pas une image valide.',
      );
    }

    const objectName =
      [
        'clients',
        'logos',
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
        'Impossible d’enregistrer le logo client dans MinIO.',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new InternalServerErrorException(
        'Impossible d’enregistrer le logo du client.',
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
        outputWidth,

      height:
        outputHeight,

      size:
        processedImage.length,
    };
  }  

  async uploadHomepageBrochureVideo(
    file:
      Express.Multer.File,
  ):
    Promise<UploadedVideo>
  {
    this.validateVideoFile(
      file,
    );

    const extension =
      file.mimetype ===
      'video/webm'
        ? 'webm'
        : 'mp4';

    const mimeType:
      UploadedVideo['mimeType'] =
        extension ===
        'webm'
          ? 'video/webm'
          : 'video/mp4';

    const objectName =
      [
        'homepage',
        'brochures',
        `${randomUUID()}.${extension}`,
      ].join(
        '/',
      );

    try {
      await this.minioClient
        .putObject(
          this.publicBucket,
          objectName,
          file.buffer,
          file.size,
          {
            'Content-Type':
              mimeType,

            /*
             * Les fichiers utilisent un UUID : ils sont immuables.
             * Le navigateur peut donc les conserver longtemps.
             */
            'Cache-Control':
              'public, max-age=31536000, immutable',
          },
        );
    } catch (
      error
    ) {
      this.logger.error(
        'Impossible d’enregistrer la vidéo de brochure dans MinIO.',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new InternalServerErrorException(
        'Impossible d’enregistrer la vidéo.',
      );
    }

    return {
      url:
        `${this.publicUrl}/${objectName}`,

      objectName,

      mimeType,

      extension,

      width:
        null,

      height:
        null,

      size:
        file.size,
    };
  }  

  async deleteClientLogoByUrl(
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
        'clients/logos/',
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
        `Impossible de supprimer le logo MinIO ${objectName}.`,
      );

      this.logger.debug(
        error,
      );
    }
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

  private validateVideoFile(
    file:
      Express.Multer.File | undefined,
  ):
    asserts file is Express.Multer.File
  {
    if (
      !file
    ) {
      throw new BadRequestException(
        'Aucun fichier vidéo n’a été envoyé.',
      );
    }

    if (
      file.size <=
      0
    ) {
      throw new BadRequestException(
        'Le fichier vidéo envoyé est vide.',
      );
    }

    if (
      file.size >
      this.maxVideoSize
    ) {
      throw new BadRequestException(
        `La vidéo dépasse la taille maximale autorisée de ${Math.round(
          this.maxVideoSize /
            1024 /
            1024,
        )} Mo.`,
      );
    }

    if (
      !this.allowedVideoTypes
        .has(
          file.mimetype,
        )
    ) {
      throw new BadRequestException(
        'Format vidéo non autorisé. Utilisez MP4 ou WebM.',
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