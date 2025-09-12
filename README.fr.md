# Sidebar AI

> Une extension Chrome Manifest V3 qui fournit une interface de chat IA dans la barre latérale du navigateur avec des points de terminaison d'API personnalisables, des modèles et une conception d'interface utilisateur APPLE.

[English Version](README.md) | [中文版本](README.zh-CN.md) | [Versión en Español](README.es.md) | [Version Française](README.fr.md) | [日本語版](README.ja.md) | [русский язык](README.ru.md)

## Fonctionnalités

```
project/
├── manifest.json
├── background.js
├── sidebar.html
├── sidebar.css
├── sidebar.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── _locales/
│   ├── en/
│   │   └── messages.json
│   └── zh_CN/
│       └── messages.json
```

### Fonctionnalités Principales
- **Intégration de Barre Latérale**: Implémentation native de barre latérale Chrome utilisant l'API Side Panel de Manifest V3
- **Interface de Chat IA**: Interactions conversationnelles IA en temps réel avec réponses en streaming
- **Support Multilingue**: Internationalisation complète (i18n) avec localisations en anglais, chinois, espagnol, français, japonais
- **Stockage Persistant**: Gestion de l'historique des conversations avec persistance dans le stockage local

### Configuration d'API
- **Points de Terminaison d'API Personnalisables**: Points de terminaison REST configurables pour les services compatibles OpenAI
- **Sélection de Modèles**: Spécification flexible des modèles avec support de diverses architectures LLM
- **Gestion d'Authentification**: Stockage et gestion sécurisés des clés API
- **Contrôle de Température**: Paramètres ajustables de créativité des réponses (plage 0.0-1.0)

### Gestion des Conversations
- **Historique des Sessions**: Contexte de conversation persistant dans les sessions actives
- **Historique des Chats**: Archive complète des conversations historiques avec métadonnées d'horodatage
- **Changement de Conversation**: Transition fluide entre multiples contextes de chat
- **Suppression Sélective**: Gestion granulaire de l'historique des conversations avec suppression d'enregistrements individuels

### Conception UI/UX
- **Mise en Page Adaptative**: Conception responsive optimisée pour diverses dimensions de viewport
- **Support du Mode Sombre**: Détection automatique des préférences système avec changement dynamique de thème
- **Micro-interactions**: Animations et transitions subtiles utilisant des fonctions de timing cubic-bezier
- **Conformité d'Accessibilité**: Ratios de contraste conformes WCAG et structure HTML sémantique

## Architecture Technique

### Implémentation de Manifest V3
- **Service Worker**: Script d'arrière-plan pour la gestion du cycle de vie de l'extension
- **API Side Panel**: Interface de barre latérale dédiée avec contexte d'exécution isolé
- **API de Stockage**: Configuration synchronisée et persistance asynchrone des données de conversation
- **Permissions d'Hôte**: Accès sécurisé aux ressources cross-origin avec déclarations explicites de domaine

### Considérations de Sécurité
- **Isolation des Identifiants**: Clés API stockées dans des mécanismes de stockage chiffré de Chrome
- **Politique de Sécurité du Contenu**: Implémentation stricte de CSP prévenant les vulnérabilités XSS
- **Assainissement des Entrées**: Encodage d'entités HTML pour le rendu du contenu généré par les utilisateurs
- **Limitation de Débit**: Régulation des requêtes côté client pour prévenir l'abus d'API

### Optimisation des Performances
- **Chargement Différé**: Chargement conditionnel des ressources basé sur les modèles d'interaction utilisateur
- **Gestion de Mémoire**: Garbage collection efficace avec élagage des données de conversation
- **Délégation d'Événements**: Gestion optimisée des événements avec techniques de prévention de bouillonnement
- **Défilement Virtuel**: Rendu DOM efficace pour les historiques de conversation étendus

## Installation

### Configuration de Développement
1. Clonez le dépôt dans l'environnement de développement local
2. Naviguez vers `chrome://extensions/` dans le navigateur basé sur Chromium
3. Activez le toggle "Mode développeur"
4. Sélectionnez "Charger l'extension non empaquetée" et choisissez le répertoire de l'extension
5. Épinglez l'extension à la barre d'outils pour un accès pratique

### Exigences de Configuration
- **Point de Terminaison d'API**: URL de point de terminaison REST valide pour les services de complétion de chat
- **Jeton d'Authentification**: Jeton Bearer pour l'authentification du service API
- **Identificateur de Modèle**: Nom de modèle valide compatible avec le point de terminaison configuré

