import {
  IsInt,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class HomepageBrochureImageCropDto {
  /**
   * Décalage horizontal normalisé par rapport à la taille du cadre.
   *
   * La plage volontairement large évite qu'une valeur manipulée côté client
   * provoque un déplacement ou un transform CSS démesuré.
   */
  @IsNumber()
  @Min(-3)
  @Max(3)
  offsetX:
    number;

  /**
   * Décalage vertical normalisé par rapport à la taille du cadre.
   */
  @IsNumber()
  @Min(-3)
  @Max(3)
  offsetY:
    number;

  /**
   * Facteur d'agrandissement réellement appliqué.
   *
   * 0.333333 correspond à l'extrémité -200 % du curseur.
   * 1 correspond à 0 %.
   * 3 correspond à +200 %.
   */
  @IsNumber()
  @Min(0.333333)
  @Max(3)
  zoom:
    number;

  /**
   * Dimensions de l'image WebP réellement enregistrée dans MinIO.
   */
  @IsInt()
  @Min(1)
  @Max(30000)
  naturalWidth:
    number;

  @IsInt()
  @Min(1)
  @Max(30000)
  naturalHeight:
    number;
}