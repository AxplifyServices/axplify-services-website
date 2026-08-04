import {
  Transform,
} from 'class-transformer';

import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  PUBLICATION_LOCALES,
  PUBLICATION_SLUG_PATTERN,
  PUBLICATION_SLUG_PATTERN_MESSAGE,
} from '../publication.constants';

import type {
  PublicationLocale,
} from '../publication.constants';

import {
  normalizeSlug,
  optionalTrimmedString,
  trimRequiredString,
} from '../publication-transformers';

export class PublicationTranslationInputDto {
  @IsIn(
    PUBLICATION_LOCALES,
    {
      message:
        'La langue de la traduction est invalide.',
    },
  )
  locale!:
    PublicationLocale;

  @IsString({
    message:
      'Le titre doit être une chaîne de caractères.',
  })
  @MinLength(
    3,
    {
      message:
        'Le titre doit contenir au moins 3 caractères.',
    },
  )
  @MaxLength(
    255,
    {
      message:
        'Le titre ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    trimRequiredString,
  )
  title!:
    string;

  @IsString({
    message:
      'Le slug doit être une chaîne de caractères.',
  })
  @MinLength(
    1,
    {
      message:
        'Le slug est obligatoire.',
    },
  )
  @MaxLength(
    180,
    {
      message:
        'Le slug ne peut pas dépasser 180 caractères.',
    },
  )
  @Matches(
    PUBLICATION_SLUG_PATTERN,
    {
      message:
        PUBLICATION_SLUG_PATTERN_MESSAGE,
    },
  )
  @Transform(
    normalizeSlug,
  )
  slug!:
    string;

  @IsOptional()
  @IsString({
    message:
      'Le résumé doit être une chaîne de caractères.',
  })
  @MaxLength(
    2_000,
    {
      message:
        'Le résumé ne peut pas dépasser 2 000 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  excerpt?:
    string;

  @IsOptional()
  @IsString({
    message:
      'Le contenu doit être une chaîne de caractères.',
  })
  @MaxLength(
    250_000,
    {
      message:
        'Le contenu de la publication est trop long.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  body?:
    string;

  @IsOptional()
  @IsString({
    message:
      'Le texte alternatif doit être une chaîne de caractères.',
  })
  @MaxLength(
    255,
    {
      message:
        'Le texte alternatif ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  coverAltText?:
    string;

  @IsOptional()
  @IsString({
    message:
      'Le titre SEO doit être une chaîne de caractères.',
  })
  @MaxLength(
    255,
    {
      message:
        'Le titre SEO ne peut pas dépasser 255 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  seoTitle?:
    string;

  @IsOptional()
  @IsString({
    message:
      'La description SEO doit être une chaîne de caractères.',
  })
  @MaxLength(
    320,
    {
      message:
        'La description SEO ne peut pas dépasser 320 caractères.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  seoDescription?:
    string;

  @IsOptional()
  @IsString({
    message:
      'L’URL canonique doit être une chaîne de caractères.',
  })
  @MaxLength(
    2_000,
    {
      message:
        'L’URL canonique est trop longue.',
    },
  )
  @Transform(
    optionalTrimmedString,
  )
  canonicalUrl?:
    string;
}