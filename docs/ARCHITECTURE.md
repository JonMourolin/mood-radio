# Architecture & Fichiers de Configuration

Ce document explique le rôle des principaux fichiers et dossiers de configuration à la racine du projet.

---

### `api/`
**Rôle :** Backend de l'application (fonctions Serverless).
Ce dossier, qui n'existe que pour Vercel, contient notre logique backend sous forme de fonctions "serverless". Chaque fichier TypeScript dans ce dossier devient un point d'API interrogeable.
- **`getTrackInfo.ts`**: C'est le cœur de notre fonctionnalité "Discovery". Cette fonction reçoit un nom d'artiste et de morceau, interroge l'API d'OpenAI pour générer une description, et utilise **Vercel KV** (une base de données clé-valeur) comme cache pour stocker les descriptions pendant 30 jours, évitant ainsi des appels répétés et coûteux.

---

### `package.json`
**Rôle :** Carte d'identité du projet.
Il liste toutes les librairies externes (dépendances) nécessaires pour que le projet fonctionne et pour le développer. Il contient aussi des scripts pour lancer des commandes courantes (comme `npm start`).
La clé `"main"` est particulièrement importante : elle définit le tout premier fichier JavaScript à exécuter au lancement de l'application. Pour intégrer le lecteur audio en arrière-plan, nous l'avons pointée vers `index.js`.

---

### `index.js`
**Rôle :** Point d'entrée principal de l'application.
Ce fichier est le premier code exécuté. Il a deux responsabilités critiques :
1.  **Enregistrer le service de lecture :** Il appelle `TrackPlayer.registerPlaybackService()` pour initialiser le service d'écoute en arrière-plan, ce qui permet à l'application de répondre aux contrôles de l'écran de verrouillage même quand elle est fermée.
2.  **Lancer l'interface utilisateur :** Il importe `'expo-router/entry'` pour ensuite passer la main à Expo Router, qui gère le reste de l'application et l'affichage des écrans.

---

### `package-lock.json`
**Rôle :** Garant de la stabilité.
Ce fichier est un "ticket de caisse" détaillé qui verrouille la version exacte de *chaque* dépendance (et sous-dépendance). Il assure que chaque installation du projet (`npm install`) est rigoureusement identique, peu importe quand ou par qui elle est faite, évitant ainsi les bugs du type "ça marche sur ma machine". Il ne doit jamais être modifié à la main.

---

### `app.json`
**Rôle :** Configuration principale de l'application Expo.
C'est ici que l'on définit les métadonnées de l'application : son nom, son icône, son splash screen (écran de démarrage), les permissions natives requises (accès au micro, etc.), et d'autres configurations spécifiques aux plateformes iOS, Android et Web.

---

### `eas.json`
**Rôle :** Configuration des builds natifs.
Ce fichier configure les services de "build" d'Expo (EAS Build). Il permet de définir différents profils (comme `development`, `preview`, `production`) pour construire les fichiers `.apk` (Android) et `.ipa` (iOS) qui seront soumis aux App Stores. Il est uniquement utilisé pour les builds natifs.

---

### `tsconfig.json`
**Rôle :** Chef d'orchestre de TypeScript.
Il définit les règles de "grammaire" pour le compilateur TypeScript. Il s'assure que le code est correctement typé, et configure des alias de chemins (comme `@/*`) pour simplifier les imports de fichiers, rendant le code plus propre et plus robuste.

---

### `.eslintrc.js`
**Rôle :** Gardien du style de code.
Il configure ESLint, un outil qui analyse le code pour trouver des erreurs courantes et s'assurer que le style est cohérent partout (usage des guillemets, points-virgules, etc.). Cela rend le code plus lisible et facile à maintenir, surtout en équipe.

---

### `config.ts`
**Rôle :** Tableau de bord de la configuration de l'application.
Ce fichier centralise les variables de configuration utilisées par l'application pour interagir avec des services externes. On y trouve par exemple :
- Les URL de base des API (AzuraCast, Mixcloud).
- Les clés d'API ou identifiants.
- Les paramètres de comportement externe, comme l'intervalle de rafraîchissement des métadonnées.
Cela permet de modifier facilement ces valeurs sans avoir à chercher dans tout le code.

---

### `constants/`
**Rôle :** Valeurs fixes et non-controversées de l'application.
Ce dossier est le "garde-manger" de l'application. Il contient des valeurs qui ne changent jamais pendant l'exécution et qui ne dépendent pas de l'environnement (développement, production). On y trouve par exemple la palette de couleurs de l'application (`Colors.ts`).
*Exemples de constantes :* Le nombre d'éléments par page (`ITEMS_PER_PAGE = 10`), un code couleur (`PRIMARY_BLUE = '#007bff'`), une durée fixe (`ANIMATION_DURATION = 300`).

