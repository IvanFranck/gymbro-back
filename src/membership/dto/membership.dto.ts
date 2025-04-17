import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAbonnementDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: "L'ID du client" })
  clientId: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: "L'ID du type d'abonnement" })
  typeAbonnementId: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: "L'ID du tarif d'abonnement" })
  tarifAbonnementId: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: "La date de début de l'abonnement" })
  dateDebut: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ description: "La date d'expiration de l'abonnement" })
  dateExpiration: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ description: "Le montant payé pour l'abonnement" })
  montantPaye: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'La date de paiement' })
  datePaiement?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: "L'ID du statut de l'abonnement" })
  statutId: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'ID de la méthode de paiement" })
  methodePaiementId?: number;
}

export class UpdateAbonnementDto {
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'ID du type d'abonnement" })
  typeAbonnementId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "ID du nouveau tarif d'abonnement (par défaut: même tarif que l'abonnement actuel)",
  })
  tarifAbonnementId?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: "La date de début de l'abonnement" })
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: "La date d'expiration de l'abonnement" })
  dateExpiration?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional({ description: "Le montant payé pour l'abonnement" })
  montantPaye?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'La date de paiement' })
  datePaiement?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'ID du statut de l'abonnement" })
  statutId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'ID de la méthode de paiement" })
  methodePaiementId?: number;
}

export class FindAbonnementsQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Filtrer par ID de client' })
  clientId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: "Filtrer par ID de type d'abonnement" })
  typeAbonnementId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Filtrer par ID de statut' })
  statutId?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Filtrer par date de début minimum (incluse)',
  })
  dateDebutMin?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Filtrer par date de début maximum (incluse)',
  })
  dateDebutMax?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "Filtrer par date d'expiration minimum (incluse)",
  })
  dateExpirationMin?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: "Filtrer par date d'expiration maximum (incluse)",
  })
  dateExpirationMax?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  limit?: number = 10;
}

export class AbonnementResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  typeAbonnementId: number;

  @ApiProperty()
  dateDebut: Date;

  @ApiProperty()
  dateExpiration: Date;

  @ApiProperty()
  montantPaye: number;

  @ApiPropertyOptional()
  datePaiement?: Date;

  @ApiProperty()
  statutId: number;

  @ApiPropertyOptional()
  methodePaiementId?: number;

  @ApiProperty()
  client: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };

  @ApiProperty()
  typeAbonnement: {
    id: number;
    nom: string;
    niveau?: string;
    prix: number;
  };

  @ApiProperty()
  statut: {
    id: number;
    nom: string;
    couleur?: string;
  };

  @ApiPropertyOptional()
  methodePaiement?: {
    id: number;
    nom: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RenewAbonnementDto {
  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "Nouvelle date de début (par défaut: date d'expiration actuelle + 1 jour)",
  })
  dateDebut?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "ID du nouveau type d'abonnement (par défaut: même type que l'abonnement actuel)",
  })
  typeAbonnementId?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "ID du nouveau tarif d'abonnement (par défaut: même tarif que l'abonnement actuel)",
  })
  tarifAbonnementId?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "Montant payé pour le renouvellement (par défaut: prix du type d'abonnement)",
  })
  montantPaye?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID de la méthode de paiement',
  })
  methodePaiementId?: number;
}
