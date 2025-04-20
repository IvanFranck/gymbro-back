import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePricingDto {
  @IsInt()
  @ApiProperty({ description: "ID de type d'abonnement" })
  typeAbonnementId: number;

  @IsString()
  @ApiProperty({ description: 'Genre' })
  genre: string;

  @IsInt()
  @ApiPropertyOptional({ description: 'Durée en jours' })
  dureeJours: number;

  @IsInt()
  @ApiProperty({ description: 'Prix' })
  prix: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Indique si le tarif est actif et disponible',
    default: true,
    example: true,
  })
  actif?: boolean = true;
}

export class UpdatePricingDto {
  @IsString()
  @ApiProperty({ description: 'Genre' })
  genre?: string;

  @IsInt()
  @ApiPropertyOptional({ description: 'Durée en jours' })
  dureeJours?: number;

  @IsInt()
  @ApiProperty({ description: 'Prix' })
  prix?: number;
}

export class FindPricingQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: "Filtrer par ID de type d'abonnement" })
  typeAbonnementId?: number;

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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Filtrer par prix minimum (inclus)',
  })
  prixMin?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Filtrer par prix maximum (inclus)',
  })
  prixMax?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Recherche par genre',
    example: 'homme',
  })
  genre?: string;
}
