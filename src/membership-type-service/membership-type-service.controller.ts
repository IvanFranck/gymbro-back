import { Controller, Param, Get, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MembershipTypeServiceService } from './membership-type-service.service';

@ApiTags('membership-type-service')
@ApiBearerAuth()
@Controller('membership-type-service')
export class MembershipTypeServiceController {
  constructor(private membershipTypeService: MembershipTypeServiceService) {}

  @Get('type/:id')
  @ApiOperation({
    summary: "Récupérer tous les services d'un type d'abonnement",
  })
  @ApiResponse({
    status: 200,
    description:
      "Liste des services d'un type d'abonnement récupérées avec succès",
  })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  getServicesByType(@Param('id', ParseIntPipe) typeAbonnementId: number) {
    return this.membershipTypeService.getServicesByAbonnementType(
      typeAbonnementId,
    );
  }
}
