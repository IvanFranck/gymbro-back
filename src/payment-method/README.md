# Module MethodePaiement

Ce module gère les différentes méthodes de paiement disponibles pour les abonnements dans l'application. Il permet de définir, configurer et suivre les moyens de paiement acceptés pour la souscription et le renouvellement des abonnements.

## Fonctionnalités principales

- CRUD complet pour les méthodes de paiement
- Filtrage des méthodes de paiement par nom/description et statut actif
- Activation/désactivation des méthodes de paiement sans suppression
- Statistiques d'utilisation des méthodes de paiement
- Initialisation automatique des méthodes de paiement standard au démarrage

## Structure du module

- `methode-paiement.module.ts` - Définition du module NestJS avec initialisation automatique des méthodes par défaut
- `methode-paiement.controller.ts` - Contrôleur exposant les endpoints API
- `methode-paiement.service.ts` - Service contenant la logique métier
- `dto/methode-paiement.dto.ts` - Data Transfer Objects pour la validation et la documentation

## Modèle de données

Une méthode de paiement est définie par les propriétés suivantes :

| Propriété    | Type     | Description                                               |
|--------------|----------|-----------------------------------------------------------|
| id           | number   | Identifiant unique généré automatiquement                 |
| nom          | string   | Nom de la méthode de paiement (ex: "Carte bancaire")      |
| description  | string   | Description détaillée de la méthode de paiement           |
| actif        | boolean  | Indique si la méthode de paiement est disponible          |
| createdAt    | Date     | Date de création de l'enregistrement                      |
| updatedAt    | Date     | Date de dernière modification de l'enregistrement         |

## Méthodes de paiement par défaut

Le module initialise automatiquement les méthodes de paiement suivantes lors du premier démarrage :

- **Carte bancaire** - Paiement par carte bancaire (Visa, Mastercard, etc.)
- **Virement bancaire** - Paiement par virement bancaire sur le compte de l'entreprise
- **Espèces** - Paiement en espèces à l'accueil
- **Chèque** - Paiement par chèque à l'ordre de l'entreprise
- **Prélèvement automatique** - Paiement par prélèvement automatique mensuel sur le compte bancaire

## API Endpoints

| Méthode | Route                                | Description                                                |
|---------|--------------------------------------|------------------------------------------------------------|
| POST    | /methodes-paiement                   | Créer une nouvelle méthode de paiement                     |
| GET     | /methodes-paiement                   | Récupérer toutes les méthodes de paiement (avec filtres)   |
| GET     | /methodes-paiement/statistics        | Récupérer les statistiques d'utilisation                   |
| POST    | /methodes-paiement/init-defaults     | Initialiser les méthodes de paiement par défaut            |
| GET     | /methodes-paiement/:id               | Récupérer une méthode de paiement par son ID               |
| GET     | /methodes-paiement/name/:nom         | Récupérer une méthode de paiement par son nom              |
| PATCH   | /methodes-paiement/:id               | Mettre à jour une méthode de paiement                      |
| DELETE  | /methodes-paiement/:id               | Supprimer une méthode de paiement (si non utilisée)        |
| PATCH   | /methodes-paiement/:id/activate      | Activer une méthode de paiement                            |
| PATCH   | /methodes-paiement/:id/deactivate    | Désactiver une méthode de paiement                         |

## Exemples d'utilisation

### Récupérer toutes les méthodes de paiement actives

```typescript
// Dans un service ou un contrôleur
constructor(private methodePaiementService: MethodePaiementService) {}

async getActivePaymentMethods() {
  return this.methodePaiementService.findAll({ actif: true });
}
```

### Trouver une méthode de paiement par son nom

```typescript
// Dans un service ou un contrôleur
constructor(private methodePaiementService: MethodePaiementService) {}

async getPaymentMethodByName(nomMethode: string) {
  const methode = await this.methodePaiementService.findByName(nomMethode);
  
  if (!methode) {
    throw new NotFoundException(`Méthode de paiement "${nomMethode}" non trouvée`);
  }
  
  return methode;
}
```

### Obtenir des statistiques sur les méthodes de paiement

```typescript
// Dans un service ou un contrôleur
constructor(private methodePaiementService: MethodePaiementService) {}

async getPaymentMethodStats() {
  const stats = await this.methodePaiementService.getStatistics();
  
  // Calculer le pourcentage d'utilisation pour chaque méthode
  const totalTransactions = stats.paymentDistribution.reduce((sum, item) => sum + item.transactions, 0);
  
  const statsWithPercentage = {
    ...stats,
    paymentDistribution: stats.paymentDistribution.map(item => ({
      ...item,
      percentage: totalTransactions > 0 
        ? Math.round((item.transactions / totalTransactions) * 100) 
        : 0,
    })),
  };
  
  return statsWithPercentage;
}
```

## Intégration avec le module Abonnement

Les méthodes de paiement sont principalement utilisées par le module Abonnement lors de la création ou du renouvellement d'un abonnement. Voici un exemple d'intégration :

```typescript
// Dans le service d'abonnement
constructor(
  private prisma: PrismaService,
  private methodePaiementService: MethodePaiementService,
) {}

async createAbonnement(createAbonnementDto: CreateAbonnementDto) {
  // Vérifier que la méthode de paiement existe et est active
  if (createAbonnementDto.methodePaiementId) {
    const methodePaiement = await this.methodePaiementService.findOne(
      createAbonnementDto.methodePaiementId
    );
    
    if (!methodePaiement.actif) {
      throw new BadRequestException(
        `La méthode de paiement "${methodePaiement.nom}" n'est pas disponible actuellement`
      );
    }
  }
  
  // Créer l'abonnement
  // ...
}
```

## Bonnes pratiques

1. Toujours vérifier qu'une méthode de paiement est active avant de l'utiliser dans un processus de création d'abonnement.
2. Plutôt que de supprimer une méthode de paiement obsolète, privilégier la désactivation pour conserver l'historique des paiements.
3. Utiliser les statistiques d'utilisation pour déterminer les méthodes de paiement les plus populaires et optimiser l'expérience utilisateur.
4. Lors de la mise à jour du système de paiement, créer de nouvelles méthodes plutôt que de modifier radicalement les existantes afin de préserver l'intégrité des données historiques.

## Sécurité

Bien que ce module gère principalement les métadonnées des méthodes de paiement, il est important de noter qu'il ne traite pas directement les données sensibles comme les numéros de carte bancaire. Pour un système de paiement complet, il est recommandé d'intégrer des services de paiement tiers sécurisés (comme Stripe, PayPal, etc.) et de stocker uniquement les références aux transactions.