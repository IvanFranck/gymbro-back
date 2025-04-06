import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  CreateClientDto,
  FindClientsQueryDto,
  UpdateClientDto,
} from './dto/customers.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Check if client with this telephone already exists
    const existingClient = await this.prisma.client.findUnique({
      where: { telephone: createClientDto.telephone },
    });

    if (existingClient) {
      throw new ConflictException(
        `Un client avec le numéro de téléphone ${createClientDto.telephone} existe déjà`,
      );
    }

    // Verify that the statut exists
    const statut = await this.prisma.statut.findUnique({
      where: { id: createClientDto.statutId },
    });

    if (!statut) {
      throw new NotFoundException(
        `Le statut avec l'id ${createClientDto.statutId} n'existe pas`,
      );
    }

    // Create the client
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll(query: FindClientsQueryDto) {
    const { search, statutId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build the where condition based on query parameters
    const where: Prisma.ClientWhereInput = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (statutId) {
      where.statutId = statutId;
    }

    // Get the total count for pagination
    const total = await this.prisma.client.count({ where });

    // Get the clients with pagination
    const clients = await this.prisma.client.findMany({
      where,
      include: {
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { dateInscription: 'desc' },
    });

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
        abonnements: {
          include: {
            typeAbonnement: true,
            statut: true,
          },
          orderBy: { dateExpiration: 'desc' },
          take: 5, // Get only the 5 most recent subscriptions
        },
        servicesAcces: {
          include: {
            service: true,
          },
          orderBy: { dateDebutAcces: 'desc' },
          take: 10, // Get only the 10 most recent service accesses
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${id} non trouvé`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${id} non trouvé`);
    }

    // Check if telephone is being updated and if it's already in use
    if (
      updateClientDto.telephone &&
      updateClientDto.telephone !== client.telephone
    ) {
      const existingClientWithPhone = await this.prisma.client.findUnique({
        where: { telephone: updateClientDto.telephone },
      });

      if (existingClientWithPhone) {
        throw new ConflictException(
          `Un client avec le numéro de téléphone ${updateClientDto.telephone} existe déjà`,
        );
      }
    }

    // Check if statut exists if it's being updated
    if (updateClientDto.statutId) {
      const statut = await this.prisma.statut.findUnique({
        where: { id: updateClientDto.statutId },
      });

      if (!statut) {
        throw new NotFoundException(
          `Le statut avec l'id ${updateClientDto.statutId} n'existe pas`,
        );
      }
    }

    // Update the client
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: number) {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'id ${id} non trouvé`);
    }

    // Check if client has active subscriptions
    const activeSubscriptions = await this.prisma.abonnement.findMany({
      where: {
        clientId: id,
        dateExpiration: {
          gt: new Date(),
        },
        statut: {
          nom: 'Actif',
        },
      },
    });

    if (activeSubscriptions.length > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce client car il possède ${activeSubscriptions.length} abonnement(s) actif(s)`,
      );
    }

    // Delete the client
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
