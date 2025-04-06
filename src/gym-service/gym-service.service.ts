import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Service, Prisma } from '@prisma/client';
import {
  CreateServiceDto,
  UpdateServiceDto,
  FindServicesQueryDto,
} from './dto/service.dto';

@Injectable()
export class GymServiceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouveau service
   */
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    // Vérifier si un service avec le même nom existe déjà
    const existingService = await this.prisma.service.findFirst({
      where: {
        nom: {
          equals: createServiceDto.nom,
          mode: 'insensitive', // Recherche insensible à la casse
        },
      },
    });

    if (existingService) {
      throw new ConflictException(
        `Un service avec le nom "${createServiceDto.nom}" existe déjà`,
      );
    }

    // Créer le service
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  /**
   * Récupère tous les services avec possibilité de filtrage et pagination
   */
  async findAll(query: FindServicesQueryDto) {
    const {
      search,
      actif,
      dureeMin,
      dureeMax,
      capaciteMin,
      capaciteMax,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.ServiceWhereInput = {};

    // Recherche par nom ou description
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par statut actif/inactif
    if (actif !== undefined) {
      where.actif = actif;
    }

    // Filtres de durée
    if (dureeMin !== undefined || dureeMax !== undefined) {
      where.dureeStandard = {};

      if (dureeMin !== undefined) {
        where.dureeStandard.gte = dureeMin;
      }

      if (dureeMax !== undefined) {
        where.dureeStandard.lte = dureeMax;
      }
    }

    // Filtres de capacité
    if (capaciteMin !== undefined || capaciteMax !== undefined) {
      where.capaciteMax = {};

      if (capaciteMin !== undefined) {
        where.capaciteMax.gte = capaciteMin;
      }

      if (capaciteMax !== undefined) {
        where.capaciteMax.lte = capaciteMax;
      }
    }

    // Obtenir le nombre total pour la pagination
    const total = await this.prisma.service.count({ where });

    // Obtenir les services avec pagination
    const services = await this.prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
    });

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un service par son ID
   */
  async findOne(id: number): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clientsAcces: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} non trouvé`);
    }

    return service;
  }

  /**
   * Récupère un service par son nom
   */
  async findByName(nom: string): Promise<Service | null> {
    return this.prisma.service.findFirst({
      where: {
        nom: {
          equals: nom,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Met à jour un service existant
   */
  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} non trouvé`);
    }

    // Vérifier si le nom est modifié et s'il existe déjà
    if (updateServiceDto.nom && updateServiceDto.nom !== service.nom) {
      const existingService = await this.prisma.service.findFirst({
        where: {
          nom: {
            equals: updateServiceDto.nom,
            mode: 'insensitive',
          },
          id: { not: id }, // Exclure le service actuel de la recherche
        },
      });

      if (existingService) {
        throw new ConflictException(
          `Un service avec le nom "${updateServiceDto.nom}" existe déjà`,
        );
      }
    }

    // Mettre à jour le service
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  /**
   * Supprime un service
   */
  async remove(id: number): Promise<void> {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clientsAcces: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} non trouvé`);
    }

    // Vérifier si le service est utilisé
    if (service._count.clientsAcces > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce service car il est associé à ${service._count.clientsAcces} client(s)`,
      );
    }

    // Supprimer le service
    await this.prisma.service.delete({
      where: { id },
    });
  }

  /**
   * Active ou désactive un service
   */
  async toggleActive(id: number, active: boolean): Promise<Service> {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} non trouvé`);
    }

    // Si le statut est déjà celui demandé, ne rien faire
    if (service.actif === active) {
      return service;
    }

    // Mettre à jour le service
    return this.prisma.service.update({
      where: { id },
      data: { actif: active },
    });
  }

  /**
   * Récupère les statistiques d'utilisation des services
   */
  async getStatistics() {
    // Obtenir le nombre total de services
    const totalCount = await this.prisma.service.count();

    // Obtenir le nombre de services actifs
    const activeCount = await this.prisma.service.count({
      where: { actif: true },
    });

    // Obtenir les services les plus utilisés
    const mostUsedServices = await this.prisma.service.findMany({
      select: {
        id: true,
        nom: true,
        dureeStandard: true,
        capaciteMax: true,
        actif: true,
        _count: {
          select: { clientsAcces: true },
        },
      },
      orderBy: {
        clientsAcces: { _count: 'desc' },
      },
      take: 5,
    });

    // Obtenir la distribution des clients par service
    const clientsPerService = await this.prisma.clientService.groupBy({
      by: ['serviceId'],
      _count: {
        clientId: true,
      },
      orderBy: {
        _count: {
          clientId: 'desc',
        },
      },
    });

    // Enrichir les données de distribution avec les noms des services
    const servicesWithClientCounts = await Promise.all(
      clientsPerService.map(async (item) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.serviceId },
          select: { nom: true },
        });

        return {
          serviceId: item.serviceId,
          nom: service?.nom || `Service ID ${item.serviceId}`,
          clientCount: item._count.clientId,
        };
      }),
    );

    return {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      mostUsedServices: mostUsedServices.map((service) => ({
        id: service.id,
        nom: service.nom,
        dureeStandard: service.dureeStandard,
        capaciteMax: service.capaciteMax,
        actif: service.actif,
        clientCount: service._count.clientsAcces,
      })),
      clientsPerService: servicesWithClientCounts,
    };
  }

  /**
   * Initialise des services par défaut si aucun n'existe
   */
  async initDefaultServices(): Promise<void> {
    const count = await this.prisma.service.count();

    // Ne rien faire si des services existent déjà
    if (count > 0) {
      return;
    }

    // Services par défaut pour une salle de sport/fitness
    const defaultServices = [
      {
        nom: 'Accès salle de musculation',
        description:
          'Accès illimité à la salle de musculation avec équipements professionnels',
        dureeStandard: null, // Durée libre
        capaciteMax: 50,
        actif: true,
      },
      {
        nom: 'Cardio',
        description: 'Cours de vélo, travail cardio et renforcement des jambes',
        dureeStandard: 45, // 45 minutes
        capaciteMax: 25,
        actif: true,
      },
    ];

    // Créer tous les services par défaut
    await this.prisma.service.createMany({
      data: defaultServices,
    });
  }
}
