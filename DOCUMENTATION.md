# Documentation Technique - Système Radio Web Mobile

## 1. Introduction

Ce document décrit l'architecture et l'état actuel du système de streaming audio et de gestion des métadonnées pour la Web Radio Mobile, suite à la migration vers AzuraCast.

## 2. Architecture Générale

Le système est maintenant simplifié et repose sur les composants suivants :

1.  **AzuraCast :** Plateforme de gestion radio tout-en-un hébergée sur `http://51.75.200.205`. Elle est responsable de :
    *   La gestion des médias (playlists, fichiers audio).
    *   L'encodage du flux audio.
    *   Le streaming du flux principal via l'URL : `http://51.75.200.205/listen/tangerine_radio/radio.mp3`.
    *   La fourniture des métadonnées de la piste en cours via une API REST : `http://51.75.200.205/api/nowplaying/tangerine_radio`.
    *   La fourniture des pochettes d'album associées aux pistes.
2.  **Application Client (Expo / React Native) :** L'application mobile/web qui permet à l'utilisateur d'écouter le flux radio et affiche les métadonnées (titre, artiste, album, pochette) de la piste en cours.

**Flux des Données :**
*   **Audio :** AzuraCast -> Client Expo (`expo-av`)
*   **Métadonnées & Pochette :** AzuraCast API -> Client Expo (fetch périodique)

## 3. Composant Client (Expo / React Native)

*   **Rôle :** Interface utilisateur, lecture audio, récupération et affichage des métadonnées.
*   **Fichiers Principaux (Radio) :**
    *   `app/(tabs)/radio.tsx`: Écran principal pour l'onglet radio sur mobile.
    *   `app/web/radio.tsx`: Écran principal pour la version web.
    *   Ces deux fichiers partagent la même logique de base.
*   **Lecture Audio :**
    *   Gérée directement dans les composants d'écran (`radio.tsx`) via `expo-av`.
    *   Le flux lu est : `http://51.75.200.205/listen/tangerine_radio/radio.mp3`.
*   **Gestion des Métadonnées :**
    *   Les métadonnées (titre, artiste, album, pochette) sont récupérées périodiquement (toutes les 5 secondes) en appelant l'API REST d'AzuraCast : `http://51.75.200.205/api/nowplaying/tangerine_radio`.
    *   La logique de récupération (`updateMetadata`) et de stockage dans l'état local (`currentTrack`) se trouve directement dans les composants d'écran (`radio.tsx`).
    *   L'interface `StreamMetadata` définit la structure attendue, incluant `artUrl` pour la pochette.
*   **Composants/Services Obsolètes (Supprimés) :**
    *   L'ancien `radioService.ts`.
    *   L'ancien `metadataService.ts` (basé sur WebSocket).
    *   L'ancien serveur Node.js (`server/`).
    *   L'ancien `trackService.ts`.
    *   L'ancien composant `RadioPlayer.tsx`.
    *   Les anciennes constantes de configuration liées à Icecast/Liquidsoap/serveur Node.js.

## 4. Intégration Mixcloud

*   L'application conserve une intégration avec Mixcloud pour afficher et potentiellement lire des DJ sets.
*   **Fichiers Principaux :**
    *   `services/mixcloudService.ts`: Logique d'appel à l'API Mixcloud.
    *   `app/mixcloud.tsx`, `app/(tabs)/mixcloud.tsx`, `app/web/mixcloud.tsx`: Écrans pour afficher les mixes.
*   Cette fonctionnalité est distincte du streaming radio en direct fourni par AzuraCast.

## 5. Recommandations / Prochaines Étapes

*   **Tests Approfondis :** Continuer les tests sur mobile et web pour assurer la stabilité et la cohérence après le refactoring.
*   **Gestion d'Erreurs :** Améliorer la gestion des erreurs lors de la récupération des métadonnées ou de la lecture audio.
*   **Indicateur de Chargement/Erreur :** Fournir un retour visuel à l'utilisateur lorsque les métadonnées ou le flux audio sont en cours de chargement ou en erreur.
*   **Optimisation Web :** Étudier et corriger les éventuels problèmes de compatibilité ou de performance spécifiques à la plateforme web (animations, composants natifs comme Slider).
*   **Qualité du Code :** Envisager l'utilisation de contexte React ou d'une bibliothèque de gestion d'état (Zustand, Redux Toolkit) pour gérer l'état du lecteur radio (état de lecture, métadonnées) si la logique devient plus complexe ou doit être partagée entre plusieurs composants.
