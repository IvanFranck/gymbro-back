import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMethodePaiementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Nom de la méthode de paiement',
    example: 'Carte de crédit',
  })
  nom: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Description détaillée de la méthode de paiement',
    example: 'Paiement par carte bancaire (Visa, Mastercard, etc.)',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Indique si la méthode de paiement est active et disponible',
    default: true,
    example: true,
  })
  actif?: boolean = true;
}

export class UpdateMethodePaiementDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: 'Nom de la méthode de paiement',
    example: 'Carte bancaire',
  })
  nom?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Description détaillée de la méthode de paiement',
    example: 'Paiement par carte bancaire (Visa, Mastercard, American Express)',
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @ApiPropertyOptional({
    description: 'Indique si la méthode de paiement est active et disponible',
    example: false,
  })
  actif?: boolean;
}

export class MethodePaiementResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la méthode de paiement',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom de la méthode de paiement',
    example: 'Carte de crédit',
  })
  nom: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la méthode de paiement',
    example: 'Paiement par carte bancaire (Visa, Mastercard, etc.)',
  })
  description?: string;

  @ApiProperty({
    description: 'Indique si la méthode de paiement est active et disponible',
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

export class FindMethodesPaiementQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Recherche par nom ou description',
    example: 'carte',
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
}
