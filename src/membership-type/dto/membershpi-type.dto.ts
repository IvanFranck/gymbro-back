import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
  ValidateIf,
  IsArray,
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

  @IsArray()
  @IsOptional()
  @ValidateIf(
    (o) =>
      Array.isArray(o.services) &&
      o.services.every((id) => typeof id === 'number'),
  )
  @ApiPropertyOptional({
    description: "tableau de services associés au type d'abonnement",
    example: '[1, 2, 3]',
  })
  services?: number[];

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

  @IsArray()
  @IsOptional()
  @ValidateIf(
    (o) =>
      Array.isArray(o.services) &&
      o.services.every((id: any) => typeof id === 'number'),
  )
  @ApiPropertyOptional({
    description: "tableau de services associés au type d'abonnement",
    example: '[1, 2, 3]',
  })
  services?: number[];

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
