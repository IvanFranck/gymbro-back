# Module TypeAbonnement

Ce module gère les types d'abonnements disponibles dans l'application. Il permet de définir différentes formules d'abonnement avec leurs caractéristiques (durée, prix, niveau, etc.) qui pourront ensuite être associées aux abonnements des clients.

## Fonctionnalités

- CRUD complet pour les types d'abonnements
- Filtrage et pagination des types d'abonnements
- Activation/désactivation des types d'abonnements
- Statistiques sur l'utilisation des types d'abonnements

## Structure du module

- `type-abonnement.module.ts` - Définition du module NestJS
- `type-abonnement.controller.ts` - Contrôleur exposant les endpoints API
- `type-abonnement.service.ts` - Service contenant la logique métier
- `dto/type-abonnement.dto.ts` - Data Transfer Objects pour la validation et la documentation

## Entité TypeAbonnement

Un type d'abonnement est défini par les propriétés suivantes :

| Propriété    | Type     | Description                                                |
|--------------|----------|------------------------------------------------------------|
| id           | number   | Identifiant unique généré automatiquement                  |
| nom          | string   | Nom du type d'abonnement (ex: "Abonnement Premium Annuel") |
| niveau       | string   | Niveau de l'offre (ex: "Basic", "Standard", "Premium")     |
| dureeJours   | number   | Durée de validité de l'abonnement en jours                 |
| prix         | number   | Prix de l'abonnement                                       |
| description  | string   | Description détaillée du type d'abonnement                 |
| actif        | boolean  | Indique si le type d'abonnement est disponible             |
| createdAt    | Date     | Date de création de l'enregistrement                       |
| updatedAt    | Date     | Date de dernière modification de l'enregistrement          |

## API Endpoints

| Méthode | Route                         | Description                                          |
|---------|-------------------------------|------------------------------------------------------|
| POST    | /types-abonnements            | Créer un nouveau type d'abonnement                   |
| GET     | /types-abonnements            | Récupérer tous les types d'abonnements (avec filtres)|
| GET     | /types-abonnements/statistics | Récupérer les statistiques des types d'abonnements   |
| GET     | /types-abonnements/:id        | Récupérer un type d'abonnement par son ID            |
| PATCH   | /types-abonnements/:id        | Mettre à jour un type d'abonnement                   |
| DELETE  | /types-abonnements/:id        | Supprimer un type d'abonnement                       |
| PATCH   | /types-abonnements/:id/de