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
import { GymServiceService } from './gym-service.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  FindServicesQueryDto,
  ServiceResponseDto,
} from './dto/service.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class GymServiceController {
  constructor(private readonly gymService: GymServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau service' })
  @ApiResponse({
    status: 201,
    description: 'Le service a été créé avec succès',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 409,
    description: 'Un service avec ce nom existe déjà',
  })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.gymService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la liste des services avec filtres et pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des services récupérée avec succès',
  })
  findAll(@Query() query: FindServicesQueryDto) {
    return this.gymService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: "Récupérer les statistiques d'utilisation des services",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des services récupérées avec succès',
  })
  getStatistics() {
    return this.gymService.getStatistics();
  }

  @Post('init-defaults')
  @ApiOperation({
    summary: "Initialiser les services par défaut si aucun n'existe",
  })
  @ApiResponse({
    status: 200,
    description: 'Les services par défaut ont été initialisés avec succès',
  })
  initDefaultServices() {
    return this.gymService.initDefaultServices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un service par son ID' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiResponse({
    status: 200,
    description: 'Le service a été trouvé',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.findOne(id);
  }

  @Get('name/:nom')
  @ApiOperation({ summary: 'Récupérer un service par son nom' })
  @ApiParam({ name: 'nom', description: 'Nom du service' })
  @ApiResponse({
    status: 200,
    description: 'Le service a été trouvé',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  findByName(@Param('nom') nom: string) {
    return this.gymService.findByName(nom);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un service' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiResponse({
    status: 200,
    description: 'Le service a été mis à jour avec succès',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Un service avec ce nom existe déjà',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.gymService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un service' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiResponse({
    status: 204,
    description: 'Le service a été supprimé avec succès',
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Le service est associé à des clients',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activer un service' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiResponse({
    status: 200,
    description: 'Le service a été activé avec succès',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.toggleActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver un service' })
  @ApiParam({ name: 'id', description: 'ID du service' })
  @ApiResponse({
    status: 200,
    description: 'Le service a été désactivé avec succès',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.gymService.toggleActive(id, false);
  }
}
