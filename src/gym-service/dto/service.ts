import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Nom du service',
    example: 'Cours de yoga',
  })
  nom: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Description détaillée du service',
    example:
      'Cours de yoga pour tous niveaux, dispensé par des professionnels certifiés',
  })
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(1440) // Maximum 24 heures en minutes
  @Type(() => Number)
  @ApiPropertyOptional({
    description:
      'Durée standard du service en minutes (pour les services temporels comme les cours)',
    example: 60,
    minimum: 1,
    maximum: 1440,
  })
  dureeStandard?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description:
      'Capacité maximale (nombre de personnes pouvant participer simultanément)',
    example: 20,
    minimum: 1,
  })
  capaciteMax?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Indique si le service est actif et disponible',
    default: true,
    example: true,
  })
  actif?: boolean = true;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: 'Nom du service',
    example: 'Cours de yoga avancé',
  })
  nom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Description détaillée du service',
    example: 'Cours de yoga avancé pour les pratiquants expérimentés',
  })
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(1440)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Durée standard du service en minutes',
    example: 90,
    minimum: 1,
    maximum: 1440,
  })
  dureeStandard?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Capacité maximale',
    example: 15,
    minimum: 1,
  })
  capaciteMax?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Indique si le service est actif et disponible',
    example: false,
  })
  actif?: boolean;
}

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du service',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du service',
    example: 'Cours de yoga',
  })
  nom: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du service',
    example:
      'Cours de yoga pour tous niveaux, dispensé par des professionnels certifiés',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Durée standard du service en minutes',
    example: 60,
  })
  dureeStandard?: number;

  @ApiPropertyOptional({
    description: 'Capacité maximale',
    example: 20,
  })
  capaciteMax?: number;

  @ApiProperty({
    description: 'Indique si le service est actif et disponible',
    example: true,
  })
  actif: boolean;

  @ApiProperty({
    description: "Date de création de l'enregistrement",
    example: '2025-01-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date de dernière modification de l'enregistrement",
    example: '2025-01-01T12:00:00Z',
  })
  updatedAt: Date;
}

export class FindServicesQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Recherche par nom ou description',
    example: 'yoga',
  })
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true,
  })
  actif?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Durée minimale en minutes',
    example: 30,
    minimum: 1,
  })
  dureeMin?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Durée maximale en minutes',
    example: 120,
  })
  dureeMax?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Capacité minimale',
    example: 10,
    minimum: 1,
  })
  capaciteMin?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Capacité maximale',
    example: 30,
  })
  capaciteMax?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination',
    default: 1,
    example: 1,
  })
  page?: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    default: 10,
    example: 10,
  })
  limit?: number = 10;
}
