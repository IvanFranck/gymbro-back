import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Abonnement, Prisma } from '@prisma/client';
import {
  CreateAbonnementDto,
  UpdateAbonnementDto,
  FindAbonnementsQueryDto,
  RenewAbonnementDto,
} from './dto/membership.dto';
import { add } from 'date-fns';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouvel abonnement
   */
  async create(createAbonnementDto: CreateAbonnementDto): Promise<Abonnement> {
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: createAbonnementDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Le client avec l'id ${createAbonnementDto.clientId} n'existe pas`,
      );
    }

    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id: createAbonnementDto.typeAbonnementId },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Le type d'abonnement avec l'id ${createAbonnementDto.typeAbonnementId} n'existe pas`,
      );
    }

    // Vérifier que le tarif d'abonnement existe
    const tarifAbonnement = await this.prisma.tarifAbonnement.findUnique({
      where: { id: createAbonnementDto.tarifAbonnementId },
    });

    if (!tarifAbonnement) {
      throw new NotFoundException(
        `Le tarif d'abonnement avec l'id ${createAbonnementDto.tarifAbonnementId} n'existe pas`,
      );
    }

    // Vérifier que le statut existe
    const statut = await this.prisma.statut.findUnique({
      where: { id: createAbonnementDto.statutId },
    });

    if (!statut) {
      throw new NotFoundException(
        `Le statut avec l'id ${createAbonnementDto.statutId} n'existe pas`,
      );
    }

    // Vérifier la méthode de paiement si fournie
    if (createAbonnementDto.methodePaiementId) {
      const methodePaiement = await this.prisma.methodePaiement.findUnique({
        where: { id: createAbonnementDto.methodePaiementId },
      });

      if (!methodePaiement) {
        throw new NotFoundException(
          `La méthode de paiement avec l'id ${createAbonnementDto.methodePaiementId} n'existe pas`,
        );
      }
    }

    // Vérifier que la date de début est antérieure à la date d'expiration
    const dateDebut = new Date(createAbonnementDto.dateDebut);
    const dateExpiration = new Date(createAbonnementDto.dateExpiration);

    if (dateDebut >= dateExpiration) {
      throw new BadRequestException(
        "La date de début doit être antérieure à la date d'expiration",
      );
    }

    // Créer l'abonnement
    return this.prisma.abonnement.create({
      data: {
        clientId: createAbonnementDto.clientId,
        typeAbonnementId: createAbonnementDto.typeAbonnementId,
        tarifAbonnmentId: createAbonnementDto.tarifAbonnementId,
        dateDebut,
        dateExpiration,
        montantPaye: createAbonnementDto.montantPaye,
        datePaiement: createAbonnementDto.datePaiement
          ? new Date(createAbonnementDto.datePaiement)
          : new Date(),
        statutId: createAbonnementDto.statutId,
        methodePaiementId: createAbonnementDto.methodePaiementId,
      },
    });
  }

  /**
   * Récupère tous les abonnements avec filtres et pagination
   */
  async findAll(query: FindAbonnementsQueryDto) {
    const {
      clientId,
      typeAbonnementId,
      statutId,
      dateDebutMin,
      dateDebutMax,
      dateExpirationMin,
      dateExpirationMax,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // Construire la clause where basée sur les paramètres de requête
    const where: Prisma.AbonnementWhereInput = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (typeAbonnementId) {
      where.typeAbonnementId = typeAbonnementId;
    }

    if (statutId) {
      where.statutId = statutId;
    }

    // Filtres de date
    if (dateDebutMin || dateDebutMax) {
      where.dateDebut = {};

      if (dateDebutMin) {
        where.dateDebut.gte = new Date(dateDebutMin);
      }

      if (dateDebutMax) {
        where.dateDebut.lte = new Date(dateDebutMax);
      }
    }

    if (dateExpirationMin || dateExpirationMax) {
      where.dateExpiration = {};

      if (dateExpirationMin) {
        where.dateExpiration.gte = new Date(dateExpirationMin);
      }

      if (dateExpirationMax) {
        where.dateExpiration.lte = new Date(dateExpirationMax);
      }
    }

    // Obtenir le nombre total pour la pagination
    const total = await this.prisma.abonnement.count({ where });

    // Obtenir les abonnements avec pagination
    const abonnements = await this.prisma.abonnement.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        typeAbonnement: {
          select: {
            id: true,
            nom: true,
          },
        },
        tarif: {
          select: {
            id: true,
            prix: true,
            dureeJours: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
        methodePaiement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { dateExpiration: 'desc' },
    });

    return {
      data: abonnements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un abonnement par son ID
   */
  async findOne(id: number) {
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
          },
        },
        typeAbonnement: true,
        tarif: true,
        statut: true,
        methodePaiement: true,
        servicesAcces: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!abonnement) {
      throw new NotFoundException(`Abonnement avec l'id ${id} non trouvé`);
    }

    return abonnement;
  }

  /**
   * Met à jour un abonnement existant
   */
  async update(id: number, updateAbonnementDto: UpdateAbonnementDto) {
    // Vérifier que l'abonnement existe
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id },
    });

    if (!abonnement) {
      throw new NotFoundException(`Abonnement avec l'id ${id} non trouvé`);
    }

    // Vérifier le type d'abonnement s'il est fourni
    if (updateAbonnementDto.typeAbonnementId) {
      const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
        where: { id: updateAbonnementDto.typeAbonnementId },
      });

      if (!typeAbonnement) {
        throw new NotFoundException(
          `Le type d'abonnement avec l'id ${updateAbonnementDto.typeAbonnementId} n'existe pas`,
        );
      }
    }

    // Vérifier le tarif d'abonnement s'il est fourni
    if (updateAbonnementDto.tarifAbonnementId) {
      const tarifAbonnement = await this.prisma.tarifAbonnement.findUnique({
        where: { id: updateAbonnementDto.tarifAbonnementId },
      });

      if (!tarifAbonnement) {
        throw new NotFoundException(
          `Le tarif d'abonnement avec l'id ${updateAbonnementDto.tarifAbonnementId} n'existe pas`,
        );
      }
    }

    // Vérifier le statut s'il est fourni
    if (updateAbonnementDto.statutId) {
      const statut = await this.prisma.statut.findUnique({
        where: { id: updateAbonnementDto.statutId },
      });

      if (!statut) {
        throw new NotFoundException(
          `Le statut avec l'id ${updateAbonnementDto.statutId} n'existe pas`,
        );
      }
    }

    // Vérifier la méthode de paiement si fournie
    if (updateAbonnementDto.methodePaiementId) {
      const methodePaiement = await this.prisma.methodePaiement.findUnique({
        where: { id: updateAbonnementDto.methodePaiementId },
      });

      if (!methodePaiement) {
        throw new NotFoundException(
          `La méthode de paiement avec l'id ${updateAbonnementDto.methodePaiementId} n'existe pas`,
        );
      }
    }

    // Préparer les données à mettre à jour
    const updateData: Prisma.AbonnementUpdateInput = {};

    if (updateAbonnementDto.typeAbonnementId) {
      updateData.typeAbonnement = {
        connect: { id: updateAbonnementDto.typeAbonnementId },
      };
    }

    if (updateAbonnementDto.tarifAbonnementId) {
      updateData.tarif = {
        connect: { id: updateAbonnementDto.tarifAbonnementId },
      };
    }

    if (updateAbonnementDto.dateDebut) {
      updateData.dateDebut = new Date(updateAbonnementDto.dateDebut);
    }

    if (updateAbonnementDto.dateExpiration) {
      updateData.dateExpiration = new Date(updateAbonnementDto.dateExpiration);
    }

    if (updateAbonnementDto.montantPaye) {
      updateData.montantPaye = updateAbonnementDto.montantPaye;
    }

    if (updateAbonnementDto.datePaiement) {
      updateData.datePaiement = new Date(updateAbonnementDto.datePaiement);
    }

    if (updateAbonnementDto.statutId) {
      updateData.statut = { connect: { id: updateAbonnementDto.statutId } };
    }

    if (updateAbonnementDto.methodePaiementId) {
      updateData.methodePaiement = {
        connect: { id: updateAbonnementDto.methodePaiementId },
      };
    }

    // Vérifier la cohérence des dates si les deux sont mises à jour
    if (updateAbonnementDto.dateDebut && updateAbonnementDto.dateExpiration) {
      const dateDebut = new Date(updateAbonnementDto.dateDebut);
      const dateExpiration = new Date(updateAbonnementDto.dateExpiration);

      if (dateDebut >= dateExpiration) {
        throw new BadRequestException(
          "La date de début doit être antérieure à la date d'expiration",
        );
      }
    } else if (updateAbonnementDto.dateDebut) {
      // Si seulement dateDebut est mise à jour, vérifier avec dateExpiration existante
      const dateDebut = new Date(updateAbonnementDto.dateDebut);

      if (dateDebut >= abonnement.dateExpiration) {
        throw new BadRequestException(
          "La date de début doit être antérieure à la date d'expiration",
        );
      }
    } else if (updateAbonnementDto.dateExpiration) {
      // Si seulement dateExpiration est mise à jour, vérifier avec dateDebut existante
      const dateExpiration = new Date(updateAbonnementDto.dateExpiration);

      if (abonnement.dateDebut >= dateExpiration) {
        throw new BadRequestException(
          "La date de début doit être antérieure à la date d'expiration",
        );
      }
    }

    // Mettre à jour l'abonnement
    return this.prisma.abonnement.update({
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
        typeAbonnement: {
          select: {
            id: true,
            nom: true,
          },
        },
        tarif: {
          select: {
            id: true,
            prix: true,
            dureeJours: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
        methodePaiement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  }

  /**
   * Supprime un abonnement
   */
  async remove(id: number) {
    // Vérifier que l'abonnement existe
    const abonnement = await this.prisma.abonnement.findUnique({
      where: { id },
      include: {
        servicesAcces: true,
      },
    });

    if (!abonnement) {
      throw new NotFoundException(`Abonnement avec l'id ${id} non trouvé`);
    }

    // Vérifier si l'abonnement a des services associés
    if (abonnement.servicesAcces.length > 0) {
      throw new ConflictException(
        `Impossible de supprimer cet abonnement car il possède ${abonnement.servicesAcces.length} service(s) associé(s)`,
      );
    }

    // Supprimer l'abonnement
    return this.prisma.abonnement.delete({
      where: { id },
    });
  }

  /**
   * Renouvelle un abonnement existant
   */
  async renew(id: number, renewDto: RenewAbonnementDto) {
    // Récupérer l'abonnement existant
    const existingAbonnement = await this.prisma.abonnement.findUnique({
      where: { id },
      include: {
        typeAbonnement: true,
        statut: true,
      },
    });

    if (!existingAbonnement) {
      throw new NotFoundException(`Abonnement avec l'id ${id} non trouvé`);
    }

    // Vérifier que le type d'abonnement existe
    const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
      where: { id: existingAbonnement.typeAbonnementId },
    });

    if (!typeAbonnement) {
      throw new NotFoundException(
        `Le type d'abonnement avec l'id ${existingAbonnement.typeAbonnementId} n'existe pas`,
      );
    }

    // Déterminer le tarif d'abonnement pour le renouvellement
    const tarifAbonnementId =
      renewDto.tarifAbonnementId || existingAbonnement.tarifAbonnmentId;

    // Vérifier que le tarif d'abonnement existe
    const tarifAbonnement = await this.prisma.tarifAbonnement.findUnique({
      where: { id: tarifAbonnementId },
    });

    if (!tarifAbonnement) {
      throw new NotFoundException(
        `L'offre d'abonnement avec l'id ${tarifAbonnementId} n'existe pas`,
      );
    }

    // Déterminer la date de début du nouvel abonnement
    let dateDebut: Date;

    if (renewDto.dateDebut) {
      dateDebut = new Date(renewDto.dateDebut);
    } else {
      // Par défaut, la date de début est le jour suivant la date d'expiration actuelle
      dateDebut = new Date(existingAbonnement.dateExpiration);
      dateDebut.setDate(dateDebut.getDate() + 1);
    }

    // Calculer la date d'expiration en fonction du type d'abonnement
    const dateExpiration = add(dateDebut, { days: tarifAbonnement.dureeJours });

    // Déterminer le montant payé
    const montantPaye = renewDto.montantPaye || tarifAbonnement.prix;

    // Trouver le statut "Actif"
    const statutActif = await this.prisma.statut.findFirst({
      where: {
        nom: 'Actif',
        typeEntite: 'Abonnement',
      },
    });

    if (!statutActif) {
      throw new NotFoundException(
        `Statut "Actif" pour les abonnements non trouvé`,
      );
    }

    // Créer le nouvel abonnement
    return this.prisma.abonnement.create({
      data: {
        clientId: existingAbonnement.clientId,
        typeAbonnementId: typeAbonnement.id,
        tarifAbonnmentId: tarifAbonnementId,
        dateDebut,
        dateExpiration,
        montantPaye,
        datePaiement: new Date(), // Date de paiement actuelle
        statutId: statutActif.id,
        methodePaiementId: renewDto.methodePaiementId,
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        typeAbonnement: {
          select: {
            id: true,
            nom: true,
          },
        },
        tarif: {
          select: {
            id: true,
            prix: true,
            dureeJours: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
        methodePaiement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });
  }

  /**
   * Récupère les abonnements qui expirent bientôt
   */
  async findExpiringAbonnements(daysThreshold: number = 30) {
    // Calculer la date limite (aujourd'hui + daysThreshold jours)
    const today = new Date();
    const expiryLimit = add(today, { days: daysThreshold });

    // Trouver les abonnements actifs qui expirent avant la date limite
    const expiringAbonnements = await this.prisma.abonnement.findMany({
      where: {
        dateExpiration: {
          gte: today,
          lte: expiryLimit,
        },
        statut: {
          nom: 'Actif',
        },
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
        typeAbonnement: {
          select: {
            id: true,
            nom: true,
          },
        },
        tarif: {
          select: {
            id: true,
            prix: true,
            dureeJours: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
      },
      orderBy: {
        dateExpiration: 'asc',
      },
    });

    return expiringAbonnements;
  }

  /**
   * Met à jour automatiquement les statuts des abonnements expirés
   */
  async updateExpiredAbonnements() {
    // Trouver le statut "Expiré"
    const statutExpire = await this.prisma.statut.findFirst({
      where: {
        nom: 'Expiré',
        typeEntite: 'Abonnement',
      },
    });

    if (!statutExpire) {
      throw new NotFoundException(
        `Statut "Expiré" pour les abonnements non trouvé`,
      );
    }

    // Mettre à jour tous les abonnements actifs qui sont expirés
    const today = new Date();
    const updatedCount = await this.prisma.abonnement.updateMany({
      where: {
        dateExpiration: {
          lt: today,
        },
        statutId: {
          not: statutExpire.id,
        },
      },
      data: {
        statutId: statutExpire.id,
      },
    });

    return {
      updated: updatedCount.count,
      message: `${updatedCount.count} abonnement(s) ont été marqués comme expirés.`,
    };
  }
}
