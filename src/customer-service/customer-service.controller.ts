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
import { CustomerServiceService } from './customer-service.service';
import {
  CreateClientServiceDto,
  UpdateClientServiceDto,
  FindClientServicesQueryDto,
  ClientServiceResponseDto,
  BulkCreateAccessDto,
} from './dto/customer-service.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('client-services')
@ApiBearerAuth()
@Controller('client-services')
export class CustomerServiceController {
  constructor(private readonly clientServiceService: CustomerServiceService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un nouvel accès à un service pour un client',
  })
  @ApiResponse({
    status: 201,
    description: "L'accès au service a été créé avec succès",
    type: ClientServiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide ou service inactif',
  })
  @ApiResponse({
    status: 404,
    description: 'Client, service ou abonnement non trouvé',
  })
  create(@Body() createClientServiceDto: CreateClientServiceDto) {
    return this.clientServiceService.create(createClientServiceDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary:
      'Créer des accès en masse pour plusieurs services associés à un abonnement',
  })
  @ApiResponse({
    status: 201,
    description: 'Les accès aux services ont été créés avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide ou services inactifs',
  })
  @ApiResponse({
    status: 404,
    description: 'Abonnement ou services non trouvés',
  })
  bulkCreateAccess(@Body() bulkCreateDto: BulkCreateAccessDto) {
    return this.clientServiceService.bulkCreateAccess(bulkCreateDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Récupérer la liste des accès aux services avec filtres et pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des accès aux services récupérée avec succès',
  })
  findAll(@Query() query: FindClientServicesQueryDto) {
    return this.clientServiceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un accès à un service par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'accès au service" })
  @ApiResponse({
    status: 200,
    description: "L'accès au service a été trouvé",
    type: ClientServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Accès au service non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientServiceService.findOne(id);
  }

  @Get('client/:clientId/services')
  @ApiOperation({
    summary:
      'Récupérer les services auxquels un client a accès à une date donnée',
  })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: "Date à laquelle vérifier les accès (défaut: aujourd'hui)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des services accessibles récupérée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Client non trouvé' })
  getClientActiveServices(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('date') date?: string,
  ) {
    return this.clientServiceService.getClientActiveServices(
      clientId,
      date ? new Date(date) : undefined,
    );
  }

  @Get('service/:serviceId/clients')
  @ApiOperation({
    summary:
      'Récupérer les clients qui ont accès à un service à une date donnée',
  })
  @ApiParam({ name: 'serviceId', description: 'ID du service' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: "Date à laquelle vérifier les accès (défaut: aujourd'hui)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des clients avec accès récupérée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Service non trouvé' })
  getServiceActiveClients(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date?: string,
  ) {
    return this.clientServiceService.getServiceActiveClients(
      serviceId,
      date ? new Date(date) : undefined,
    );
  }

  @Get('check-access/:clientId/:serviceId')
  @ApiOperation({
    summary: 'Vérifier si un client a accès à un service à une date donnée',
  })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiParam({ name: 'serviceId', description: 'ID du service' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: "Date à laquelle vérifier l'accès (défaut: aujourd'hui)",
  })
  @ApiResponse({
    status: 200,
    description: "Vérification d'accès effectuée avec succès",
  })
  @ApiResponse({ status: 404, description: 'Client ou service non trouvé' })
  checkAccess(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Query('date') date?: string,
  ) {
    return this.clientServiceService.checkAccess(
      clientId,
      serviceId,
      date ? new Date(date) : undefined,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un accès à un service' })
  @ApiParam({ name: 'id', description: "ID de l'accès au service" })
  @ApiResponse({
    status: 200,
    description: "L'accès au service a été mis à jour avec succès",
    type: ClientServiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 404,
    description: 'Accès au service ou abonnement non trouvé',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientServiceDto: UpdateClientServiceDto,
  ) {
    return this.clientServiceService.update(id, updateClientServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un accès à un service' })
  @ApiParam({ name: 'id', description: "ID de l'accès au service" })
  @ApiResponse({
    status: 204,
    description: "L'accès au service a été supprimé avec succès",
  })
  @ApiResponse({ status: 404, description: 'Accès au service non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientServiceService.remove(id);
  }

  @Patch('subscription/:abonnementId/update-end-dates')
  @ApiOperation({
    summary:
      'Mettre à jour la date de fin pour tous les accès liés à un abonnement',
  })
  @ApiParam({ name: 'abonnementId', description: "ID de l'abonnement" })
  @ApiQuery({
    name: 'newEndDate',
    required: true,
    type: String,
    description: 'Nouvelle date de fin pour tous les accès',
  })
  @ApiResponse({
    status: 200,
    description: 'Les dates de fin ont été mises à jour avec succès',
  })
  @ApiResponse({ status: 400, description: 'Format de date invalide' })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  updateAllAccessEndDates(
    @Param('abonnementId', ParseIntPipe) abonnementId: number,
    @Query('newEndDate') newEndDate: string,
  ) {
    if (!newEndDate) {
      throw new Error('La nouvelle date de fin est requise');
    }
    return this.clientServiceService.updateAllAccessEndDatesForSubscription(
      abonnementId,
      new Date(newEndDate),
    );
  }

  @Patch('subscription/:abonnementId/terminate')
  @ApiOperation({
    summary:
      "Résilier tous les accès liés à un abonnement (date de fin = aujourd'hui)",
  })
  @ApiParam({ name: 'abonnementId', description: "ID de l'abonnement" })
  @ApiResponse({
    status: 200,
    description: 'Les accès ont été résiliés avec succès',
  })
  @ApiResponse({ status: 404, description: 'Abonnement non trouvé' })
  terminateAllAccess(
    @Param('abonnementId', ParseIntPipe) abonnementId: number,
  ) {
    return this.clientServiceService.terminateAllAccessForSubscription(
      abonnementId,
    );
  }
}
