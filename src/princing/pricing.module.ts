import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PricingController],
  providers: [PricingService, PrismaService, ConfigService],
})
export class PricingModule {}
