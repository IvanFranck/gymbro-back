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
import {
  CreateClientDto,
  UpdateClientDto,
  FindClientsQueryDto,
  ClientResponseDto,
} from './dto/customers.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class CustomerController {
  constructor(private readonly clientService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau client' })
  @ApiResponse({
    status: 201,
    description: 'Le client a été créé avec succès',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({
    status: 409,
    description: 'Un client avec cet email existe déjà',
  })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer la liste des clients' })
  @ApiResponse({
    status: 200,
    description: 'Liste des clients récupérée avec succès',
  })
  async findAll(@Query() query: FindClientsQueryDto) {
    return this.clientService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un client par son ID' })
  @ApiParam({ name: 'id', description: 'ID du client' })
  @ApiResponse({
    status: 200,
    description: 'Le client a été trouvé',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un client' })
  @ApiParam({ name: 'id', description: 'ID du client' })
  @ApiResponse({
    status: 200,
    description: 'Le client a été mis à jour avec succès',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 404, description: 'Client non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Un client avec cet email existe déjà',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un client' })
  @ApiParam({ name: 'id', description: 'ID du client' })
  @ApiResponse({
    status: 204,
    description: 'Le client a été supprimé avec succès',
  })
  @ApiResponse({ status: 404, description: 'Client non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Le client possède des abonnements actifs',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.remove(id);
  }
}
