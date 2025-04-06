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
import { StatusService } from './status.service';
import {
  CreateStatutDto,
  UpdateStatutDto,
  FindStatutsQueryDto,
  StatutResponseDto,
} from './dto/status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('statuts')
@ApiBearerAuth()
@Controller('statuts')
export class StatusController {
  constructor(private readonly statutService: StatusService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau statut' })
  @ApiResponse({
    status: 201,
    description: 'Le statut a été créé avec succès',
    type: StatutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 409,
    description: "Un statut avec ce nom et ce type d'entité existe déjà",
  })
  create(@Body() createStatutDto: CreateStatutDto) {
    return this.statutService.create(createStatutDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer la liste des statuts avec filtres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des statuts récupérée avec succès',
    type: [StatutResponseDto],
  })
  findAll(@Query() query: FindStatutsQueryDto) {
    return this.statutService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: "Récupérer les statistiques d'utilisation des statuts",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des statuts récupérées avec succès',
  })
  getStatistics() {
    return this.statutService.getStatistics();
  }

  @Post('init-defaults')
  @ApiOperation({
    summary: "Initialiser les statuts par défaut si aucun n'existe",
  })
  @ApiResponse({
    status: 200,
    description: 'Les statuts par défaut ont été initialisés avec succès',
  })
  initDefaultStatuts() {
    return this.statutService.initDefaultStatuts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un statut par son ID' })
  @ApiParam({ name: 'id', description: 'ID du statut' })
  @ApiResponse({
    status: 200,
    description: 'Le statut a été trouvé',
    type: StatutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Statut non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statutService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un statut' })
  @ApiParam({ name: 'id', description: 'ID du statut' })
  @ApiResponse({
    status: 200,
    description: 'Le statut a été mis à jour avec succès',
    type: StatutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Statut non trouvé' })
  @ApiResponse({
    status: 409,
    description:
      "Un statut avec ce nom et ce type d'entité existe déjà ou le statut est utilisé",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatutDto: UpdateStatutDto,
  ) {
    return this.statutService.update(id, updateStatutDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un statut' })
  @ApiParam({ name: 'id', description: 'ID du statut' })
  @ApiResponse({
    status: 204,
    description: 'Le statut a été supprimé avec succès',
  })
  @ApiResponse({ status: 404, description: 'Statut non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Le statut est utilisé par des clients ou des abonnements',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statutService.remove(id);
  }

  @Get('type/:typeEntite')
  @ApiOperation({
    summary: "Récupérer tous les statuts pour un type d'entité donné",
  })
  @ApiParam({
    name: 'typeEntite',
    description: "Type d'entité (Client ou Abonnement)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des statuts récupérée avec succès',
    type: [StatutResponseDto],
  })
  findByType(@Param('typeEntite') typeEntite: string) {
    return this.statutService.findAll({ typeEntite: typeEntite as any });
  }

  @Get('name/:nom/type/:typeEntite')
  @ApiOperation({
    summary: "Récupérer un statut par son nom et son type d'entité",
  })
  @ApiParam({ name: 'nom', description: 'Nom du statut' })
  @ApiParam({
    name: 'typeEntite',
    description: "Type d'entité (Client ou Abonnement)",
  })
  @ApiResponse({
    status: 200,
    description: 'Le statut a été trouvé',
    type: StatutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Statut non trouvé' })
  findByNameAndType(
    @Param('nom') nom: string,
    @Param('typeEntite') typeEntite: string,
  ) {
    return this.statutService.findByNameAndType(nom, typeEntite);
  }
}
