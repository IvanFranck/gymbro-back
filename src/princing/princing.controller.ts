import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePricingDto, FindPricingQueryDto } from './dto/pricing.dto';
import { PrincingService } from './princing.service';

@ApiTags('princing')
@ApiBearerAuth()
@Controller('princing')
export class PrincingController {
  constructor(private readonly pricingService: PrincingService) {}

  @Post()
  @ApiOperation({
    summary: "Créer un nouveau tarif d'abonnement",
  })
  @ApiResponse({
    status: 201,
    description: "Le tarif d'abonnement a été créé avec succès",
  })
  async create(@Body() createPricingDto: CreatePricingDto) {
    return await this.pricingService.create(createPricingDto);
  }

  @ApiResponse({
    status: 201,
    description: "Le tarif d'abonnement a été créé avec succès",
  })
  @Get()
  @ApiOperation({
    summary: "Récupérer les tarifs d'abonnement",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des tarifs d'abonnement récupérés avec succès",
  })
  async findAll(@Query() query: FindPricingQueryDto) {
    return await this.pricingService.findAll(query);
  }
}
