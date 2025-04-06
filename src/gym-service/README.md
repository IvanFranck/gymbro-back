# Module Service

Ce module gère les différents services proposés aux clients dans l'application. Il permet de définir, configurer et suivre les services auxquels les clients peuvent accéder via leurs abonnements, comme des cours collectifs, l'accès à des installations spécifiques, ou des prestations individuelles.

## Fonctionnalités principales

- CRUD complet pour les services
- Filtrage des services par nom, description, durée, capacité et statut actif
- Pagination des résultats pour une navigation efficace
- Activation/désactivation des services sans suppression
- Statistiques d'utilisation des services
- Initialisation automatique des services par défaut au démarrage

## Structure du module

- `service.module.ts` - Définition du module NestJS avec initialisation automatique des services par défaut
- `service.controller.ts` - Contrôleur exposant les endpoints API
- `service.service.ts` - Service contenant la logique métier
- `dto/service.dto.ts` - Data Transfer Objects pour la validation et la documentation

## Modèle de données

Un service est défini par les propriétés suivantes :

| Propriété     | Type     | Description                                               |
|---------------|----------|-----------------------------------------------------------|
| id            | number   | Identifiant unique généré automatiquement                 |
| nom           | string   | Nom du service (ex: "Cours de yoga")                      |
| description   | string   | Description détaillée du service                          |
| dureeStandard | number   | Durée standard du service en minutes (pour les cours)     |
| capaciteMax   | number   | Capacité maximale (nombre de personnes simultanées)       |
| actif         | boolean  | Indique si le service est disponible                      |
| createdAt     | Date     | Date de création de l'enregistrement                      |
| updatedAt     | Date     | Date de dernière modification de l'enregistrement         |

## Services par défaut

Le module initialise automatiquement les services suivants lors du premier démarrage (adaptés à une salle de sport/fitness) :

- **Accès salle de musculation** - Accès illimité à la salle de musculation avec équipements professionnels
- **Cours de yoga** - Cours de yoga pour tous niveaux (60 minutes, 20 personnes max)
- **Cours de pilates** - Renforcement musculaire doux (45 minutes, 15 personnes max)
- **Spinning** - Cours de vélo en salle avec coach (45 minutes, 25 personnes max)
- **Coach personnel** - Séance individuelle avec un coach sportif (60 minutes, 1 personne)
- **Accès piscine** - Accès à la piscine pour nage libre ou activités aquatiques (30 personnes max)

## API Endpoints

| Méthode | Route                    | Description                                           |
|---------|--------------------------|-------------------------------------------------------|
| POST    | /services                | Créer un nouveau service                              |
| GET     | /services                | Récupérer tous les services (avec filtres)            |
| GET     | /services/statistics     | Récupérer les statistiques d'utilisation              |
| POST    | /services/init-defaults  | Initialiser les services par défaut                   |
| GET     | /services/:id            | Récupérer un service par son ID                       |
| GET     | /services/name/:nom      | Récupérer un service par son nom                      |
| PATCH   | /services/:id            | Mettre à jour un service                              |
| DELETE  | /services/:id            | Supprimer un service (si non utilisé)                 |
| PATCH   | /services/:id/activate   | Activer un service                                    |
| PATCH   | /services/:id/deactivate | Désactiver un service                                 |

## Exemples d'utilisation

### Récupérer tous les services actifs avec une durée de 60 minutes

```typescript
// Dans un service ou un contrôleur
constructor(private serviceService: ServiceService) {}

async get60MinuteServices() {
  return this.serviceService.findAll({ 
    actif: true,
    dureeMin: 60,
    dureeMax: 60
  });
}
```

### Trouver un service par son nom et vérifier sa disponibilité

```typescript
// Dans un service ou un contrôleur
constructor(private serviceService: ServiceService) {}

async checkServiceAvailability(serviceName: string) {
  const service = await this.serviceService.findByName(serviceName);
  
  if (!service) {
    throw new NotFoundException(`Service "${serviceName}" non trouvé`);
  }
  
  if (!service.actif) {
    throw new BadRequestException(`Le service "${serviceName}" n'est pas disponible actuellement`);
  }
  
  return {
    isAvailable: true,
    capacity: service.capaciteMax,
    duration: service.dureeStandard,
  };
}
```

### Obtenir le top 3 des services les plus populaires

```typescript
// Dans un service ou un contrôleur
constructor(private serviceService: ServiceService) {}

async getTopServices() {
  const stats = await this.serviceService.getStatistics();
  
  return stats.mostUsedServices
    .slice(0, 3)
    .map(service => ({
      nom: service.nom,
      clientCount: service.clientCount,
      isActive: service.actif
    }));
}
```

## Relation avec le module ClientService

Ce module Service définit les services disponibles, mais l'association entre clients et services est gérée par le module ClientService (relation many-to-many). Le module ClientService contient également les dates de début et de fin d'accès.

Exemple d'interface avec le module ClientService :

```typescript
// Dans ClientServiceService
constructor(
  private prisma: PrismaService,
  private serviceService: ServiceService,
) {}

async grantServiceAccess(clientId: number, serviceId: number, abonnementId: number) {
  // Vérifier que le service existe et est actif
  const service = await this.serviceService.findOne(serviceId);
  
  if (!service.actif) {
    throw new BadRequestException(`Le service "${service.nom}" n'est pas disponible actuellement`);
  }
  
  // Créer l'accès au service pour le client
  return this.prisma.clientService.create({
    data: {
      clientId,
      serviceId,
      abonnementId,
      dateDebutAcces: new Date(),
      dateFinAcces: null, // Accès sans date de fin
    }
  });
}
```

## Considérations d'utilisation

1. **Services avec ou sans durée** : Certains services comme l'accès à une salle peuvent ne pas avoir de durée standard (`dureeStandard: null`), tandis que des cours ou séances ont une durée fixe.

2. **Contrôle de capacité** : Le champ `capaciteMax` peut servir à gérer les réservations et s'assurer qu'un service n'est pas surréservé.

3. **Désactiver vs Supprimer** : Privilégiez la désactivation d'un service plutôt que sa suppression si celui-ci n'est temporairement pas disponible, afin de conserver l'historique des utilisations passées.

4. **Services par défaut** : Les services par défaut sont optimisés pour une salle de sport/fitness, mais vous pouvez les adapter ou en créer de nouveaux selon votre domaine d'activité.

## Intégration avec les autres modules

Le module Service est conçu pour fonctionner avec les modules suivants :
- `ClientService` - Gère les associations entre clients et services
- `Abonnement` - Permet de déterminer quels services sont accessibles via un abonnement
- `TypeAbonnement` - Peut définir quels types d'abonnements donnent accès à quels services

Cette intégration permet une gestion complète des accès aux services basée sur les abonnements des clients.