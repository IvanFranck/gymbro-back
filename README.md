# Base de Code pour Microservices NestJS

Ce projet sert de base de code standardisée pour le développement de microservices avec NestJS. Il intègre plusieurs configurations et outils essentiels pour démarrer rapidement un nouveau microservice.

## Fonctionnalités Intégrées

### Tests
- Configuration complète de Jest pour les tests unitaires
- Support des tests d'intégration avec base de données dédiée
- Tests E2E configurés avec SuperTest
- Utilitaires de test personnalisés (@suites/unit, @suites/doubles.jest)
- Base de données de test isolée via Docker

### Internationalisation
- Support multilingue avec nestjs-i18n
- Génération automatique des types pour les traductions

### Base de Données
- Integration de Prisma ORM
- Scripts de migration automatisés
- Configuration séparée pour les environnements de dev/test

### Configuration
- Gestion des variables d'environnement avec @nestjs/config
- Validation des configurations avec Joi
- Séparation des environnements (dev, test, prod)

## Installation
