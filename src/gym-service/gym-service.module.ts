import { Module, OnModuleInit } from '@nestjs/common';
import { GymServiceService } from './gym-service.service';
import { GymServiceController } from './gym-service.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

@Module({
  providers: [GymServiceService, PrismaService, ConfigService],
  controllers: [GymServiceController],
})
export class GymServiceModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Cette méthode est appelée une fois que le module a été initialisé
   * Elle permet d'initialiser automatiquement les services par défaut au démarrage de l'application
   */
  async onModuleInit() {
    const serviceService = this.moduleRef.get(GymServiceService);
    await serviceService.initDefaultServices();
  }
}
