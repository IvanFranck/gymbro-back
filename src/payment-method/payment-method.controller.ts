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
import { PaymentMethodService } from './payment-method.service';
import {
  CreateMethodePaiementDto,
  UpdateMethodePaiementDto,
  FindMethodesPaiementQueryDto,
  MethodePaiementResponseDto,
} from './dto/payment-methos.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('methodes-paiement')
@ApiBearerAuth()
@Controller('methodes-paiement')
export class PaymentMethodController {
  constructor(private readonly methodePaiementService: PaymentMethodService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle méthode de paiement' })
  @ApiResponse({
    status: 201,
    description: 'La méthode de paiement a été créée avec succès',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 409,
    description: 'Une méthode de paiement avec ce nom existe déjà',
  })
  create(@Body() createMethodePaiementDto: CreateMethodePaiementDto) {
    return this.methodePaiementService.create(createMethodePaiementDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la liste des méthodes de paiement avec filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des méthodes de paiement récupérée avec succès',
    type: [MethodePaiementResponseDto],
  })
  findAll(@Query() query: FindMethodesPaiementQueryDto) {
    return this.methodePaiementService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary:
      "Récupérer les statistiques d'utilisation des méthodes de paiement",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des méthodes de paiement récupérées avec succès',
  })
  getStatistics() {
    return this.methodePaiementService.getStatistics();
  }

  @Post('init-defaults')
  @ApiOperation({
    summary:
      "Initialiser les méthodes de paiement par défaut si aucune n'existe",
  })
  @ApiResponse({
    status: 200,
    description:
      'Les méthodes de paiement par défaut ont été initialisées avec succès',
  })
  initDefaultMethodesPaiement() {
    return this.methodePaiementService.initDefaultMethodesPaiement();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une méthode de paiement par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la méthode de paiement' })
  @ApiResponse({
    status: 200,
    description: 'La méthode de paiement a été trouvée',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.methodePaiementService.findOne(id);
  }

  @Get('name/:nom')
  @ApiOperation({ summary: 'Récupérer une méthode de paiement par son nom' })
  @ApiParam({ name: 'nom', description: 'Nom de la méthode de paiement' })
  @ApiResponse({
    status: 200,
    description: 'La méthode de paiement a été trouvée',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  findByName(@Param('nom') nom: string) {
    return this.methodePaiementService.findByName(nom);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une méthode de paiement' })
  @ApiParam({ name: 'id', description: 'ID de la méthode de paiement' })
  @ApiResponse({
    status: 200,
    description: 'La méthode de paiement a été mise à jour avec succès',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  @ApiResponse({
    status: 409,
    description: 'Une méthode de paiement avec ce nom existe déjà',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMethodePaiementDto: UpdateMethodePaiementDto,
  ) {
    return this.methodePaiementService.update(id, updateMethodePaiementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une méthode de paiement' })
  @ApiParam({ name: 'id', description: 'ID de la méthode de paiement' })
  @ApiResponse({
    status: 204,
    description: 'La méthode de paiement a été supprimée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  @ApiResponse({
    status: 409,
    description: 'La méthode de paiement est utilisée par des abonnements',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.methodePaiementService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activer une méthode de paiement' })
  @ApiParam({ name: 'id', description: 'ID de la méthode de paiement' })
  @ApiResponse({
    status: 200,
    description: 'La méthode de paiement a été activée avec succès',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.methodePaiementService.toggleActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver une méthode de paiement' })
  @ApiParam({ name: 'id', description: 'ID de la méthode de paiement' })
  @ApiResponse({
    status: 200,
    description: 'La méthode de paiement a été désactivée avec succès',
    type: MethodePaiementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Méthode de paiement non trouvée' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.methodePaiementService.toggleActive(id, false);
  }
}
