# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2025-04-15

### Added
- Background image added to the main radio screen.

### Changed
- Refactored layout logic to use `useWindowDimensions` for dynamic responsiveness.
- Implemented multiple breakpoints (`sm`, `md`) for more granular control.
- Constrained maximum width of album art and metadata block on larger screens.
- Prevented horizontal scrolling on web view.

## [3.0.0] - 2024-04-10

### Changed (Modifié)
- Refonte complète de l'interface utilisateur avec des principes de design brutaliste.
- Changement de nom de "tangerine_radio" à "SONIC DRIFT RADIO".
- Interface du lecteur simplifiée pour une meilleure expérience utilisateur.
- Conception responsive améliorée pour les petits écrans.
- Nouveau schéma de couleurs en noir et blanc.
- Mise à jour du design de la barre de navigation et des icônes.

### Removed (Supprimé)
- Curseur de contrôle du volume.
- Visualisation de forme d'onde.
- Superpositions de dégradés complexes.
- Éléments d'interface utilisateur superflus pour une interface plus propre.

### Fixed (Corrigé)
- Détection de l'état actif de la navigation pour les routes à onglets.
- Gestion de l'état de chargement et des messages d'erreur.
- Gestion des images de remplacement (placeholder).
- Configuration de la lecture audio en arrière-plan.

## [2.8.0] - 2024-04-06

### Changed
- Interface utilisateur : Masquage du header redondant sur l'écran Radio (mobile).
- Interface utilisateur : Masquage de la barre d'onglets sur la plateforme Web (remplacée par `<Slot />` pour afficher le contenu).

## [2.7.0] - 2024-04-06

### Changed
- Refactoring majeur de la gestion du lecteur radio.
- Consolidation de la logique de lecture et d'affichage des métadonnées AzuraCast pour les plateformes mobile et web (`app/(tabs)/radio.tsx` et `app/web/radio.tsx`).
- Mise à jour de la documentation technique pour refléter l'architecture AzuraCast.

### Removed
- Suppression du code obsolète lié à l'ancienne infrastructure Icecast/Liquidsoap.
- Suppression de l'ancien service `radioService.ts`.
- Suppression de l'ancien service `metadataService.ts` (WebSocket).
- Suppression de l'ancien service `trackService.ts`.
- Suppression de l'ancien composant `RadioPlayer.tsx`.
- Suppression de l'ancien serveur Node.js (`server/`).
- Suppression des constantes de configuration API et stream obsolètes.
- Suppression du hook `useMetadata`.

### Fixed
- Correction de l'incohérence de la logique radio entre les plateformes web et mobile.

## Roadmap

### [2.7.0] - Planned
- Récupération des métadonnées d'album depuis Liquidsoap
- Transmission des métadonnées d'album via l'endpoint /metadata
- Amélioration de l'affichage des informations d'album dans l'interface

## [2.6.0] - 2024-03-31

### Added
- Migration complète vers AzuraCast comme service de streaming
- Support des pochettes d'albums via l'API AzuraCast
- Intégration de l'endpoint nowplaying d'AzuraCast pour les métadonnées en temps réel
- Nouveau flux audio haute qualité via AzuraCast

### Changed
- Mise à jour de l'interface StreamMetadata pour inclure les pochettes d'albums
- Modification du composant Radio pour afficher les pochettes d'albums
- Optimisation de la récupération des métadonnées avec l'API AzuraCast
- Migration de l'URL du flux audio vers AzuraCast

### Technical
- Configuration de l'endpoint AzuraCast : http://51.75.200.205/api/nowplaying/tangerine_radio
- Mise à jour de l'URL du flux : http://51.75.200.205/listen/tangerine_radio/radio.mp3
- Amélioration de la gestion des métadonnées avec support des pochettes

## [2.5.0] - 2024-03-31

### Changed
- Simplification majeure de l'architecture de l'application
- Optimisation du service de gestion des pistes
- Focus sur les fonctionnalités essentielles de streaming radio

### Removed
- Suppression complète de l'intégration Discogs
- Nettoyage des composants et services non utilisés
- Retrait des fonctionnalités de gestion des métadonnées externes

## [2.4.1] - 2024-03-30

### Fixed
- Correction de l'architecture des fichiers pour maintenir la cohérence entre les versions web et mobile
- Restauration des fichiers de base essentiels dans le dossier /app
- Amélioration de la stabilité de l'application

### Technical
- Clarification de la structure du projet avec les composants de base dans /app
- Versions spécifiques dans /app/(tabs) pour mobile et /app/web pour la version web

## [2.3.0] - 2024-03-27

### Added
- Intégration du service de métadonnées Icecast
- Nouveau hook personnalisé `useIcecastMetadata` pour la gestion des métadonnées
- Service de métadonnées pour récupérer les informations des pistes en temps réel

### Changed
- Simplification de l'affichage des métadonnées (titre et artiste uniquement)
- Amélioration de la gestion des états de chargement
- Optimisation des performances avec mise en cache des métadonnées

### Removed
- Suppression de l'affichage du genre et du bitrate pour une meilleure expérience utilisateur

## [2.2.0] - 2024-03-29

