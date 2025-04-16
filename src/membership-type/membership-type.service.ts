import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TypeAbonnement, Prisma } from '@prisma/client';
import {
  CreateTypeAbonnementDto,
  UpdateTypeAbonnementDto,
  FindTypeAbonnementsQueryDto,
} from './dto/membershpi-type.dto';
import { PrismaService } from 'src/prisma.service';
import { MembershipTypeServiceService } from 'src/membership-type-service/membership-type-service.service';

@Injectable()
export class MembershipTypeService {
  constructor(
    private prisma: PrismaService,
    private membershipTypeService: MembershipTypeServiceService,
  ) {}

  /**
   * Crée un nouveau type d'abonnement
   */
  async create(
    createTypeAbonnementDto: CreateTypeAbonnementDto,
  ): Promise<TypeAbonnement> {
    // Vérifier si un type d'abonnement avec le même nom existe déjà
    const existingTypeAbonnement = await this.prisma.typeAbonnement.findFirst({
      where: {
        nom: {
          equals: createTypeAbonnementDto.nom,
          mode: 'insensitive', // Recherche insensible à la casse
        },
      },
    });

    if (existingTypeAbonnement) {
      throw new ConflictException(
        `Un type d'abonnement avec le nom "${createTypeAbonnementDto.nom}" existe déjà`,
      );
    }

    // Créer le type d'abonnement
    let typeAbonnement: TypeAbonnement | undefined;
    const { services, ...data } = createTypeAbonnementDto;
    try {
      typeAbonnement = await this.prisma.typeAbonnement.create({
        data,
      });

      // Associate services with the subscription type
      await this.membershipTypeService.addServiceToAbonnementTypeBulk({
        typeAbonnementId: typeAbonnement.id,
        serviceId: services,
      });

      // Retrieve the updated subscription type with associated services
      const updatedTypeAbonnement = await this.prisma.typeAbonnement.findUnique(
        {
          where: { id: typeAbonnement.id },
          include: {
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      );

      return updatedTypeAbonnement;
    } catch (error) {
      if (typeAbonnement) {
        await this.prisma.typeAbonnement.delete({
          where: { id: typeAbonnement.id },
        });
      }
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Récupère tous les types d'abonnements avec filtres et pagination
   */
  async findAll(query: FindTypeAbonnementsQueryDto) {
    const {
      search,
      actif,
      dureeMin,
      dureeMax,
      prixMin,
      prixMax,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.TypeAbonnementWhereInput = {};

    // Recherche par nom ou niveau
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { niveau: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par statut actif/inactif
    if (actif !== undefined) {
      where.actif = actif;
    }

    // Filtres de durée
    if (dureeMin !== undefined || dureeMax !== undefined) {
      where.dureeJours = {};

      if (dureeMin !== undefined) {
        where.dureeJours.gte = dureeMin;
      }

      if (dureeMax !== undefined) {
        where.dureeJours.lte = dureeMax;
      }
    }

    // Filtres de prix
    if (prixMin !== undefined || prixMax !== undefined) {
      where.prix = {};

      if (prixMin !== undefined) {
        where.prix.gte = prixMin;
      }

      if (prixMax !== undefined) {
        where.prix.lte = prixMax;
      }
    }

    // Obtenir le nombre total pour la pagination
    const total = await this.prisma.typeAbonnement.count({ where });

    // Obtenir les types d'abonnements avec pagination
    const typesAbonnements = await this.prisma.typeAbonnement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: { services: true, abonnements: true },
        },
      },
    });

    return {
      data: typesAbonnements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un type d'abonnement par son ID
   */
  async findOne(id: number): Promise<TypeAbonnement> {
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id },
      include: {
        services: {
          include: { service: true },
        },
        _count: {
          select: { abonnements: true },
        },
      },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Type d'abonnement avec l'id ${id} non trouvé`,
      );
    }

    return typeAbonnement;
  }

  /**
   * Met à jour un type d'abonnement existant
   */
  async update(
    id: number,
    updateTypeAbonnementDto: UpdateTypeAbonnementDto,
  ): Promise<TypeAbonnement> {
    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Type d'abonnement avec l'id ${id} non trouvé`,
      );
    }

    // Vérifier si le nom est modifié et s'il existe déjà
    if (
      updateTypeAbonnementDto.nom &&
      updateTypeAbonnementDto.nom !== typeAbonnement.nom
    ) {
      const existingTypeAbonnement = await this.prisma.typeAbonnement.findFirst(
        {
          where: {
            nom: {
              equals: updateTypeAbonnementDto.nom,
              mode: 'insensitive',
            },
            id: { not: id }, // Exclure le type d'abonnement actuel de la recherche
          },
        },
      );

      if (existingTypeAbonnement) {
        throw new ConflictException(
          `Un type d'abonnement avec le nom "${updateTypeAbonnementDto.nom}" existe déjà`,
        );
      }
    }
    const { services, ...data } = updateTypeAbonnementDto;
    await this.membershipTypeService.addServiceToAbonnementTypeBulk({
      typeAbonnementId: id,
      serviceId: services,
    });
    // Mettre à jour le type d'abonnement
    return await this.prisma.typeAbonnement.update({
      where: { id },
      data,
      include: {
        services: {
          include: { service: true },
        },
      },
    });
  }

  /**
   * Supprime un type d'abonnement
   */
  async remove(id: number): Promise<void> {
    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { abonnements: true },
        },
      },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Type d'abonnement avec l'id ${id} non trouvé`,
      );
    }

    // Vérifier si le type d'abonnement est utilisé par des abonnements
    if (typeAbonnement._count.abonnements > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce type d'abonnement car il est utilisé par ${typeAbonnement._count.abonnements} abonnement(s)`,
      );
    }

    // Supprimer le type d'abonnement
    await this.prisma.typeAbonnement.delete({
      where: { id },
    });
  }

  /**
   * Désactive un type d'abonnement (alternative à la suppression)
   */
  async deactivate(id: number): Promise<TypeAbonnement> {
    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Type d'abonnement avec l'id ${id} non trouvé`,
      );
    }

    // Si déjà inactif, ne rien faire
    if (!typeAbonnement.actif) {
      return typeAbonnement;
    }

    // Mettre à jour le type d'abonnement pour le désactiver
    return this.prisma.typeAbonnement.update({
      where: { id },
      data: { actif: false },
    });
  }

  /**
   * Réactive un type d'abonnement
   */
  async activate(id: number): Promise<TypeAbonnement> {
    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Type d'abonnement avec l'id ${id} non trouvé`,
      );
    }

    // Si déjà actif, ne rien faire
    if (typeAbonnement.actif) {
      return typeAbonnement;
    }

    // Mettre à jour le type d'abonnement pour l'activer
    return this.prisma.typeAbonnement.update({
      where: { id },
      data: { actif: true },
    });
  }

  /**
   * Récupère les statistiques des types d'abonnements
   */
  async getStatistics() {
    // Obtenir le nombre total de types d'abonnements
    const totalCount = await this.prisma.typeAbonnement.count();

    // Obtenir le nombre de types d'abonnements actifs
    const activeCount = await this.prisma.typeAbonnement.count({
      where: { actif: true },
    });

    // Obtenir le nombre de types d'abonnements inactifs
    const inactiveCount = await this.prisma.typeAbonnement.count({
      where: { actif: false },
    });

    // Obtenir le prix moyen des types d'abonnements actifs
    const averagePrice = await this.prisma.typeAbonnement.aggregate({
      _avg: { prix: true },
      where: { actif: true },
    });

    // Obtenir les 5 types d'abonnements les plus utilisés
    const mostUsedTypes = await this.prisma.typeAbonnement.findMany({
      select: {
        id: true,
        nom: true,
        niveau: true,
        dureeJours: true,
        prix: true,
        _count: {
          select: { abonnements: true },
        },
      },
      orderBy: {
        abonnements: { _count: 'desc' },
      },
      take: 5,
    });

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      averagePrice: averagePrice._avg.prix || 0,
      mostUsedTypes: mostUsedTypes.map((type) => ({
        id: type.id,
        nom: type.nom,
        niveau: type.niveau,
        dureeJours: type.dureeJours,
        prix: type.prix,
        abonnementsCount: type._count.abonnements,
      })),
    };
  }
}
