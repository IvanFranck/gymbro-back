import { Module, OnModuleInit } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [StatusService, PrismaService, ConfigService],
  controllers: [StatusController],
})
export class StatusModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Cette méthode est appelée une fois que le module a été initialisé
   * Elle permet d'initialiser automatiquement les statuts par défaut au démarrage de l'application
   */
  async onModuleInit() {
    const statutService = this.moduleRef.get(StatusService);
    await statutService.initDefaultStatuts();
  }
}
