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
import { MembershipService } from './membership.service';
import {
  CreateAbonnementDto,
  UpdateAbonnementDto,
  FindAbonnementsQueryDto,
  AbonnementResponseDto,
  RenewAbonnementDto,
} from './dto/membership.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('abonnements')
@ApiBearerAuth()
@Controller('abonnements')
export class MembershipController {
  constructor(private readonly abonnementService: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel abonnement' })
  @ApiResponse({
    status: 201,
    description: "L'abonnement a été créé avec succès",
    type: AbonnementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Ressource associée non trouvée' })
  async create(@Body() createAbonnementDto: CreateAbonnementDto) {
    return this.abonnementService.create(createAbonnementDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la liste des abonnements avec filtres et pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des abonnements récupérée avec succès',
  })
  async findAll(@Query() query: FindAbonnementsQueryDto) {
    return this.abonnementService.findAll(query);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Récupérer les abonnements qui expirent bientôt' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Nombre de jours avant expiration (défaut: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des abonnements expirant bientôt récupérée avec succès',
  })
  async findExpiringAbonnements(@Query('days') days?: number) {
    return this.abonnementService.findExpiringAbonnements(days);
  }

  @Post('update-expired')
  @ApiOperation({ summary: 'Mettre à jour le statut des abonnements expirés' })
  @ApiResponse({
    status: 200,
    description: 'Les abonnements expirés ont été mis à jour avec succès',
  })
  async updateExpiredAbonnements() {
    return this.abonnementService.updateExpiredAbonnements();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un abonnement par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'abonnement" })
  @ApiResponse({
    status: 200,
    description: "L'abonnement a été trouvé",
    type: AbonnementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.abonnementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un abonnement' })
  @ApiParam({ name: 'id', description: "ID de l'abonnement" })
  @ApiResponse({
    status: 200,
    description: "L'abonnement a été mis à jour avec succès",
    type: AbonnementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 404,
    description: 'Abonnement ou ressource associée non trouvée',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAbonnementDto: UpdateAbonnementDto,
  ) {
    return this.abonnementService.update(id, updateAbonnementDto);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renouveler un abonnement existant' })
  @ApiParam({ name: 'id', description: "ID de l'abonnement à renouveler" })
  @ApiResponse({
    status: 201,
    description: "L'abonnement a été renouvelé avec succès",
    type: AbonnementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 404,
    description: 'Abonnement ou ressource associée non trouvée',
  })
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @Body() renewAbonnementDto: RenewAbonnementDto,
  ) {
    return this.abonnementService.renew(id, renewAbonnementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un abonnement' })
  @ApiParam({ name: 'id', description: "ID de l'abonnement" })
  @ApiResponse({
    status: 204,
    description: "L'abonnement a été supprimé avec succès",
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  @ApiResponse({
    status: 409,
    description: "L'abonnement possède des services associés",
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.abonnementService.remove(id);
  }
}
