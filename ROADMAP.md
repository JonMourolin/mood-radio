# Roadmap - Web Radio Mobile

Ce document détaille les améliorations prévues et les objectifs de développement pour l'application Web Radio Mobile.

## Objectif principal

Optimiser la lecture des DJ sets pour qu'ils démarrent immédiatement depuis le début, sans délai ni buffering excessif.

## Étapes à court terme (Prioritaires)

### 1. Optimisation du serveur Icecast

- Augmenter la taille du burst dans Icecast:
  ```xml
  <burst-size>524288</burst-size> <!-- Augmenter à 512K -->
  ```
  ou
  ```xml
  <burst-size>1048576</burst-size> <!-- Tester avec 1MB -->
  ```

- Vérifier et optimiser les autres paramètres du serveur:
  ```xml
  <queue-size>524288</queue-size>
  ```

- Tester la configuration avec:
  ```
  ssh ubuntu@51.75.200.205 "sudo systemctl restart icecast2"
  ```

### 2. Amélioration du préchargement côté client

- Augmenter le temps de préchargement minimal avant de démarrer la lecture (actuellement 4000ms)
- Ajouter un mécanisme de détection de la vitesse de connexion pour ajuster le temps de préchargement
- Optimiser l'utilisation de TrackPlayer pour une meilleure gestion du buffering

### 3. Implémentation d'un composant d'interface pour le préchargement

- Créer un composant visuel pour le préchargement des DJ sets:
  ```jsx
  <DJSetPreloader 
    progress={status.preloadProgress} 
    isVisible={status.preloading} 
    trackTitle={currentStream?.title}
  />
  ```

- Ajouter des animations fluides pour améliorer l'expérience utilisateur pendant le chargement

## Étapes à moyen terme

### 1. Exploration du format HLS pour les DJ sets

- Convertir les fichiers MP3 existants au format HLS (.m3u8) avec FFmpeg:
  ```
  ffmpeg -i input.mp3 -c:a aac -b:a 192k -hls_time 10 -hls_playlist_type vod -hls_segment_filename "segment%03d.ts" playlist.m3u8
  ```

- Créer un script de conversion automatique pour les nouveaux fichiers
- Mettre à jour le service radio pour utiliser les flux HLS quand ils sont disponibles

### 2. Optimisation de Liquidsoap

- Rechercher et configurer les options avancées de Liquidsoap pour la gestion des fichiers statiques
- Explorer la possibilité d'utiliser des transcodes à la volée pour optimiser la diffusion

### 3. Mise en cache intelligente

- Implémenter un système de mise en cache côté client pour les DJ sets fréquemment écoutés
- Ajouter une gestion de cache adaptatif basée sur l'espace disponible sur l'appareil

## Étapes à long terme

### 1. Reconstruction complète du backend de streaming

- Évaluer des alternatives à Icecast pour le streaming (Wowza, Node.js avec flux HTTP)
- Mettre en place une architecture CDN pour la distribution des contenus audio

### 2. Implémentation d'un système de playlists avancé

- Permettre aux utilisateurs de créer et partager des playlists de DJ sets
- Ajouter des fonctionnalités de lecture en continu de plusieurs DJ sets

### 3. Analyses et métriques

- Implémenter des métriques détaillées sur les performances de lecture (temps de chargement initial, buffering, etc.)
- Créer un dashboard pour visualiser ces métriques et optimiser en continu

## Remarques techniques

Les solutions actuellement implémentées utilisent:
- TrackPlayer pour la gestion avancée de l'audio sur mobile et web
- Un mécanisme de préchargement simulé pour améliorer l'expérience utilisateur
- Une combinaison d'optimisations serveur (Icecast) et client

Toutes les solutions proposées visent à maintenir la compatibilité multiplateforme (web, iOS, Android) tout en optimisant l'expérience de streaming audio. 