La distinction avec `config.ts` est importante : une **constante** est gravée dans le marbre de l'application, tandis qu'une donnée de **configuration** (comme une URL d'API) peut changer d'un environnement à l'autre.

---

### `services/`
**Rôle :** Ambassadeurs auprès des APIs externes et gestion des services d'arrière-plan.
Ce dossier isole toute la logique de communication avec les services externes.

- **`mixcloudService.ts`**: Récupère, nettoie et formate les données depuis l'API Mixcloud.
- **`WebPlayer.ts`**: Encapsule et contrôle la librairie `hls.js` pour le streaming audio sur le web. Il gère la lecture, la pause, et les événements du lecteur, offrant une interface simple au reste de l'application web.
- **`trackPlayerService.ts`**: Ce service est un **processus d'arrière-plan ("headless")** pour les plateformes natives (iOS/Android). Il s'enregistre au démarrage de l'application et écoute les événements "distants" envoyés par le système (écran de verrouillage, écouteurs, etc.). Lorsque l'utilisateur appuie sur "Play", ce service reçoit l'événement et le transmet au lecteur principal via `react-native-track-player`.

---

### `types/`
**Rôle :** Dossier des "plans" de données (les `interface` TypeScript).
Ce dossier est crucial pour la robustesse du code. Il est divisé en deux concepts :
- **`player.ts` :** Définit les **modèles de données internes** de l'application. Ce sont les structures de données que nos composants et nos services manipulent au quotidien (ex: `StreamData`, `StreamMetadata`). C'est la "langue" que parle notre application.
- **`api.ts` :** Définit les **contrats d'API externes**. Ces types décrivent la structure brute et exacte des données JSON reçues des serveurs (ex: `AzuraCastApiResponse`). Le code de l'application agit ensuite comme un "traducteur" qui convertit ces données brutes en nos modèles internes propres.

Cette séparation rend l'application résiliente aux changements d'API externes.

---

### `scripts/`
**Rôle :** Boîte à outils de développement.
Ce dossier contient des scripts utilitaires qui ne font pas partie de l'application elle-même, mais qui aident à l'automatiser ou à la gérer.

---

### `node_modules/`
**Rôle :** Bibliothèque locale du projet.
Ce dossier est généré automatiquement par `npm install`. Il contient le code source réel de toutes les dépendances listées dans `package.json` et `package-lock.json`. C'est un dossier très volumineux qui n'est jamais modifié manuellement et qui doit être ignoré par Git (via `.gitignore`), car il peut être entièrement reconstruit à partir des fichiers `package.json` et `package-lock.json`.

---

### `hooks/`
**Rôle :** Logique réutilisable pour les composants.
Ce dossier contient des "hooks" personnalisés qui encapsulent et partagent de la logique complexe à travers l'application. Par exemple, les hooks de ce dossier gèrent le système de thème (mode sombre/clair) en détectant le mode actif (`useColorScheme`) et en fournissant les couleurs appropriées aux composants (`useThemeColor`), assurant ainsi une apparence cohérente.

---

### `context/`
**Rôle :** Panneau de contrôle global et état partagé.
Ce dossier contient les "Contextes" React. Un Contexte est un mécanisme pour rendre des données et fonctions disponibles dans toute l'application sans avoir à les passer manuellement de composant en composant.

- **`PlayerContext`**: Le "cerveau" de l'application. Au-delà de la gestion du lecteur audio, il a été enrichi pour piloter la **modale de découverte** :
    - Il maintient l'état de la modale (visible/cachée, chargement, erreurs).
    - Il contient la fonction `openDiscoveryModal` qui interroge notre propre API (`/api/getTrackInfo`) pour récupérer les informations du morceau.
    - Il stocke les données reçues (`discoveryData`) pour les afficher dans la modale.

- **Séparation par plateforme** :
    - **`PlayerContext.native.tsx` :** Version pour iOS et Android, basée sur **`react-native-track-player`**.
    - **`PlayerContext.web.tsx` :** Version web, basée sur `hls.js` et la `MediaSession API`.

Grâce aux extensions `.native.tsx` et `.web.tsx`, Expo choisit automatiquement le bon fichier lors de la compilation.

---

### `ios/` et `android/`
**Rôle :** Artefacts de build natif local.
Ces dossiers contiennent les projets natifs (Xcode pour iOS, Android Studio pour Android) qui sont générés automatiquement lorsque l'on lance des commandes comme `npx expo run:ios` ou `npx expo run:android`. Ils sont créés à partir de la configuration définie dans `app.json` et ne sont pas destinés à être modifiés manuellement dans un workflow Expo "managé". Comme indiqué dans `.gitignore`, ils sont ignorés par Git et peuvent être supprimés sans risque, car ils seront recréés à la prochaine exécution.

---

### `components/`
**Rôle :** Boîte à outils de "briques" d'interface réutilisables.
Ce dossier est la "boîte de Lego" du projet. Il contient des composants React indépendants qui sont assemblés pour construire les écrans.

- **Composants fondamentaux :**
  - `ThemedText.tsx` et `ThemedView.tsx` : La base du système de design.
  - `MiniPlayer.native.tsx` et `MiniPlayer.web.tsx` : Le lecteur audio réduit.
  - **`DiscoveryModal.tsx`**: Un composant **global et réutilisable** qui affiche les informations détaillées d'un morceau. Il est conçu pour s'afficher par-dessus n'importe quel écran et est entièrement piloté par le `PlayerContext`.

- **Sous-dossiers :**
  - `ui/` : Contient des composants d'interface de bas niveau, souvent avec des implémentations spécifiques à une plateforme (ex: `IconSymbol.ios.tsx` pour les icônes natives d'Apple).
  - `__tests__/` : Contient les fichiers de test pour s'assurer que les composants fonctionnent correctement.

