# Module ClientService

Ce module gère les relations entre les clients et les services dans l'application. Il permet d'accorder, de vérifier et de gérer les accès des clients aux différents services proposés, en les associant éventuellement à un abonnement spécifique.

## Fonctionnalités principales

- Attribution d'accès individuels aux services pour les clients
- Attribution en masse d'accès à plusieurs services pour un abonnement
- Vérification des droits d'accès à une date donnée
- Gestion des dates de début et de fin d'accès
- Résiliation ou mise à jour groupée d'accès liés à un abonnement
- Consultation des services accessibles par un client
- Consultation des clients ayant accès à un service

## Structure du module

- `client-service.module.ts` - Définition du module NestJS
- `client-service.controller.ts` - Contrôleur exposant les endpoints API
- `client-service.service.ts` - Service contenant la logique métier
- `dto/client-service.dto.ts` - Data Transfer Objects pour la validation et la documentation

## Modèle de données

La relation ClientService est définie par les propriétés suivantes :

| Propriété     | Type     | Description                                               |
|---------------|----------|-----------------------------------------------------------|
| id            | number   | Identifiant unique généré automatiquement                 |
| clientId      | number   | ID du client (clé étrangère)                              |
| serviceId     | number   | ID du service (clé étrangère)                             |
| dateDebutAcces| Date     | Date à partir de laquelle l'accès est valide              |
| dateFinAcces  | Date     | Date d'expiration de l'accès (null = sans limite)         |
| abonnementId  | number   | ID de l'abonnement associé (clé étrangère, optionnel)     |
| createdAt     | Date     | Date de création de l'enregistrement                      |
| updatedAt     | Date     | Date de dernière modification de l'enregistrement         |

## Relations avec les autres entités

- **Client**: Chaque ClientService est associé à un client spécifique
- **Service**: Chaque ClientService donne accès à un service spécifique
- **Abonnement**: ClientService peut être associé à un abonnement (facultatif)

## API Endpoints

| Méthode | Route                                            | Description                                             |
|---------|--------------------------------------------------|---------------------------------------------------------|
| POST    | /client-services                                 | Créer un nouvel accès au service pour un client         |
| POST    | /client-services/bulk                            | Créer des accès en masse pour un abonnement             |
| GET     | /client-services                                 | Récupérer tous les accès aux services (avec filtres)    |
| GET     | /client-services/:id                             | Récupérer un accès au service par son ID                |
| GET     | /client-services/client/:clientId/services       | Récupérer les services accessibles par un client        |
| GET     | /client-services/service/:serviceId/clients      | Récupérer les clients ayant accès à un service          |
| GET     | /client-services/check-access/:clientId/:serviceId | Vérifier si un client a accès à un service            |
| PATCH   | /client-services/:id                             | Mettre à jour un accès au service                       |
| DELETE  | /client-services/:id                             | Supprimer un accès au service                           |
| PATCH   | /client-services/subscription/:abonnementId/update-end-dates | Mettre à jour la date de fin pour tous les accès liés à un abonnement |
| PATCH   | /client-services/subscription/:abonnementId/terminate | Résilier tous les accès liés à un abonnement       |

## Exemples d'utilisation

### Création d'un accès à un service

```typescript
// Création d'un accès au service pour un client
const createDto = {
  clientId: 1,
  serviceId: 2,
  dateDebutAcces: '2025-01-01T00:00:00Z',
  dateFinAcces: '2025-12-31T23:59:59Z',
  abonnementId: 5
};

const clientService = await clientServiceService.create(createDto);
```

### Attribution groupée d'accès lors de la création d'un abonnement

```typescript
// Dans un service d'abonnement
constructor(private clientServiceService: ClientServiceService) {}

async createSubscriptionWithServices(subscriptionId: number, serviceIds: number[]) {
  // Après avoir créé l'abonnement...
  
  // Attribuer les accès aux services
  await this.clientServiceService.bulkCreateAccess({
    abonnementId: subscriptionId,
    serviceIds,
    // Les dates seront automatiquement définies sur la période de l'abonnement
  });
}
```

### Vérification d'accès à un service

```typescript
// Dans un contrôleur ou un service
constructor(private clientServiceService: ClientServiceService) {}

async verifyAccess(clientId: number, serviceId: number) {
  const hasAccess = await this.clientServiceService.checkAccess(clientId, serviceId);
  
  if (!hasAccess) {
    throw new ForbiddenException('Vous n\'avez pas accès à ce service');
  }
  
  return { message: 'Accès autorisé au service' };
}
```

### Mettre à jour les dates de fin lors du renouvellement d'un abonnement

```typescript
// Dans un service d'abonnement
constructor(private clientServiceService: ClientServiceService) {}

async renewSubscription(subscriptionId: number, newEndDate: Date) {
  // Après avoir mis à jour l'abonnement...
  
  // Mettre à jour les dates de fin des accès existants
  await this.clientServiceService.updateAllAccessEndDatesForSubscription(
    subscriptionId,
    newEndDate
  );
}
```

## Considérations d'utilisation

1. **Association avec un abonnement**: Un ClientService peut être associé à un abonnement, mais ce n'est pas obligatoire. Cela permet de gérer des accès ponctuels ou spéciaux en dehors du cadre d'un abonnement.

2. **Accès sans limite de temps**: Si `dateFinAcces` est à `null`, l'accès est considéré comme sans limite de temps (jusqu'à ce qu'il soit explicitement révoqué).

3. **Vérification à une date spécifique**: Toutes les fonctions de vérification d'accès acceptent un paramètre de date optionnel, ce qui permet de vérifier les droits d'accès passés ou futurs.

4. **Validation des données**: Le service effectue des validations approfondies avant d'accorder un accès, notamment:
   - Vérification que le client et le service existent
   - Vérification que le service est actif
   - Vérification que l'abonnement est actif et appartient bien au client
   - Vérification de la cohérence des dates

## Intégration avec les autres modules

Ce module constitue le pont entre les modules Client, Service et Abonnement. Il s'intègre particulièrement bien avec:

- **Module Abonnement**: Lors de la création ou du renouvellement d'un abonnement, des accès aux services peuvent être automatiquement créés ou mis à jour.
- **Module Service**: Permet de connaître la liste des clients ayant accès à un service.
- **Module Client**: Permet de connaître la liste des services accessibles par un client.

Cette centralisation de la gestion des accès offre une grande flexibilité dans la configuration des offres et des droits d'accès tout en maintenant une structure de données cohérente.