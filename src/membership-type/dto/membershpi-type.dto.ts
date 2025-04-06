import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTypeAbonnementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: "Nom du type d'abonnement",
    example: 'Abonnement Premium Annuel',
  })
  nom: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiPropertyOptional({
    description: "Niveau du type d'abonnement (Basic, Standard, Premium, etc.)",
    example: 'Premium',
  })
  niveau?: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: "Durée de l'abonnement en jours",
    example: 365,
    minimum: 1,
  })
  dureeJours: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: "Prix de l'abonnement",
    example: 899.99,
    minimum: 0,
  })
  prix: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Description détaillée du type d'abonnement",
    example: 'Accès illimité à toutes les installations et cours pendant un an',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Indique si le type d'abonnement est actif et disponible",
    default: true,
    example: true,
  })
  actif?: boolean = true;
}

export class UpdateTypeAbonnementDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: "Nom du type d'abonnement",
    example: 'Abonnement Premium Annuel Plus',
  })
  nom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiPropertyOptional({
    description: "Niveau du type d'abonnement (Basic, Standard, Premium, etc.)",
    example: 'Premium Plus',
  })
  niveau?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "Durée de l'abonnement en jours",
    example: 365,
    minimum: 1,
  })
  dureeJours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "Prix de l'abonnement",
    example: 999.99,
    minimum: 0,
  })
  prix?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Description détaillée du type d'abonnement",
    example:
      'Accès illimité à toutes les installations et cours premium pendant un an',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Indique si le type d'abonnement est actif et disponible",
    example: false,
  })
  actif?: boolean;
}

export class TypeAbonnementResponseDto {
  @ApiProperty({
    description: "Identifiant unique du type d'abonnement",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Nom du type d'abonnement",
    example: 'Abonnement Premium Annuel',
  })
  nom: string;

  @ApiPropertyOptional({
    description: "Niveau du type d'abonnement",
    example: 'Premium',
  })
  niveau?: string;

  @ApiProperty({
    description: "Durée de l'abonnement en jours",
    example: 365,
  })
  dureeJours: number;

  @ApiProperty({
    description: "Prix de l'abonnement",
    example: 899.99,
  })
  prix: number;

  @ApiPropertyOptional({
    description: "Description détaillée du type d'abonnement",
    example: 'Accès illimité à toutes les installations et cours pendant un an',
  })
  description?: string;

  @ApiProperty({
    description: "Indique si le type d'abonnement est actif et disponible",
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

export class FindTypeAbonnementsQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Recherche par nom ou niveau',
    example: 'premium',
  })
  search?: string;

  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => o.actif !== undefined)
  @Type(() => Boolean)
  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true,
  })
  actif?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Durée minimale en jours',
    example: 30,
  })
  dureeMin?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Durée maximale en jours',
    example: 365,
  })
  dureeMax?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 100,
  })
  prixMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 1000,
  })
  prixMax?: number;

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
