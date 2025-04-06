import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MethodePaiement, Prisma } from '@prisma/client';
import {
  CreateMethodePaiementDto,
  UpdateMethodePaiementDto,
  FindMethodesPaiementQueryDto,
} from './dto/payment-methos.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle méthode de paiement
   */
  async create(
    createMethodePaiementDto: CreateMethodePaiementDto,
  ): Promise<MethodePaiement> {
    // Vérifier si une méthode de paiement avec le même nom existe déjà
    const existingMethode = await this.prisma.methodePaiement.findFirst({
      where: {
        nom: {
          equals: createMethodePaiementDto.nom,
          mode: 'insensitive', // Recherche insensible à la casse
        },
      },
    });

    if (existingMethode) {
      throw new ConflictException(
        `Une méthode de paiement avec le nom "${createMethodePaiementDto.nom}" existe déjà`,
      );
    }

    // Créer la méthode de paiement
    return this.prisma.methodePaiement.create({
      data: createMethodePaiementDto,
    });
  }

  /**
   * Récupère toutes les méthodes de paiement avec filtres
   */
  async findAll(
    query: FindMethodesPaiementQueryDto,
  ): Promise<MethodePaiement[]> {
    const { search, actif } = query;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.MethodePaiementWhereInput = {};

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

    // Récupérer les méthodes de paiement
    return this.prisma.methodePaiement.findMany({
      where,
      orderBy: { nom: 'asc' },
    });
  }

  /**
   * Récupère une méthode de paiement par son ID
   */
  async findOne(id: number): Promise<MethodePaiement> {
    const methodePaiement = await this.prisma.methodePaiement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { abonnements: true },
        },
      },
    });

    if (!methodePaiement) {
      throw new NotFoundException(
        `Méthode de paiement avec l'id ${id} non trouvée`,
      );
    }

    return methodePaiement;
  }

  /**
   * Récupère une méthode de paiement par son nom
   */
  async findByName(nom: string): Promise<MethodePaiement | null> {
    return this.prisma.methodePaiement.findFirst({
      where: {
        nom: {
          equals: nom,
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Met à jour une méthode de paiement existante
   */
  async update(
    id: number,
    updateMethodePaiementDto: UpdateMethodePaiementDto,
  ): Promise<MethodePaiement> {
    // Vérifier que la méthode de paiement existe
    const methodePaiement = await this.prisma.methodePaiement.findUnique({
      where: { id },
    });

    if (!methodePaiement) {
      throw new NotFoundException(
        `Méthode de paiement avec l'id ${id} non trouvée`,
      );
    }

    // Vérifier si le nom est modifié et s'il existe déjà
    if (
      updateMethodePaiementDto.nom &&
      updateMethodePaiementDto.nom !== methodePaiement.nom
    ) {
      const existingMethode = await this.prisma.methodePaiement.findFirst({
        where: {
          nom: {
            equals: updateMethodePaiementDto.nom,
            mode: 'insensitive',
          },
          id: { not: id }, // Exclure la méthode de paiement actuelle de la recherche
        },
      });

      if (existingMethode) {
        throw new ConflictException(
          `Une méthode de paiement avec le nom "${updateMethodePaiementDto.nom}" existe déjà`,
        );
      }
    }

    // Mettre à jour la méthode de paiement
    return this.prisma.methodePaiement.update({
      where: { id },
      data: updateMethodePaiementDto,
    });
  }

  /**
   * Supprime une méthode de paiement
   */
  async remove(id: number): Promise<void> {
    // Vérifier que la méthode de paiement existe
    const methodePaiement = await this.prisma.methodePaiement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { abonnements: true },
        },
      },
    });

    if (!methodePaiement) {
      throw new NotFoundException(
        `Méthode de paiement avec l'id ${id} non trouvée`,
      );
    }

    // Vérifier si la méthode de paiement est utilisée par des abonnements
    if (methodePaiement._count.abonnements > 0) {
      throw new ConflictException(
        `Impossible de supprimer cette méthode de paiement car elle est utilisée par ${methodePaiement._count.abonnements} abonnement(s)`,
      );
    }

    // Supprimer la méthode de paiement
    await this.prisma.methodePaiement.delete({
      where: { id },
    });
  }

  /**
   * Active ou désactive une méthode de paiement
   */
  async toggleActive(id: number, active: boolean): Promise<MethodePaiement> {
    // Vérifier que la méthode de paiement existe
    const methodePaiement = await this.prisma.methodePaiement.findUnique({
      where: { id },
    });

    if (!methodePaiement) {
      throw new NotFoundException(
        `Méthode de paiement avec l'id ${id} non trouvée`,
      );
    }

    // Si le statut est déjà celui demandé, ne rien faire
    if (methodePaiement.actif === active) {
      return methodePaiement;
    }

    // Mettre à jour la méthode de paiement
    return this.prisma.methodePaiement.update({
      where: { id },
      data: { actif: active },
    });
  }

  /**
   * Récupère les statistiques d'utilisation des méthodes de paiement
   */
  async getStatistics() {
    // Obtenir le nombre total de méthodes de paiement
    const totalCount = await this.prisma.methodePaiement.count();

    // Obtenir le nombre de méthodes de paiement actives
    const activeCount = await this.prisma.methodePaiement.count({
      where: { actif: true },
    });

    // Obtenir les méthodes de paiement les plus utilisées
    const mostUsedMethods = await this.prisma.methodePaiement.findMany({
      select: {
        id: true,
        nom: true,
        actif: true,
        _count: {
          select: { abonnements: true },
        },
      },
      orderBy: {
        abonnements: { _count: 'desc' },
      },
      take: 5,
    });

    // Obtenir la distribution des paiements par méthode
    const paymentDistribution = await this.prisma.abonnement.groupBy({
      by: ['methodePaiementId'],
      _sum: {
        montantPaye: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          montantPaye: 'desc',
        },
      },
    });

    // Enrichir les données de distribution avec les noms des méthodes de paiement
    const methodesWithNames = await Promise.all(
      paymentDistribution.map(async (item) => {
        if (!item.methodePaiementId) {
          return {
            ...item,
            nom: 'Sans méthode de paiement',
          };
        }

        const methode = await this.prisma.methodePaiement.findUnique({
          where: { id: item.methodePaiementId },
          select: { nom: true },
        });

        return {
          ...item,
          nom: methode?.nom || `Méthode ID ${item.methodePaiementId}`,
        };
      }),
    );

    return {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      mostUsedMethods: mostUsedMethods.map((method) => ({
        id: method.id,
        nom: method.nom,
        actif: method.actif,
        abonnementsCount: method._count.abonnements,
      })),
      paymentDistribution: methodesWithNames.map((item) => ({
        methodePaiementId: item.methodePaiementId,
        nom: item.nom,
        transactions: item._count.id,
        montantTotal: item._sum.montantPaye,
      })),
    };
  }

  /**
   * Initialise les méthodes de paiement par défaut si aucune n'existe
   */
  async initDefaultMethodesPaiement(): Promise<void> {
    const count = await this.prisma.methodePaiement.count();

    // Ne rien faire si des méthodes de paiement existent déjà
    if (count > 0) {
      return;
    }

    // Méthodes de paiement par défaut
    const defaultMethodes = [
      {
        nom: 'Carte bancaire',
        description: 'Paiement par carte bancaire (Visa, Mastercard, etc.)',
        actif: true,
      },
      {
        nom: 'Virement bancaire',
        description:
          "Paiement par virement bancaire sur le compte de l'entreprise",
        actif: true,
      },
      {
        nom: 'Espèces',
        description: "Paiement en espèces à l'accueil",
        actif: true,
      },
      {
        nom: 'Chèque',
        description: "Paiement par chèque à l'ordre de l'entreprise",
        actif: true,
      },
      {
        nom: 'Prélèvement automatique',
        description:
          'Paiement par prélèvement automatique mensuel sur le compte bancaire',
        actif: true,
      },
    ];

    // Créer toutes les méthodes de paiement par défaut
    await this.prisma.methodePaiement.createMany({
      data: defaultMethodes,
    });
  }
}
