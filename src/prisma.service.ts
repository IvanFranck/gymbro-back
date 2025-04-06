import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    // Pass PrismaClient options here if needed
    super({
      log:
        config.get('NODE_ENV') === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    // Connect to the database when the application starts
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect from the database when the application shuts down
    await this.$disconnect();
  }

  // Helper method for cleaning database during testing
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      // Transaction to ensure all deletes succeed or none do
      return this.$transaction([
        this.clientService.deleteMany(),
        this.abonnement.deleteMany(),
        this.client.deleteMany(),
        this.service.deleteMany(),
        this.typeAbonnement.deleteMany(),
        this.methodePaiement.deleteMany(),
        this.statut.deleteMany(),
      ]);
    }
  }
}
