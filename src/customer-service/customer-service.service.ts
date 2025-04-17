import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClientService, Prisma } from '@prisma/client';
import {
  CreateClientServiceDto,
  UpdateClientServiceDto,
  FindClientServicesQueryDto,
  BulkCreateAccessDto,
} from './dto/customer-service.dto';
import { isAfter, isBefore, isEqual } from 'date-fns';

@Injectable()
export class CustomerServiceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle association client-service (accès à un service)
   */
  async create(
    createClientServiceDto: CreateClientServiceDto,
  ): Promise<ClientService> {
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: createClientServiceDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client avec l'id ${createClientServiceDto.clientId} non trouvé`,
      );
    }

    // Vérifier que le service existe et est actif
    const service = await this.prisma.service.findUnique({
      where: { id: createClientServiceDto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(
        `Service avec l'id ${createClientServiceDto.serviceId} non trouvé`,
      );
    }

    if (!service.actif) {
      throw new BadRequestException(
        `Le service "${service.nom}" n'est pas disponible actuellement`,
      );
    }

    // Vérifier l'abonnement si un ID est fourni
    if (createClientServiceDto.abonnementId) {
      const abonnement = await this.prisma.abonnement.findUnique({
        where: {
          id: createClientServiceDto.abonnementId,
        },
        include: {
          statut: true,
          client: true,
        },
      });

      if (!abonnement) {
        throw new NotFoundException(
          `Abonnement avec l'id ${createClientServiceDto.abonnementId} non trouvé`,
        );
      }

      // Vérifier que l'abonnement appartient au client spécifié
      if (abonnement.clientId !== createClientServiceDto.clientId) {
        throw new BadRequestException(
          `L'abonnement spécifié n'appartient pas au client ${client.prenom} ${client.nom}`,
        );
      }

      // Vérifier que l'abonnement est actif
      if (abonnement.statut.nom !== 'Actif') {
        throw new BadRequestException(
          `L'abonnement n'est pas actif (statut: ${abonnement.statut.nom})`,
        );
      }

      // Vérifier que l'abonnement n'est pas expiré
      const now = new Date();
      if (isAfter(now, abonnement.dateExpiration)) {
        throw new BadRequestException(
          `L'abonnement est expiré depuis le ${abonnement.dateExpiration.toISOString().split('T')[0]}`,
        );
      }
    }

    // Convertir les dates
    const dateDebutAcces = new Date(createClientServiceDto.dateDebutAcces);
    const dateFinAcces = createClientServiceDto.dateFinAcces
      ? new Date(createClientServiceDto.dateFinAcces)
      : null;

    // Vérifier la cohérence des dates
    if (
      dateFinAcces &&
      (isEqual(dateDebutAcces, dateFinAcces) ||
        isBefore(dateFinAcces, dateDebutAcces))
    ) {
      throw new BadRequestException(
        "La date de fin d'accès doit être postérieure à la date de début",
      );
    }

    // Créer l'association client-service
    return this.prisma.clientService.create({
      data: {
        clientId: createClientServiceDto.clientId,
        serviceId: createClientServiceDto.serviceId,
        dateDebutAcces,
        dateFinAcces,
        abonnementId: createClientServiceDto.abonnementId,
      },
    });
  }

  /**
   * Crée des accès en masse pour plusieurs services associés à un abonnement
   */
  async bulkCreateAccess(
    bulkCreateDto: BulkCreateAccessDto,
  ): Promise<{ count: number }> {
    // Vérifier que l'abonnement existe
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id: bulkCreateDto.abonnementId },
      include: {
        client: true,
        statut: true,
      },
    });

    if (!abonnement) {
      throw new NotFoundException(
        `Abonnement avec l'id ${bulkCreateDto.abonnementId} non trouvé`,
      );
    }

    // Vérifier que l'abonnement est actif
    if (abonnement.statut.nom !== 'Actif') {
      throw new BadRequestException(
        `L'abonnement n'est pas actif (statut: ${abonnement.statut.nom})`,
      );
    }

    // Vérifier que l'abonnement n'est pas expiré
    const now = new Date();
    if (isAfter(now, abonnement.dateExpiration)) {
      throw new BadRequestException(
        `L'abonnement est expiré depuis le ${abonnement.dateExpiration.toISOString().split('T')[0]}`,
      );
    }

    // Vérifier que les services existent et sont actifs
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: bulkCreateDto.serviceIds },
      },
    });

    if (services.length !== bulkCreateDto.serviceIds.length) {
      throw new NotFoundException(
        "Un ou plusieurs services spécifiés n'existent pas",
      );
    }

    const inactiveServices = services.filter((service) => !service.actif);
    if (inactiveServices.length > 0) {
      throw new BadRequestException(
        `Les services suivants ne sont pas disponibles actuellement: ${inactiveServices.map((s) => s.nom).join(', ')}`,
      );
    }

    // Déterminer les dates d'accès
    const dateDebutAcces = bulkCreateDto.dateDebutAcces
      ? new Date(bulkCreateDto.dateDebutAcces)
      : new Date(); // Par défaut: maintenant

    const dateFinAcces = bulkCreateDto.dateFinAcces
      ? new Date(bulkCreateDto.dateFinAcces)
      : abonnement.dateExpiration; // Par défaut: date d'expiration de l'abonnement

    // Vérifier la cohérence des dates
    if (
      isEqual(dateDebutAcces, dateFinAcces) ||
      isBefore(dateFinAcces, dateDebutAcces)
    ) {
      throw new BadRequestException(
        "La date de fin d'accès doit être postérieure à la date de début",
      );
    }

    // Préparer les données pour la création en masse
    const data = bulkCreateDto.serviceIds.map((serviceId) => ({
      clientId: abonnement.clientId,
      serviceId,
      dateDebutAcces,
      dateFinAcces,
      abonnementId: abonnement.id,
    }));

    // Créer tous les accès en une seule opération
    const result = await this.prisma.clientService.createMany({
      data,
      skipDuplicates: true, // Ignorer les doublons (même client, service et abonnement)
    });

    return { count: result.count };
  }

  /**
   * Récupère toutes les associations client-service avec filtres et pagination
   */
  async findAll(query: FindClientServicesQueryDto) {
    const {
      clientId,
      serviceId,
      abonnementId,
      dateActive,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.ClientServiceWhereInput = {};

    // Filtres par ID
    if (clientId) {
      where.clientId = clientId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (abonnementId) {
      where.abonnementId = abonnementId;
    }

    // Filtre par date active (accès valide à une date donnée)
    if (dateActive) {
      const activeDate = new Date(dateActive);
      where.OR = [
        // Soit pas de date de fin (accès illimité dans le temps)
        {
          dateDebutAcces: { lte: activeDate },
          dateFinAcces: null,
        },
        // Soit une date de fin postérieure à la date spécifiée
        {
          dateDebutAcces: { lte: activeDate },
          dateFinAcces: { gte: activeDate },
        },
      ];
    }

    // Obtenir le nombre total pour la pagination
    const total = await this.prisma.clientService.count({ where });

    // Obtenir les associations client-service avec pagination
    const clientServices = await this.prisma.clientService.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        service: {
          select: {
            id: true,
            nom: true,
            description: true,
            dureeStandard: true,
          },
        },
        abonnement: {
          select: {
            id: true,
            dateDebut: true,
            dateExpiration: true,
            typeAbonnement: {
              select: {
                nom: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { dateDebutAcces: 'desc' },
    });

    return {
      data: clientServices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une association client-service par son ID
   */
  async findOne(id: number) {
    const clientService = await this.prisma.clientService.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        service: {
          select: {
            id: true,
            nom: true,
            description: true,
            dureeStandard: true,
            capaciteMax: true,
          },
        },
        abonnement: {
          select: {
            id: true,
            dateDebut: true,
            dateExpiration: true,
            typeAbonnement: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },
    });

    if (!clientService) {
      throw new NotFoundException(`Accès service avec l'id ${id} non trouvé`);
    }

    return clientService;
  }

  /**
   * Met à jour une association client-service existante
   */
  async update(id: number, updateClientServiceDto: UpdateClientServiceDto) {
    // Vérifier que l'accès existe
    const clientService = await this.prisma.clientService.findUnique({
      where: { id },
    });

    if (!clientService) {
      throw new NotFoundException(`Accès service avec l'id ${id} non trouvé`);
    }

    // Vérifier l'abonnement si un ID est fourni
    if (updateClientServiceDto.abonnementId) {
      const abonnement = await this.prisma.abonnement.findUnique({
        where: {
          id: updateClientServiceDto.abonnementId,
        },
        include: {
          client: true,
        },
      });

      if (!abonnement) {
        throw new NotFoundException(
          `Abonnement avec l'id ${updateClientServiceDto.abonnementId} non trouvé`,
        );
      }

      // Vérifier que l'abonnement appartient au même client
      if (abonnement.clientId !== clientService.clientId) {
        throw new BadRequestException(
          `L'abonnement spécifié n'appartient pas au client associé à cet accès`,
        );
      }
    }

    // Préparer les données pour la mise à jour
    const updateData: Prisma.ClientServiceUpdateInput = {};

    if (updateClientServiceDto.dateDebutAcces) {
      updateData.dateDebutAcces = new Date(
        updateClientServiceDto.dateDebutAcces,
      );
    }

    if (updateClientServiceDto.dateFinAcces) {
      updateData.dateFinAcces = new Date(updateClientServiceDto.dateFinAcces);
    }

    if (updateClientServiceDto.abonnementId) {
      updateData.abonnement = {
        connect: { id: updateClientServiceDto.abonnementId },
      };
    }

    // Vérifier la cohérence des dates si les deux sont fournies
    if (
      updateClientServiceDto.dateDebutAcces &&
      updateClientServiceDto.dateFinAcces
    ) {
      const dateDebut = new Date(updateClientServiceDto.dateDebutAcces);
      const dateFin = new Date(updateClientServiceDto.dateFinAcces);

      if (isEqual(dateDebut, dateFin) || isBefore(dateFin, dateDebut)) {
        throw new BadRequestException(
          "La date de fin d'accès doit être postérieure à la date de début",
        );
      }
    } else if (
      updateClientServiceDto.dateDebutAcces &&
      clientService.dateFinAcces
    ) {
      // Vérifier la cohérence avec la date de fin existante
      const dateDebut = new Date(updateClientServiceDto.dateDebutAcces);

      if (
        isEqual(dateDebut, clientService.dateFinAcces) ||
        isAfter(dateDebut, clientService.dateFinAcces)
      ) {
        throw new BadRequestException(
          "La date de début d'accès doit être antérieure à la date de fin",
        );
      }
    } else if (
      updateClientServiceDto.dateFinAcces &&
      clientService.dateDebutAcces
    ) {
      // Vérifier la cohérence avec la date de début existante
      const dateFin = new Date(updateClientServiceDto.dateFinAcces);

      if (
        isEqual(dateFin, clientService.dateDebutAcces) ||
        isBefore(dateFin, clientService.dateDebutAcces)
      ) {
        throw new BadRequestException(
          "La date de fin d'accès doit être postérieure à la date de début",
        );
      }
    }

    // Mettre à jour l'association client-service
    return this.prisma.clientService.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        service: {
          select: {
            id: true,
            nom: true,
            description: true,
            dureeStandard: true,
          },
        },
        abonnement: {
          select: {
            id: true,
            dateDebut: true,
            dateExpiration: true,
            typeAbonnement: {
              select: {
                nom: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Supprime une association client-service
   */
  async remove(id: number): Promise<void> {
    // Vérifier que l'accès existe
    const clientService = await this.prisma.clientService.findUnique({
      where: { id },
    });

    if (!clientService) {
      throw new NotFoundException(`Accès service avec l'id ${id} non trouvé`);
    }

    // Supprimer l'association client-service
    await this.prisma.clientService.delete({
      where: { id },
    });
  }

  /**
   * Vérifie si un client a accès à un service à une date donnée
   */
  async checkAccess(
    clientId: number,
    serviceId: number,
    date: Date = new Date(),
  ): Promise<boolean> {
    // Vérifier que le client et le service existent
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${clientId} non trouvé`);
    }

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${serviceId} non trouvé`);
    }

    // Vérifier si le client a un accès actif au service à la date spécifiée
    const clientService = await this.prisma.clientService.findFirst({
      where: {
        clientId,
        serviceId,
        OR: [
          // Soit pas de date de fin (accès illimité dans le temps)
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: null,
          },
          // Soit une date de fin postérieure à la date spécifiée
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: { gte: date },
          },
        ],
      },
    });

    return !!clientService;
  }

  /**
   * Récupère les services auxquels un client a accès à une date donnée
   */
  async getClientActiveServices(clientId: number, date: Date = new Date()) {
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${clientId} non trouvé`);
    }

    // Trouver tous les accès actifs à la date spécifiée
    const activeServices = await this.prisma.clientService.findMany({
      where: {
        clientId,
        OR: [
          // Soit pas de date de fin (accès illimité dans le temps)
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: null,
          },
          // Soit une date de fin postérieure à la date spécifiée
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: { gte: date },
          },
        ],
      },
      include: {
        service: true,
        abonnement: {
          select: {
            id: true,
            typeAbonnement: {
              select: {
                nom: true,
              },
            },
          },
        },
      },
      orderBy: {
        service: {
          nom: 'asc',
        },
      },
    });

    return activeServices.map((access) => ({
      access: {
        id: access.id,
        dateDebutAcces: access.dateDebutAcces,
        dateFinAcces: access.dateFinAcces,
      },
      service: {
        id: access.service.id,
        nom: access.service.nom,
        description: access.service.description,
        dureeStandard: access.service.dureeStandard,
        capaciteMax: access.service.capaciteMax,
      },
      abonnement: access.abonnement
        ? {
            id: access.abonnement.id,
            typeAbonnement: access.abonnement.typeAbonnement.nom,
          }
        : null,
    }));
  }

  /**
   * Récupère les clients qui ont accès à un service à une date donnée
   */
  async getServiceActiveClients(serviceId: number, date: Date = new Date()) {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${serviceId} non trouvé`);
    }

    // Trouver tous les clients avec un accès actif à la date spécifiée
    const activeClients = await this.prisma.clientService.findMany({
      where: {
        serviceId,
        OR: [
          // Soit pas de date de fin (accès illimité dans le temps)
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: null,
          },
          // Soit une date de fin postérieure à la date spécifiée
          {
            dateDebutAcces: { lte: date },
            dateFinAcces: { gte: date },
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
          },
        },
        abonnement: {
          select: {
            id: true,
            typeAbonnement: {
              select: {
                nom: true,
              },
            },
          },
        },
      },
      orderBy: {
        client: {
          nom: 'asc',
        },
      },
    });

    return activeClients.map((access) => ({
      access: {
        id: access.id,
        dateDebutAcces: access.dateDebutAcces,
        dateFinAcces: access.dateFinAcces,
      },
      client: {
        id: access.client.id,
        nom: access.client.nom,
        prenom: access.client.prenom,
        telephone: access.client.telephone,
      },
      abonnement: access.abonnement
        ? {
            id: access.abonnement.id,
            typeAbonnement: access.abonnement.typeAbonnement.nom,
          }
        : null,
    }));
  }

  /**
   * Met à jour la date de fin d'accès pour tous les accès liés à un abonnement
   */
  async updateAllAccessEndDatesForSubscription(
    abonnementId: number,
    newEndDate: Date,
  ): Promise<{ count: number }> {
    // Vérifier que l'abonnement existe
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id: abonnementId },
    });

    if (!abonnement) {
      throw new NotFoundException(
        `Abonnement avec l'id ${abonnementId} non trouvé`,
      );
    }

    // Mettre à jour tous les accès liés à cet abonnement
    const result = await this.prisma.clientService.updateMany({
      where: {
        abonnementId,
      },
      data: {
        dateFinAcces: newEndDate,
      },
    });

    return { count: result.count };
  }

  /**
   * Résilie tous les accès liés à un abonnement (met la date de fin à aujourd'hui)
   */
  async terminateAllAccessForSubscription(
    abonnementId: number,
  ): Promise<{ count: number }> {
    // Vérifier que l'abonnement existe
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id: abonnementId },
    });

    if (!abonnement) {
      throw new NotFoundException(
        `Abonnement avec l'id ${abonnementId} non trouvé`,
      );
    }

    // Date de fin = aujourd'hui
    const today = new Date();

    // Mettre à jour tous les accès liés à cet abonnement
    const result = await this.prisma.clientService.updateMany({
      where: {
        abonnementId,
        OR: [
          // Accès sans date de fin
          { dateFinAcces: null },
          // Accès avec date de fin postérieure à aujourd'hui
          { dateFinAcces: { gt: today } },
        ],
      },
      data: {
        dateFinAcces: today,
      },
    });

    return { count: result.count };
  }
}