## Guide d'Utilisation

### Opérations de Base
1. **Lancer le Chat**: Cliquez sur l'icône de l'extension pour ouvrir l'interface de barre latérale
2. **Configurer les Paramètres**: Accédez au panneau de paramètres via l'icône d'engrenage pour la configuration d'API
3. **Démarrer une Conversation**: Entrez un message dans le champ de saisie et appuyez sur envoyer ou la touche Entrée
4. **Gérer les Sessions**: Utilisez le bouton nouveau chat pour créer des contextes de conversation frais

### Fonctionnalités Avancées
- **Navigation dans l'Historique**: Accédez aux conversations précédentes via le panneau d'historique
- **Changement de Contexte**: Chargez des conversations historiques pour une interaction continue
- **Nettoyage Sélectif**: Supprimez des conversations individuelles de l'archive d'historique
- **Adaptation de Thème**: Changement automatique de mode sombre/clair basé sur les préférences système

## Support de Localisation

### Langues Supportées
- Anglais
- Chinois
- Espagnol
- Français
- Japonais
- Russe

### Cadre de Traduction
- **Paquets de Messages**: Catalogues de messages i18n basés sur JSON
- **Localisation Dynamique**: Détection et changement de langue au runtime
- **Mécanisme de Fallback**: Dégradation gracieuse vers la langue par défaut

## Compatibilité du Navigateur

### Plateformes Supportées
- **Google Chrome**: Version 114+ avec support de Manifest V3
- **Microsoft Edge**: Versions basées sur Chromium avec capacité de panneau latéral
- **Brave Browser**: Implémentations compatibles avec Manifest V3
- **Opera**: Versions avec moteur Chromium avec support d'extensions

### Exigences Système
- **Systèmes d'Exploitation**: Windows 10+, macOS 10.15+, distributions Linux avec GTK
- **Mémoire**: Minimum 4GB RAM recommandé pour des performances optimales
- **Stockage**: 50MB d'espace disque disponible pour l'extension et les données en cache

## Confidentialité et Gestion des Données

### Politique de Collecte de Données
- **Zéro Traçage**: Aucune surveillance du comportement utilisateur ou collecte d'analytiques
- **Traitement Local**: Toutes les données de conversation traitées dans le contexte du navigateur
- **Aucune Dépendance Externe**: Fonctionnalité autonome sans services tiers
- **Opérations Transparentes**: Flux de données clair avec mécanismes explicites de consentement utilisateur

### Gestion du Stockage
- **Persistance des Paramètres**: Stockage Sync Chrome pour configuration multi-appareils
- **Archivage des Conversations**: Stockage local avec politiques automatiques de rétention des données
- **Optimisation du Cache**: Utilisation efficace de la mémoire avec routines automatiques de nettoyage

## Feuille de Route de Développement

### Améliorations Planifiées
- **Support Multi-modèles**: Interaction simultanée avec multiples services IA
- **Fonctionnalité d'Exportation**: Sérialisation des données de conversation dans des formats standard
- **Prompting Avancé**: Capacités d'ingénierie de prompts basées sur des modèles
- **Intégration Vocale**: Fonctionnalité de reconnaissance vocale et de synthèse vocale

### Améliorations Techniques
- **Intégration WebAssembly**: Optimisation des performances pour le traitement côté client
- **Amélioration Progressive**: Fonctionnalité hors ligne avec mise en cache de service worker
- **Audit d'Accessibilité**: Vérification de conformité WCAG 2.1 AA
- **Surveillance des Performances**: Collecte de métriques en temps réel et optimisation

## Contribution

### Flux de Travail de Développement
1. Forkez le dépôt et créez une branche de fonctionnalité
2. Implémentez les changements suivant les standards de codage établis
3. Exécutez des tests complets sur toutes les plateformes supportées
4. Soumettez une pull request avec une documentation détaillée des changements

### Standards de Code
- **Syntaxe ES6+**: JavaScript moderne avec patterns async/await
- **Architecture CSS**: Méthodologie BEM avec theming de propriétés personnalisées
- **Pratiques de Sécurité**: Protocoles de validation d'entrée et d'encodage de sortie
- **Métriques de Performance**: Scores Lighthouse et conformité Core Web Vitals

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

## Support

Pour l'assistance technique et les demandes de fonctionnalités, veuillez soumettre des issues via le suivi d'issues du dépôt GitHub. Les contributions et retours de la communauté sont les bienvenus via les pull requests et discussions.