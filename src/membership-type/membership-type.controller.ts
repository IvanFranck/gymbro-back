import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import {
  CreateTypeAbonnementDto,
  UpdateTypeAbonnementDto,
  FindTypeAbonnementsQueryDto,
  TypeAbonnementResponseDto,
} from './dto/membershpi-type.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('types-abonnements')
@ApiBearerAuth()
@Controller('types-abonnements')
export class MembershipTypeController {
  constructor(private readonly typeAbonnementService: MembershipTypeService) {}

  @Post()
  @ApiOperation({ summary: "Créer un nouveau type d'abonnement" })
  @ApiResponse({
    status: 201,
    description: "Le type d'abonnement a été créé avec succès",
    type: TypeAbonnementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 409,
    description: "Un type d'abonnement avec ce nom existe déjà",
  })
  create(@Body() createTypeAbonnementDto: CreateTypeAbonnementDto) {
    return this.typeAbonnementService.create(createTypeAbonnementDto);
  }

  @Get()
  @ApiOperation({
    summary:
      "Récupérer la liste des types d'abonnements avec filtres et pagination",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des types d'abonnements récupérée avec succès",
  })
  findAll(@Query() query: FindTypeAbonnementsQueryDto) {
    return this.typeAbonnementService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: "Récupérer les statistiques des types d'abonnements",
  })
  @ApiResponse({
    status: 200,
    description: "Statistiques des types d'abonnements récupérées avec succès",
  })
  getStatistics() {
    return this.typeAbonnementService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer un type d'abonnement par son ID" })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  @ApiResponse({
    status: 200,
    description: "Le type d'abonnement a été trouvé",
    type: TypeAbonnementResponseDto,
  })
  @ApiResponse({ status: 404, description: "Type d'abonnement non trouvé" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.typeAbonnementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour un type d'abonnement" })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  @ApiResponse({
    status: 200,
    description: "Le type d'abonnement a été mis à jour avec succès",
    type: TypeAbonnementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: "Type d'abonnement non trouvé" })
  @ApiResponse({
    status: 409,
    description: "Un type d'abonnement avec ce nom existe déjà",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTypeAbonnementDto: UpdateTypeAbonnementDto,
  ) {
    return this.typeAbonnementService.update(id, updateTypeAbonnementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer un type d'abonnement" })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  @ApiResponse({
    status: 204,
    description: "Le type d'abonnement a été supprimé avec succès",
  })
  @ApiResponse({ status: 404, description: "Type d'abonnement non trouvé" })
  @ApiResponse({
    status: 409,
    description: "Le type d'abonnement est utilisé par des abonnements",
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.typeAbonnementService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: "Désactiver un type d'abonnement" })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  @ApiResponse({
    status: 200,
    description: "Le type d'abonnement a été désactivé avec succès",
    type: TypeAbonnementResponseDto,
  })
  @ApiResponse({ status: 404, description: "Type d'abonnement non trouvé" })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.typeAbonnementService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: "Réactiver un type d'abonnement" })
  @ApiParam({ name: 'id', description: "ID du type d'abonnement" })
  @ApiResponse({
    status: 200,
    description: "Le type d'abonnement a été réactivé avec succès",
    type: TypeAbonnementResponseDto,
  })
  @ApiResponse({ status: 404, description: "Type d'abonnement non trouvé" })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.typeAbonnementService.activate(id);
  }
}
