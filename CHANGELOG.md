# Changelog - Web Radio Mobile App

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [2.2.0] - 2024-03-26

### Added
- Configuration du serveur de streaming Icecast2
- Implémentation de Liquidsoap pour la gestion des playlists
- Nouveau point de montage pour le flux radio principal : `/stream.mp3`
- Système de gestion des fichiers audio avec permissions dédiées (groupe `radiogroup`)

### Technical
- Icecast2 configuré sur le port `8000`
- Liquidsoap configuré pour lire les fichiers depuis `/var/liquidsoap/playlists/main`
- Permissions configurées pour permettre l'upload de fichiers via FTP
- Optimisation de la gestion des fichiers avec création du `radiogroup`

### Infrastructure
- Serveur de streaming déployé sur `51.75.200.205`
- Pare-feu configuré pour le port `8000`
- Mise en place des logs pour Icecast2 et Liquidsoap

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

## [2.2.1] - 2024-03-26

### Supprimé
- Suppression de la page longmixs.tsx pour simplifier la navigation

## [2.3.0] - 2024-03-26

### Ajouté
- Nouvelle interface utilisateur pour la page radio avec :
  - Visualisation des ondes audio en temps réel
  - Grande pochette d'album avec overlay d'informations
  - Contrôles de lecture améliorés (play/pause, volume)
  - Support des thèmes clair/sombre
  - Animations fluides

### Technique
- Intégration de expo-linear-gradient pour les effets visuels
- Amélioration de la gestion du son avec expo-av
- Optimisation des animations avec Animated API

## [2.4.0] - 2024-03-28

### Changed
- Mise à jour du design de la navigation
  - Nouveau format du titre "tangerine_radio" avec underscore orange
  - Déplacement des liens Radio et Mixes à côté du titre
- Amélioration du layout de la page Radio
  - Centrage vertical du player
  - Optimisation de l'espace d'affichage
  - Correction des marges et du padding
