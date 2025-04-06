import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Les types d'entités valides pour les statuts
const ENTITY_TYPES = ['customer', 'membership'];
type EntityType = 'customer' | 'membership';

export class CreateStatutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Nom du statut',
    example: 'Actif',
  })
  nom: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ENTITY_TYPES)
  @ApiProperty({
    description: "Type d'entité auquel s'applique le statut",
    example: 'customer',
    enum: ENTITY_TYPES,
  })
  typeEntite: EntityType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiPropertyOptional({
    description: 'Description détaillée du statut',
    example: 'Client actif avec abonnement en cours de validité',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @ApiPropertyOptional({
    description:
      "Code couleur pour affichage dans l'interface (format hexadécimal, rgb, ou nom de couleur)",
    example: '#4CAF50',
  })
  couleur?: string;
}

export class UpdateStatutDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @ApiPropertyOptional({
    description: 'Nom du statut',
    example: 'Actif Premium',
  })
  nom?: string;

  @IsString()
  @IsOptional()
  @IsIn(ENTITY_TYPES)
  @ApiPropertyOptional({
    description: "Type d'entité auquel s'applique le statut",
    example: 'Client',
    enum: ENTITY_TYPES,
  })
  typeEntite?: EntityType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiPropertyOptional({
    description: 'Description détaillée du statut',
    example: 'Client actif avec abonnement premium en cours de validité',
  })
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @ApiPropertyOptional({
    description:
      "Code couleur pour affichage dans l'interface (format hexadécimal, rgb, ou nom de couleur)",
    example: '#00E676',
  })
  couleur?: string;
}

export class StatutResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du statut',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du statut',
    example: 'Actif',
  })
  nom: string;

  @ApiProperty({
    description: "Type d'entité auquel s'applique le statut",
    example: 'Client',
    enum: ENTITY_TYPES,
  })
  typeEntite: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du statut',
    example: 'Client actif avec abonnement en cours de validité',
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Code couleur pour affichage dans l'interface",
    example: '#4CAF50',
  })
  couleur?: string;

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

export class FindStatutsQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Recherche par nom ou description',
    example: 'actif',
  })
  search?: string;

  @IsString()
  @IsOptional()
  @IsIn(ENTITY_TYPES)
  @ApiPropertyOptional({
    description: "Filtrer par type d'entité",
    example: 'Client',
    enum: ENTITY_TYPES,
  })
  typeEntite?: EntityType;
}
