import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateClientServiceDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: 'ID du client',
    example: 1,
  })
  clientId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: 'ID du service',
    example: 2,
  })
  serviceId: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Date de début d'accès au service",
    example: '2025-01-01T00:00:00Z',
  })
  dateDebutAcces: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "Date de fin d'accès au service (optionnel pour un accès sans limite de durée)",
    example: '2025-12-31T23:59:59Z',
  })
  dateFinAcces?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "ID de l'abonnement associé à cet accès (si applicable)",
    example: 5,
  })
  abonnementId?: number;
}

export class UpdateClientServiceDto {
  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Date de début d'accès au service",
    example: '2025-01-15T00:00:00Z',
  })
  dateDebutAcces?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Date de fin d'accès au service",
    example: '2026-01-14T23:59:59Z',
  })
  dateFinAcces?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "ID de l'abonnement associé à cet accès",
    example: 6,
  })
  abonnementId?: number;
}

export class ClientServiceResponseDto {
  @ApiProperty({
    description: "ID unique de l'association client-service",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID du client',
    example: 1,
  })
  clientId: number;

  @ApiProperty({
    description: 'ID du service',
    example: 2,
  })
  serviceId: number;

  @ApiProperty({
    description: "Date de début d'accès au service",
    example: '2025-01-01T00:00:00Z',
  })
  dateDebutAcces: Date;

  @ApiPropertyOptional({
    description: "Date de fin d'accès au service",
    example: '2025-12-31T23:59:59Z',
  })
  dateFinAcces?: Date;

  @ApiPropertyOptional({
    description: "ID de l'abonnement associé à cet accès",
    example: 5,
  })
  abonnementId?: number;

  @ApiProperty({
    description: 'Informations sur le client',
  })
  client: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };

  @ApiProperty({
    description: 'Informations sur le service',
  })
  service: {
    id: number;
    nom: string;
    description?: string;
    dureeStandard?: number;
  };

  @ApiPropertyOptional({
    description: "Informations sur l'abonnement associé",
  })
  abonnement?: {
    id: number;
    dateDebut: Date;
    dateExpiration: Date;
    typeAbonnement: {
      nom: string;
    };
  };

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

export class FindClientServicesQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Filtrer par ID de client',
    example: 1,
  })
  clientId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Filtrer par ID de service',
    example: 2,
  })
  serviceId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: "Filtrer par ID d'abonnement",
    example: 5,
  })
  abonnementId?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filtrer par accès actifs à cette date',
    example: '2025-06-15T00:00:00Z',
  })
  dateActive?: string;

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

export class BulkCreateAccessDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    description: "ID de l'abonnement auquel associer tous les accès",
    example: 5,
  })
  abonnementId: number;

  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Liste des IDs de services à accorder',
    example: [1, 2, 3],
    type: [Number],
  })
  serviceIds: number[];

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "Date de début d'accès commune (par défaut: date actuelle)",
    example: '2025-01-01T00:00:00Z',
  })
  dateDebutAcces?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "Date de fin d'accès commune (par défaut: date d'expiration de l'abonnement)",
    example: '2025-12-31T23:59:59Z',
  })
  dateFinAcces?: string;
}
