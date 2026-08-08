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
  execFile,
} from 'node:child_process';

import {
  promisify,
} from 'node:util';

import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';

import {
  tmpdir,
} from 'node:os';

import {
  join,
} from 'node:path';

import {
  Client as MinioClient,
} from 'minio';

import sharp from 'sharp';

import ffmpegPath from 'ffmpeg-static';

const execFileAsync =
  promisify(
    execFile,
  );

export type UploadedImage = {
  url: string;
  objectName: string;
  mimeType: 'image/webp';
  extension: 'webp';
  width: number | null;
  height: number | null;
  size: number;
};

export type UploadedVideo = {
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

export type UploadedPublicationVideo = {
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

  durationSeconds:
    null;

  posterUrl:
    string;

  posterObjectName:
    string;

  posterFrameSeconds:
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

  async uploadPublicationImage(
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
              2400,

            height:
              1600,

            fit:
              'inside',

            withoutEnlargement:
              true,
          })
          .webp({
            quality:
              88,

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
        'publications',
        'media',
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
        'Impossible d’enregistrer l’image de publication dans MinIO.',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new InternalServerErrorException(
        'Impossible d’enregistrer l’image de publication.',
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

async uploadProductImage(
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
            2000,

          height:
            1600,

          fit:
            'inside',

          withoutEnlargement:
            true,
        })
        .webp({
          quality:
            88,

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
      'products',
      'images',
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
      'Impossible d’enregistrer l’image produit dans MinIO.',
      error instanceof Error
        ? error.stack
        : undefined,
    );

    throw new InternalServerErrorException(
      'Impossible d’enregistrer l’image produit.',
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

  async uploadPublicationVideo(
    file:
      Express.Multer.File,
  ):
    Promise<UploadedPublicationVideo>
  {
    this.validateVideoFile(
      file,
    );

    if (
      !ffmpegPath
    ) {
      throw new InternalServerErrorException(
        'FFmpeg n’est pas disponible sur le serveur.',
      );
    }

    const extension =
      file.mimetype ===
      'video/webm'
        ? 'webm'
        : 'mp4';

    const mimeType:
      UploadedPublicationVideo[
        'mimeType'
      ] =
        extension ===
        'webm'
          ? 'video/webm'
          : 'video/mp4';

    const mediaId =
      randomUUID();

    const videoObjectName =
      [
        'publications',
        'media',
        `${mediaId}.${extension}`,
      ].join(
        '/',
      );

    const posterObjectName =
      [
        'publications',
        'posters',
        `${mediaId}.webp`,
      ].join(
        '/',
      );

    const temporaryDirectory =
      await mkdtemp(
        join(
          tmpdir(),
          'axplify-publication-',
        ),
      );

    const inputPath =
      join(
        temporaryDirectory,
        `input.${extension}`,
      );

    const rawPosterPath =
      join(
        temporaryDirectory,
        'poster.png',
      );

    let posterFrameSeconds =
      1;

    try {
      await writeFile(
        inputPath,
        file.buffer,
      );

      try {
        await this.extractVideoFrame({
          inputPath,

          outputPath:
            rawPosterPath,

          frameSeconds:
            posterFrameSeconds,
        });
      } catch {
        /*
         * Une vidéo très courte peut ne pas contenir de frame à 1 seconde.
         * Dans ce cas, on recommence immédiatement au début.
         */
        posterFrameSeconds =
          0;

        await this.extractVideoFrame({
          inputPath,

          outputPath:
            rawPosterPath,

          frameSeconds:
            posterFrameSeconds,
        });
      }

      const rawPoster =
        await readFile(
          rawPosterPath,
        );

      const posterResult =
        await sharp(
          rawPoster,
          {
            failOn:
              'error',
          },
        )
          .resize({
            width:
              1600,

            height:
              1000,

            fit:
              'inside',

            withoutEnlargement:
              true,
          })
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

      try {
        await this.minioClient
          .putObject(
            this.publicBucket,
            videoObjectName,
            file.buffer,
            file.size,
            {
              'Content-Type':
                mimeType,

              'Cache-Control':
                'public, max-age=31536000, immutable',
            },
          );

        await this.minioClient
          .putObject(
            this.publicBucket,
            posterObjectName,
            posterResult.data,
            posterResult.data.length,
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
        await Promise.allSettled([
          this.minioClient
            .removeObject(
              this.publicBucket,
              videoObjectName,
            ),

          this.minioClient
            .removeObject(
              this.publicBucket,
              posterObjectName,
            ),
        ]);

        this.logger.error(
          'Impossible d’enregistrer la vidéo de publication dans MinIO.',
          error instanceof Error
            ? error.stack
            : undefined,
        );

        throw new InternalServerErrorException(
          'Impossible d’enregistrer la vidéo de publication.',
        );
      }

      return {
        url:
          `${this.publicUrl}/${videoObjectName}`,

        objectName:
          videoObjectName,

        mimeType,

        extension,

        width:
          null,

        height:
          null,

        size:
          file.size,

        durationSeconds:
          null,

        posterUrl:
          `${this.publicUrl}/${posterObjectName}`,

        posterObjectName,

        posterFrameSeconds,
      };
    } catch (
      error
    ) {
      if (
        error instanceof
          BadRequestException ||
        error instanceof
          InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(
        'Impossible de traiter la vidéo de publication.',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new BadRequestException(
        'La vidéo envoyée est invalide ou ne peut pas être traitée.',
      );
    } finally {
      await rm(
        temporaryDirectory,
        {
          recursive:
            true,

          force:
            true,
        },
      );
    }
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

  async deletePublicationFileByUrl(
    fileUrl:
      string |
      null |
      undefined,
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

    const isPublicationFile =
      objectName.startsWith(
        'publications/media/',
      ) ||
      objectName.startsWith(
        'publications/posters/',
      );

    if (
      !isPublicationFile
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
        `Impossible de supprimer le média de publication ${objectName}.`,
      );

      this.logger.debug(
        error,
      );
    }
  }

  isPublicationMediaUrl(
    fileUrl:
      string |
      null |
      undefined,
  ) {
    if (
      !fileUrl
    ) {
      return false;
    }

    return fileUrl.startsWith(
      `${this.publicUrl}/publications/media/`,
    );
  }

  isPublicationPosterUrl(
    fileUrl:
      string |
      null |
      undefined,
  ) {
    if (
      !fileUrl
    ) {
      return false;
    }

    return fileUrl.startsWith(
      `${this.publicUrl}/publications/posters/`,
    );
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

  private async extractVideoFrame({
    inputPath,
    outputPath,
    frameSeconds,
  }: {
    inputPath:
      string;

    outputPath:
      string;

    frameSeconds:
      number;
  }):
    Promise<void>
  {
    const executablePath =
      ffmpegPath;

    if (
      !executablePath
    ) {
      throw new InternalServerErrorException(
        'FFmpeg n’est pas disponible.',
      );
    }

    try {
      await execFileAsync(
        executablePath,
        [
          '-hide_banner',
          '-loglevel',
          'error',

          '-ss',
          String(
            frameSeconds,
          ),

          '-i',
          inputPath,

          '-frames:v',
          '1',

          '-f',
          'image2',

          '-y',
          outputPath,
        ],
        {
          windowsHide:
            true,

          maxBuffer:
            10 *
            1024 *
            1024,
        },
      );
    } catch (
      error
    ) {
      const stderr =
        typeof error ===
          'object' &&
        error !==
          null &&
        'stderr' in
          error &&
        typeof error.stderr ===
          'string'
          ? error.stderr
          : '';

      throw new Error(
        stderr.trim() ||
        'FFmpeg n’a pas pu extraire une image de la vidéo.',
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