import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from 'src/gym-service/dto/service.dto';

export class AddServiceToAbonnementTypeDto {
  typeAbonnementId: number;
  serviceId: number;
}

export class AddServiceToAbonnementTypeBulkDto {
  typeAbonnementId: number;
  serviceId: number[];
}

export class TypeAbonnementServiceResponseDto {
  @ApiProperty({
    description: "Identifiant unique du type d'abonnement",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Identifiant du service',
    example: 1,
  })
  serviceId: number;

  @ApiProperty({
    description: "Identifiant du type d'abonnement",
    example: 1,
  })
  typeAbonnementId: number;

  @ApiProperty({
    description: 'Détails du service',
    example: `{
      "id": 1,
      "nom": "Cours de yoga",
      "description": "Cours de yoga pour tous niveaux, dispensé par des professionnels certifiés",
      "dureeStandard": 60,
      "capaciteMax": 20,
      "actif": true,
      "createdAt": "2023-08-01T10:00:00.000Z",
      "updatedAt": "2023-08-01T10:00:00.000Z"
    }`,
  })
  service: ServiceResponseDto;
}
