import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePricingDto, FindPricingQueryDto } from './dto/pricing.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrincingService {
  constructor(private prisma: PrismaService) {}

  async create(createPricingDto: CreatePricingDto) {
    try {
      const { typeAbonnementId, ...data } = createPricingDto;
      const typeAbonnement = await this.prisma.typeAbonnement.findUnique({
        where: {
          id: typeAbonnementId,
        },
      });

      if (!typeAbonnement) {
        throw new Error("Type d'abonnement introuvable");
      }

      return await this.prisma.tarifAbonnement.create({
        data: {
          ...data,
          typeAbonnement: {
            connect: {
              id: typeAbonnementId,
            },
          },
        },
      });
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async findAll(query: FindPricingQueryDto) {
    try {
      const { typeAbonnementId, actif, genre, prixMin, prixMax } = query;

      // Construire la clause where basée sur les paramètres de requête
      const where: Prisma.TarifAbonnementWhereInput = {};

      // Filtre par type d'abonnement
      if (typeAbonnementId) {
        where.typeAbonnementId = typeAbonnementId;
      }

      // Filtre par statut actif/inactif
      if (actif !== undefined) {
        where.actif = actif;
      }

      // Filtre par genre
      if (genre) {
        where.genre = { contains: genre, mode: 'insensitive' };
      }

      // Filtre sur la plage de prix
      if (prixMin !== undefined && prixMax !== undefined) {
        where.prix = {
          gte: prixMin,
          lte: prixMax,
        };
      } else if (prixMin !== undefined) {
        where.prix = {
          gte: prixMin,
        };
      } else if (prixMax !== undefined) {
        where.prix = {
          lte: prixMax,
        };
      }

      return await this.prisma.tarifAbonnement.findMany({
        where,
      });
    } catch (error) {
      if (error.code instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }
}
