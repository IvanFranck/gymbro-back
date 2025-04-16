import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  AddServiceToAbonnementTypeBulkDto,
  AddServiceToAbonnementTypeDto,
} from './dto/membership-type-service.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MembershipTypeServiceService {
  constructor(private prisma: PrismaService) {}

  // Associer un service à un type d'abonnement
  private async addServiceToAbonnementType(dto: AddServiceToAbonnementTypeDto) {
    try {
      const abonnementType = await this.prisma.typeAbonnement.findUnique({
        where: {
          id: dto.typeAbonnementId,
        },
      });

      if (!abonnementType) {
        throw new Error("Type d'abonnement introuvable");
      }

      const service = await this.prisma.service.findUnique({
        where: {
          id: dto.serviceId,
        },
      });

      if (!service) {
        throw new Error('Service introuvable');
      }
      return await this.prisma.typeAbonnementService.create({
        data: dto,
      });
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  // Récupérer tous les services inclus dans un type d'abonnement
  async getServicesByAbonnementType(typeAbonnementId: number) {
    try {
      return await this.prisma.typeAbonnementService.findMany({
        where: { typeAbonnementId },
        include: { service: true },
      });
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async addServiceToAbonnementTypeBulk(dto: AddServiceToAbonnementTypeBulkDto) {
    try {
      // Delete all service associations not in the provided list of service IDs
      await this.prisma.typeAbonnementService.deleteMany({
        where: {
          serviceId: {
            notIn: dto.servicesId,
          },
          typeAbonnementId: dto.typeAbonnementId,
        },
      });
      // Create an array of service IDs that are not already associated with the given typeAbonnementId
      const serviceIdArray = await Promise.all(
        dto.servicesId.map(async (serviceId) => {
          const isServiceAssociated =
            await this.prisma.typeAbonnementService.findUnique({
              where: {
                typeAbonnementId_serviceId: {
                  typeAbonnementId: dto.typeAbonnementId,
                  serviceId: Number(serviceId),
                },
              },
            });
          return isServiceAssociated ? null : Number(serviceId);
        }),
      ).then((results) => results.filter((serviceId) => serviceId !== null));

      return await Promise.all(
        serviceIdArray.map((serviceId) =>
          this.addServiceToAbonnementType({
            typeAbonnementId: dto.typeAbonnementId,
            serviceId: serviceId,
          }),
        ),
      );
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  // Générer automatiquement les accès aux services pour un nouvel abonnement
  async createServicesForNewAbonnement(
    abonnementId: number,
    clientId: number,
    typeAbonnementId: number,
    dateDebut: Date,
    dateFin: Date,
  ) {
    try {
      // Récupérer tous les services associés au type d'abonnement
      const services = await this.getServicesByAbonnementType(typeAbonnementId);

      // Créer un accès pour chaque service
      const clientServicesData = services.map((service) => ({
        clientId,
        serviceId: service.id,
        abonnementId,
        dateDebutAcces: dateDebut,
        dateFinAcces: dateFin,
      }));

      // Créer tous les accès en une seule opération
      return this.prisma.$transaction(
        clientServicesData.map((data) => {
          const clientService = this.prisma.clientService.findUnique({
            where: {
              client_services_unique: {
                clientId: data.clientId,
                serviceId: data.serviceId,
              },
            },
          });
          if (clientService) {
            return clientService;
          }
          return this.prisma.clientService.create({
            data,
          });
        }),
      );
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }
}
