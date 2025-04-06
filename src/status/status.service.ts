import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Statut, Prisma } from '@prisma/client';
import {
  CreateStatutDto,
  UpdateStatutDto,
  FindStatutsQueryDto,
} from './dto/status.dto';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouveau statut
   */
  async create(createStatutDto: CreateStatutDto): Promise<Statut> {
    // Vérifier si un statut avec le même nom et type d'entité existe déjà
    const existingStatut = await this.prisma.statut.findFirst({
      where: {
        nom: {
          equals: createStatutDto.nom,
          mode: 'insensitive', // Recherche insensible à la casse
        },
        typeEntite: createStatutDto.typeEntite,
      },
    });

    if (existingStatut) {
      throw new ConflictException(
        `Un statut "${createStatutDto.nom}" pour l'entité "${createStatutDto.typeEntite}" existe déjà`,
      );
    }

    // Créer le statut
    return this.prisma.statut.create({
      data: createStatutDto,
    });
  }

  /**
   * Récupère tous les statuts avec possibilité de filtrage
   */
  async findAll(query: FindStatutsQueryDto): Promise<Statut[]> {
    const { search, typeEntite } = query;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.StatutWhereInput = {};

    // Recherche par nom ou description
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par type d'entité
    if (typeEntite) {
      where.typeEntite = typeEntite;
    }

    // Récupérer les statuts
    return this.prisma.statut.findMany({
      where,
      orderBy: [{ typeEntite: 'asc' }, { nom: 'asc' }],
    });
  }

  /**
   * Récupère un statut par son ID
   */
  async findOne(id: number): Promise<Statut> {
    const statut = await this.prisma.statut.findUnique({
      where: { id },
    });

    if (!statut) {
      throw new NotFoundException(`Statut avec l'id ${id} non trouvé`);
    }

    return statut;
  }

  /**
   * Récupère un statut par son nom et type d'entité
   */
  async findByNameAndType(
    nom: string,
    typeEntite: string,
  ): Promise<Statut | null> {
    return this.prisma.statut.findFirst({
      where: {
        nom: {
          equals: nom,
          mode: 'insensitive',
        },
        typeEntite,
      },
    });
  }

  /**
   * Met à jour un statut existant
   */
  async update(id: number, updateStatutDto: UpdateStatutDto): Promise<Statut> {
    // Vérifier que le statut existe
    const statut = await this.prisma.statut.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
            abonnements: true,
          },
        },
      },
    });

    if (!statut) {
      throw new NotFoundException(`Statut avec l'id ${id} non trouvé`);
    }

    // Si le type d'entité est modifié, vérifier que le statut n'est pas utilisé
    if (
      updateStatutDto.typeEntite &&
      updateStatutDto.typeEntite !== statut.typeEntite
    ) {
      const entitesAssociees =
        statut.typeEntite === 'Client'
          ? statut._count.clients
          : statut._count.abonnements;

      if (entitesAssociees > 0) {
        throw new ConflictException(
          `Impossible de modifier le type d'entité car ce statut est utilisé par ${entitesAssociees} ${statut.typeEntite.toLowerCase()}(s)`,
        );
      }
    }

    // Vérifier si le nom est modifié et s'il existe déjà pour ce type d'entité
    if (updateStatutDto.nom && updateStatutDto.nom !== statut.nom) {
      const typeEntite = updateStatutDto.typeEntite || statut.typeEntite;
      const existingStatut = await this.prisma.statut.findFirst({
        where: {
          nom: {
            equals: updateStatutDto.nom,
            mode: 'insensitive',
          },
          typeEntite,
          id: { not: id }, // Exclure le statut actuel de la recherche
        },
      });

      if (existingStatut) {
        throw new ConflictException(
          `Un statut "${updateStatutDto.nom}" pour l'entité "${typeEntite}" existe déjà`,
        );
      }
    }

    // Mettre à jour le statut
    return this.prisma.statut.update({
      where: { id },
      data: updateStatutDto,
    });
  }

  /**
   * Supprime un statut
   */
  async remove(id: number): Promise<void> {
    // Vérifier que le statut existe
    const statut = await this.prisma.statut.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
            abonnements: true,
          },
        },
      },
    });

    if (!statut) {
      throw new NotFoundException(`Statut avec l'id ${id} non trouvé`);
    }

    // Vérifier si le statut est utilisé
    const entitesAssociees =
      statut.typeEntite === 'Client'
        ? statut._count.clients
        : statut._count.abonnements;

    if (entitesAssociees > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce statut car il est utilisé par ${entitesAssociees} ${statut.typeEntite.toLowerCase()}(s)`,
      );
    }

    // Supprimer le statut
    await this.prisma.statut.delete({
      where: { id },
    });
  }

  /**
   * Récupère les statistiques d'utilisation des statuts
   */
  async getStatistics() {
    // Obtenir les statistiques pour les statuts de type Client
    const clientStatutStats = await this.prisma.statut.findMany({
      where: {
        typeEntite: 'Client',
      },
      select: {
        id: true,
        nom: true,
        couleur: true,
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: {
        clients: { _count: 'desc' },
      },
    });

    // Obtenir les statistiques pour les statuts de type Abonnement
    const abonnementStatutStats = await this.prisma.statut.findMany({
      where: {
        typeEntite: 'Abonnement',
      },
      select: {
        id: true,
        nom: true,
        couleur: true,
        _count: {
          select: {
            abonnements: true,
          },
        },
      },
      orderBy: {
        abonnements: { _count: 'desc' },
      },
    });

    return {
      clientStats: clientStatutStats.map((stat) => ({
        id: stat.id,
        nom: stat.nom,
        couleur: stat.couleur,
        count: stat._count.clients,
      })),
      abonnementStats: abonnementStatutStats.map((stat) => ({
        id: stat.id,
        nom: stat.nom,
        couleur: stat.couleur,
        count: stat._count.abonnements,
      })),
    };
  }

  /**
   * Initialise les statuts par défaut si aucun n'existe
   */
  async initDefaultStatuts(): Promise<void> {
    const count = await this.prisma.statut.count();

    // Ne rien faire si des statuts existent déjà
    if (count > 0) {
      return;
    }

    // Statuts par défaut pour les clients
    const defaultClientStatuts = [
      {
        nom: 'Actif',
        typeEntite: 'Client',
        description: 'Client actif avec un abonnement en cours de validité',
        couleur: '#4CAF50', // Vert
      },
      {
        nom: 'En attente',
        typeEntite: 'Client',
        description: "Client en attente d'activation ou de validation",
        couleur: '#FFC107', // Jaune
      },
      {
        nom: 'Inactif',
        typeEntite: 'Client',
        description: 'Client sans abonnement actif',
        couleur: '#9E9E9E', // Gris
      },
      {
        nom: 'Suspendu',
        typeEntite: 'Client',
        description: 'Client temporairement suspendu',
        couleur: '#FF5722', // Orange
      },
    ];

    // Statuts par défaut pour les abonnements
    const defaultAbonnementStatuts = [
      {
        nom: 'Actif',
        typeEntite: 'Abonnement',
        description: 'Abonnement en cours de validité',
        couleur: '#4CAF50', // Vert
      },
      {
        nom: 'En attente',
        typeEntite: 'Abonnement',
        description: 'Abonnement en attente de paiement ou de validation',
        couleur: '#FFC107', // Jaune
      },
      {
        nom: 'Expiré',
        typeEntite: 'Abonnement',
        description: "Abonnement dont la date d'expiration est passée",
        couleur: '#F44336', // Rouge
      },
      {
        nom: 'Annulé',
        typeEntite: 'Abonnement',
        description: "Abonnement annulé avant sa date d'expiration",
        couleur: '#9E9E9E', // Gris
      },
    ];

    // Créer tous les statuts par défaut
    await this.prisma.statut.createMany({
      data: [...defaultClientStatuts, ...defaultAbonnementStatuts],
    });
  }
}