### Added
- Configuration du serveur de streaming Icecast2
- Implémentation de Liquidsoap pour la gestion des playlists
- Nouveau point de montage pour le flux radio principal : `/stream.mp3`
- Système de gestion des fichiers audio avec permissions dédiées (groupe `radiogroup`)
- Page d'administration des pistes (/admin/tracks)
- Interface de gestion des pistes avec possibilité de suppression
- Service de tracks amélioré avec communication Telnet vers Liquidsoap

### Technical
- Icecast2 configuré sur le port `8000`
- Liquidsoap configuré pour lire les fichiers depuis `/var/liquidsoap/playlists/main`
- Permissions configurées pour permettre l'upload de fichiers via FTP
- Optimisation de la gestion des fichiers avec création du `radiogroup`

### Infrastructure
- Serveur de streaming déployé sur `51.75.200.205`
- Pare-feu configuré pour le port `8000`
- Mise en place des logs pour Icecast2 et Liquidsoap

### Fixed
- Correction des chemins d'importation dans les composants
- Amélioration de la récupération des pistes via Telnet

## [2.1.0] - 2024-03-26

### Ajouté
- Amélioration de l'intégration avec Mixcloud
- Nouveau design des cartes de mix avec une meilleure présentation des informations
- Affichage optimisé des tags et de la durée des mixes

### Modifié
- Refonte complète du composant MixCard pour une meilleure expérience utilisateur
- Optimisation du chargement des mixes depuis Mixcloud
- Amélioration de la gestion des erreurs lors du chargement des mixes

### Corrigé
- Correction des problèmes d'affichage des informations des mixes
- Amélioration de la stabilité lors du chargement des mixes
- Optimisation des performances de l'interface utilisateur

## [2.0.0] - 2024-03-25

### Ajouté
- Intégration avec l'API Mixcloud pour charger les DJ Sets directement depuis votre profil Mixcloud
- Affichage des informations détaillées des mixes (durée, tags, nombre d'écoutes)
- Possibilité d'ouvrir les mixes directement sur Mixcloud

### Modifié
- Refonte complète de l'interface utilisateur pour les DJ Sets
- Optimisation de l'expérience utilisateur sur web et mobile

### Supprimé
- Suppression de l'intégration avec Cloudinary
- Suppression du stockage local des DJ Sets (maintenant via Mixcloud)
- Suppression de la page LongMixs

## [1.1.1] - 2024-03-24

### Corrigé
- Correction des URLs de streaming pour "Mamene Break 2" et "Web Radio Mixes"
- Adaptation des points de montage aux noms réels sur le serveur Icecast (mamene2.mp3 et webradio.mp3)
- Amélioration de la fiabilité des connexions aux flux de streaming

## [1.1.0] - 2024-03-23

### Ajouté
- Intégration initiale avec TrackPlayer pour la lecture audio
- Support de la lecture en arrière-plan
- Interface utilisateur basique pour la webradio
- Nouvel onglet "Radio" permettant l'écoute de flux streaming en direct
- Service RadioService pour gérer la lecture des flux audio
- Composant RadioPlayer avec interface utilisateur pour la sélection et lecture des flux
- Affichage des informations détaillées pour chaque flux (artiste, genre, description)
- Sauvegarde du dernier flux écouté

### Technique
- Configuration d'expo-av pour la lecture audio en arrière-plan
- Mise en place des permissions nécessaires pour iOS et Android
- Gestion des états de lecture (chargement, lecture, pause, erreur)

## [1.0.0] - 2024-03-22

### Ajouté
- Interface utilisateur initiale avec deux onglets principaux : "Long Mixs" et "Settings"
- Écran des paramètres avec options de personnalisation
- Support pour l'écoute de mixs musicaux de longue durée
- Utilisation des Material Icons pour améliorer l'interface
- Déploiement web via EAS Hosting

### Technique
- Configuration du projet avec Expo et Expo Router
- Mise en place du déploiement avec EAS
- Publication du code source sur GitHub

## [0.2.0] - 2023-11-27

### Ajouts
- Implémentation d'un mécanisme de préchargement pour les DJ sets
- Intégration de TrackPlayer pour une meilleure gestion de l'audio
- Ajout d'une interface de progression pour le préchargement
- Support avancé pour les plateformes web et mobile

### Modifications
- Optimisation des paramètres de buffer pour TrackPlayer
- Configuration du serveur Icecast avec un burst-size augmenté (maintenant à 65535)
- Mise en œuvre du cache-busting pour éviter les problèmes de mise en cache
- Amélioration de la gestion des états audio (chargement, lecture, mise en tampon)

### Corrections
- Résolution partielle du problème de lecture depuis le début pour les DJ sets
- Amélioration de la fiabilité du streaming sur différentes plateformes
- Gestion améliorée des erreurs de lecture

## [0.1.0] - Version initiale

### Fonctionnalités
- Application React Native pour la lecture de flux radio web
- Support pour différents streams (webradio et DJ sets)
- Interface utilisateur de base pour la sélection et la lecture des flux
- Support multiplateforme (web, iOS, Android)

## [1.1.0] - 2024-03-29

### Added
- Admin tracks page for managing radio tracks
- Track service for handling API calls
- Configuration file for API endpoints
- Integration with Liquidsoap telnet server

### Changed
- Updated project structure with services directory
- Improved error handling for API calls

## [2.4.0] - 2024-03-30

### Removed
- Removed Discogs integration and all related components
- Cleaned up environment variables and type definitions related to Discogs

### Changed
- Simplified metadata handling to use only Icecast/Liquidsoap metadata
