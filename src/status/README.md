# Module Statut

Ce module gère les différents statuts qui peuvent être attribués aux clients et aux abonnements dans l'application. Il permet de créer, consulter, modifier et supprimer des statuts, avec des fonctionnalités pour initialiser automatiquement des statuts par défaut.

## Fonctionnalités principales

- CRUD complet pour les statuts
- Filtrage des statuts par type d'entité et recherche textuelle
- Initialisation automatique des statuts par défaut lors du démarrage de l'application
- Statistiques d'utilisation des statuts
- Validation pour éviter les conflits et les incohérences de données

## Structure du module

- `statut.module.ts` - Définition du module NestJS avec initialisation automatique des statuts par défaut
- `statut.controller.ts` - Contrôleur exposant les endpoints API
- `statut.service.ts` - Service contenant la logique métier
- `dto/statut.dto.ts` - Data Transfer Objects pour la validation et la documentation

## Modèle de données

Un statut est défini par les propriétés suivantes :

| Propriété    | Type     | Description                                               |
|--------------|----------|-----------------------------------------------------------|
| id           | number   | Identifiant unique généré automatiquement                 |
| nom          | string   | Nom du statut (ex: "Actif", "En attente", "Expiré")       |
| typeEntite   | string   | Type d'entité concerné ("Client" ou "Abonnement")         |
| description  | string   | Description détaillée du statut                           |
| couleur      | string   | Code couleur pour l'affichage dans l'interface            |
| createdAt    | Date     | Date de création de l'enregistrement                      |
| updatedAt    | Date     | Date de dernière modification de l'enregistrement         |

## Statuts par défaut

Le module initialise automatiquement les statuts suivants lors du premier démarrage :

### Statuts pour les clients

- **Actif** - Client actif avec un abonnement en cours de validité (vert)
- **En attente** - Client en attente d'activation ou de validation (jaune)
- **Inactif** - Client sans abonnement actif (gris)
- **Suspendu** - Client temporairement suspendu (orange)

### Statuts pour les abonnements

- **Actif** - Abonnement en cours de validité (vert)
- **En attente** - Abonnement en attente de paiement ou de validation (jaune)
- **Expiré** - Abonnement dont la date d'expiration est passée (rouge)
- **Annulé** - Abonnement annulé avant sa date d'expiration (gris)

## API Endpoints

| Méthode | Route                                | Description                                           |
|---------|--------------------------------------|-------------------------------------------------------|
| POST    | /statuts                             | Créer un nouveau statut                               |
| GET     | /statuts                             | Récupérer tous les statuts (avec filtres)             |
| GET     | /statuts/statistics                  | Récupérer les statistiques d'utilisation des statuts  |
| POST    | /statuts/init-defaults               | Initialiser les statuts par défaut                    |
| GET     | /statuts/:id                         | Récupérer un statut par son ID                        |
| PATCH   | /statuts/:id                         | Mettre à jour un statut                               |
| DELETE  | /statuts/:id                         | Supprimer un statut                                   |
| GET     | /statuts/type/:typeEntite            | Récupérer tous les statuts d'un type d'entité         |
| GET     | /statuts/name/:nom/type/:typeEntite  | Récupérer un statut par son nom et son type d'entité  |

## Exemples d'utilisation

### Récupérer tous les statuts de type "Client"

```typescript
// Dans un service ou un contrôleur
constructor(private statutService: StatutService) {}

async getClientStatuts() {
  return this.statutService.findAll({ typeEntite: 'Client' });
}
```

### Trouver un statut "Actif" pour les abonnements

```typescript
// Dans un service ou un contrôleur
constructor(private statutService: StatutService) {}

async getActiveSubscriptionStatus() {
  return this.statutService.findByNameAndType('Actif', 'Abonnement');
}
```

### Mettre à jour automatiquement les statuts des abonnements expirés

```typescript
// Dans un service d'abonnement
constructor(
  private prisma: PrismaService,
  private statutService: StatutService,
) {}

async updateExpiredSubscriptions() {
  // Trouver le statut "Expiré" pour les abonnements
  const expiredStatus = await this.statutService.findByNameAndType('Expiré', 'Abonnement');
  
  if (!expiredStatus) {
    throw new Error('Statut "Expiré" non trouvé');
  }
  
  // Mettre à jour les abonnements expirés
  const today = new Date();
  return this.prisma.abonnement.updateMany({
    where: {
      dateExpiration: { lt: today },
      statut: { 
        nom: { not: 'Expiré' } 
      }
    },
    data: {
      statutId: expiredStatus.id
    }
  });
}
```

## Bonnes pratiques

1. Toujours utiliser le service `StatutService` pour accéder aux statuts plutôt que d'utiliser des ID en dur dans le code.
2. Exploiter la méthode `findByNameAndType` pour récupérer un statut par son nom et son type d'entité, ce qui rend le code plus lisible et maintainable.
3. Ne pas supprimer les statuts utilisés par des clients ou des abonnements.
4. Utiliser les couleurs des statuts de manière cohérente dans l'interface utilisateur pour une meilleure expérience utilisateur.

## Intégration avec les autres modules

Ce module est conçu pour être utilisé par les modules Client et Abonnement. Les relations dans le schéma Prisma permettent de garantir l'intégrité référentielle entre les statuts et les entités qui les utilisent.