---

### `assets/`
**Rôle :** Ressources statiques **intégrées** à l'application native (iOS/Android).
Ce dossier contient les images, polices, et vidéos qui sont packagées directement dans l'application mobile. Pour les plateformes natives, les assets de ce dossier sont chargés via `require()`, ce qui garantit leur disponibilité immédiate et hors ligne.

**Important :** Pour la version Web, afin d'optimiser les temps de chargement, les assets lourds (images des tuiles) ne sont pas chargés depuis ce dossier mais depuis le dossier `public/`.

---

### `public/`
**Rôle :** Ressources statiques **servies** à l'application Web.
Ce dossier a été ajouté pour optimiser radicalement les performances de la version Web. Tout fichier placé ici (images, etc.) est rendu accessible via une URL simple, comme sur un site web traditionnel.
Le navigateur peut ainsi télécharger ces ressources de manière asynchrone, sans qu'elles soient intégrées dans le fichier JavaScript principal de l'application. Cela réduit drastiquement la taille du bundle initial.

---

### `app/`
**Rôle :** Cœur du routage et des écrans de l'application.
Ce dossier est géré par **Expo Router** et sa structure de fichiers définit les URL de l'application. Il contient les écrans finaux, qui assemblent les briques du dossier `components/`.

- **Stratégie de chargement des assets :**
  Pour optimiser les performances sur chaque plateforme, l'application utilise une stratégie de chargement conditionnelle.
  - **Natif (iOS/Android) :** Utilise `require()` pour charger les médias depuis `assets/`.
  - **Web :** Utilise des chemins d'URL simples (ex: `/images/moods/poolside.jpg`) qui pointent vers les fichiers du dossier `public/`.

- **Logique de la modale "Discovery" :**
  Contrairement à une navigation vers une nouvelle page, les boutons "Discovery" (dans `FullScreenPlayer.tsx` et `Footer.tsx`) appellent désormais la fonction `openDiscoveryModal` du `PlayerContext`. C'est le contexte qui se charge d'afficher le composant `DiscoveryModal.tsx` (rendu globalement dans `_layout.tsx`) par-dessus l'écran actuel.

- **Fichiers de layout (les "poupées russes") :**
  - `_layout.tsx` : La **coquille principale**. Il gère le splash screen et enveloppe toute l'application dans le `PlayerProvider` pour rendre le lecteur audio global.
  - `(tabs)/_layout.tsx` : La **coquille des onglets**. Ce layout ne s'applique qu'aux applications natives (iOS/Android). Il construit la barre de navigation inférieure pour les onglets (`Live` et `Mixcloud`).

- **Les écrans et les routes :**
  - `index.tsx` : Le "portier" de l'application. Il redirige l'utilisateur de la racine (`/`) vers le premier écran pertinent.
  - `live.tsx`, `mixcloud.tsx` : Les fichiers de contenu des écrans principaux.
  - `(tabs)/live.tsx` et `(tabs)/mixcloud.tsx` : Simples **"pointeurs"** qui importent le vrai contenu depuis les fichiers racines correspondants pour les afficher dans les onglets natifs.
  - `FullScreenPlayer.tsx` : L'écran du lecteur en plein écran, utilisé **uniquement sur natif**. 