import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Le nom de famille du client' })
  nom: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Le prénom du client' })
  prenom: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Le numéro de téléphone du client' })
  telephone: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'adresse postale du client" })
  adresse?: string;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: "L'ID du statut du client" })
  statutId?: number;
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Le nom de famille du client' })
  nom?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Le prénom du client' })
  prenom?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Le numéro de téléphone du client' })
  telephone?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'adresse postale du client" })
  adresse?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ description: "L'ID du statut du client" })
  statutId?: number;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'La date de dernière connexion' })
  derniereConnexion?: string;
}

export class ClientResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenom: string;

  @ApiProperty()
  telephone: string;

  @ApiPropertyOptional()
  adresse?: string;

  @ApiProperty()
  dateInscription: Date;

  @ApiPropertyOptional()
  derniereConnexion?: Date;

  @ApiProperty()
  statutId: number;

  @ApiProperty()
  statut: {
    id: number;
    nom: string;
    couleur?: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindClientsQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Recherche par nom ou prénom' })
  search?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ description: 'Filtrer par ID de statut' })
  statutId?: number;

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
