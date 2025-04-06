import { Module } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { CustomerServiceController } from './customer-service.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CustomerServiceService, PrismaService, ConfigService],
  controllers: [CustomerServiceController],
})
export class CustomerServiceModule {}
