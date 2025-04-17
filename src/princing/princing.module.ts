import { Module } from '@nestjs/common';
import { PrincingController } from './princing.controller';
import { PrincingService } from './princing.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PrincingController],
  providers: [PrincingService, PrismaService, ConfigService],
})
export class PrincingModule {}
