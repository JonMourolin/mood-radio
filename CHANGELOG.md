# Changelog - Web Radio Mobile App

## [Unreleased] - Prochaine version

### Prochaines étapes prévues
- Augmenter davantage la taille du burst dans Icecast (tester 512K ou 1MB)
- Explorer les options avec Liquidsoap pour une meilleure gestion des fichiers statiques
- Convertir les MP3 en format HLS (m3u8) pour un streaming optimisé
- Améliorer l'interface utilisateur pour afficher la progression du préchargement

## [0.2.0] - Date : 2023-11-27

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

### Technique
- Mise à jour des dépendances pour supporter les fonctionnalités avancées d'audio
- Intégration de Shaka Player pour le web
- Refactorisation du service audio pour une meilleure modularité

## [0.1.0] - Version initiale

### Fonctionnalités
- Application React Native pour la lecture de flux radio web
- Support pour différents streams (webradio et DJ sets)
- Interface utilisateur de base pour la sélection et la lecture des flux
- Support multiplateforme (web, iOS, Android)

# Changelog

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-03-24

### Corrigé
- Correction des URLs de streaming pour "Mamene Break 2" et "Web Radio Mixes"
- Adaptation des points de montage aux noms réels sur le serveur Icecast (mamene2.mp3 et webradio.mp3)
- Amélioration de la fiabilité des connexions aux flux de streaming

## [1.1.0] - 2024-07-16

### Ajouté
- Nouvel onglet "Radio" permettant l'écoute de flux streaming en direct
- Service RadioService pour gérer la lecture des flux audio
- Composant RadioPlayer avec interface utilisateur pour la sélection et lecture des flux
- Support de lecture audio en arrière-plan sur iOS et Android
- Affichage des informations détaillées pour chaque flux (artiste, genre, description)
- Sauvegarde du dernier flux écouté

### Technique
- Configuration d'expo-av pour la lecture audio en arrière-plan
- Mise en place des permissions nécessaires pour iOS et Android
- Gestion des états de lecture (chargement, lecture, pause, erreur)

## [1.0.0] - 2024-03-23

### Ajouté
- Interface utilisateur initiale avec deux onglets principaux : "Long Mixs" et "Settings"
- Écran des paramètres avec options de personnalisation
- Support pour l'écoute de mixs musicaux de longue durée
- Utilisation des Material Icons pour améliorer l'interface
- Déploiement web via EAS Hosting

### Modifié
- Simplification de la navigation en gardant uniquement deux onglets
- Redirection automatique vers l'onglet "Long Mixs" à l'ouverture de l'application

### Supprimé
- Onglets inutilisés (Live, Explore, Index)

### Technique
- Configuration du projet avec Expo et Expo Router
- Mise en place du déploiement avec EAS
- Publication du code source sur GitHub 