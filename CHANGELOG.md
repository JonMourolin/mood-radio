# Changelog

Toutes les modifications notables apportées à ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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