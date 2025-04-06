# Module Abonnements

Ce module gère les abonnements des clients dans l'application. Il permet de créer, lire, mettre à jour et supprimer des abonnements, ainsi que des fonctionnalités spécifiques comme le renouvellement et la gestion des abonnements expirés.

## Fonctionnalités

- CRUD complet pour les abonnements
- Filtrage et pagination des abonnements
- Renouvellement des abonnements
- Détection des abonnements expirant prochainement
- Mise à jour automatique des statuts des abonnements expirés

## Structure du module

- `abonnement.module.ts` - Définition du module NestJS
- `abonnement.controller.ts` - Contrôleur exposant les endpoints API
- `abonnement.service.ts` - Service contenant la logique métier
- `dto/abonnement.dto.ts` - Data Transfer Objects pour la validation et la documentation
- `abonnement.tasks.ts` - Tâches planifiées pour la gestion automatique des abonnements

## API Endpoints

| Méthode | Route                  | Description                                     |
|---------|------------------------|-------------------------------------------------|
| POST    | /abonnements           | Créer un nouvel abonnement                      |
| GET     | /abonnements           | Récupérer tous les abonnements (avec filtres)   |
| GET     | /abonnements/expiring  | Récupérer les abonnements qui expirent bientôt  |
| POST    | /abonnements/update-expired | Mettre à jour le statut des abonnements expirés |
| GET     | /abonnements/:id       | Récupérer un abonnement par son ID              |
| PATCH   | /abonnements/:id       | Mettre à jour un abonnement                     |
| POST    | /abonnements/:id/renew | Renouveler un abonnement existant               |
| DELETE  | /abonnements/:id       | Supprimer un abonnement                         |

## DTOs et Modèles de Données

### CreateAbonnementDto

Utilisé pour créer un nouvel abonnement :

```typescript
{
  "clientId": 1,
  "typeAbonnementId": 2,
  "dateDebut": "2025-01-01T00:00:00Z",
  "dateExpiration": "2026-01-01T00:00:00Z",
  "montantPaye": 899,
  "datePaiement": "2025-01-01T00:00:00Z",
  "statutId": 1,
  "methodePaiementId": 1
}
```

### UpdateAbonnementDto

Utilisé pour mettre à jour un abonnement existant (tous les champs sont optionnels) :

```typescript
{
  "typeAbonnementId": 3,
  "dateExpiration": "2026-06-01T00:00:00Z",
  "statutId": 2
}
```

### RenewAbonnementDto

Utilisé pour renouveler un abonnement existant :

```typescript
{
  "typeAbonnementId": 2,
  "dateDebut": "2026-01-02T00:00:00Z",
  "montantPaye": 899,
  "methodePaiementId": 1
}
```

### FindAbonnementsQueryDto

Paramètres de requête pour filtrer la liste des abonnements :

```
GET /abonnements?clientId=1&statutId=1&page=1&limit=10
```

## Tâches Planifiées

Le module inclut une tâche planifiée qui s'exécute chaque jour à minuit pour mettre à jour le statut des abonnements expirés.

## Intégration avec les Autres Modules

Ce module dépend des modules suivants :
- `PrismaModule` - Pour l'accès à la base de données
- `ScheduleModule` - Pour les tâches planifiées

Il est conçu pour fonctionner en conjonction avec les modules :
- `ClientModule` - Pour la gestion des clients
- `TypeAbonnementModule` - Pour les types d'abonnements
- `StatutModule` - Pour les statuts des abonnements
- `MethodePaiementModule` - Pour les méthodes de paiement

## Utilisation dans l'Application

```typescript
// Dans app.module.ts
import { AbonnementModule } from './abonnement/abonnement.module';

@Module({
  imports: [
    // ... autres modules
    AbonnementModule,
  ],
})
export class AppModule {}
```