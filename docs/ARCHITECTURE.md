# Architecture & Fichiers de Configuration

Ce document explique le rôle des principaux fichiers et dossiers de configuration à la racine du projet.

---

### `package.json`
**Rôle :** Carte d'identité du projet.
Il liste toutes les librairies externes (dépendances) nécessaires pour que le projet fonctionne et pour le développer. Il contient aussi des scripts pour lancer des commandes courantes (comme `npm start`). C'est le premier fichier lu quand on installe le projet.

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

### `services/mixcloudService.ts`
**Rôle :** Ambassadeur auprès de l'API Mixcloud.
Ce fichier isole toute la logique de communication avec le service externe Mixcloud. Il est responsable de récupérer les données, de les nettoyer et de les formater pour le reste de l'application. Cela rend le code plus modulaire et facile à maintenir si l'API externe change.

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
Ce dossier contient les "Contextes" React. Un Contexte est un mécanisme pour rendre des données et fonctions disponibles dans toute l'application sans avoir à les passer manuellement de composant en composant. C'est ici que réside l'état partagé. Par exemple, `PlayerContext.tsx` est le "cerveau" du lecteur audio : il gère l'état (quelle radio joue, si elle est en pause) et expose les commandes (`playStream`).

**Relation avec les Hooks :**
La distinction est clé : le **Hook** est l'**outil**, le **Context** est le **tuyau**.
- On utilise des **Hooks** (comme `useState`, `useEffect`) pour construire la logique et mémoriser l'état.
- On place cet état dans un **Provider** de Context (le **tuyau**) pour le rendre accessible partout.
- On utilise le hook **`useContext`** (un autre **outil**) pour se brancher au tuyau depuis n'importe quel composant et y lire les données.

---

### `ios/` et `android/`
**Rôle :** Artefacts de build natif local.
Ces dossiers contiennent les projets natifs (Xcode pour iOS, Android Studio pour Android) qui sont générés automatiquement lorsque l'on lance des commandes comme `npx expo run:ios` ou `npx expo run:android`. Ils sont créés à partir de la configuration définie dans `app.json` et ne sont pas destinés à être modifiés manuellement dans un workflow Expo "managé". Comme indiqué dans `.gitignore`, ils sont ignorés par Git et peuvent être supprimés sans risque, car ils seront recréés à la prochaine exécution.

---

### `components/`
**Rôle :** Boîte à outils de "briques" d'interface réutilisables.
Ce dossier est la "boîte de Lego" du projet. Il contient des composants React indépendants qui sont assemblés pour construire les écrans.

- **Composants fondamentaux :**
  - `ThemedText.tsx` et `ThemedView.tsx` : La base du système de design, ils appliquent automatiquement les bonnes couleurs de texte et de fond en fonction du thème (clair/sombre).
  - `MiniPlayer.tsx` : Le lecteur audio qui apparaît en bas de l'écran.

- **Sous-dossiers :**
  - `ui/` : Contient des composants d'interface de bas niveau, souvent avec des implémentations spécifiques à une plateforme (ex: `IconSymbol.ios.tsx` pour les icônes natives d'Apple).
  - `__tests__/` : Contient les fichiers de test pour s'assurer que les composants fonctionnent correctement.

---

### `assets/`
**Rôle :** Ressources statiques **intégrées** à l'application native (iOS/Android).
Ce dossier contient les images, polices, et vidéos qui sont packagées directement dans l'application mobile. Pour les plateformes natives, les assets de ce dossier sont chargés via `require()`, ce qui garantit leur disponibilité immédiate et hors ligne.

**Important :** Pour la version Web, afin d'optimiser les temps de chargement, les assets lourds (images des tuiles, vidéos) ne sont pas chargés depuis ce dossier mais depuis le dossier `public/`.

---

### `public/`
**Rôle :** Ressources statiques **servies** à l'application Web.
Ce dossier a été ajouté pour optimiser radicalement les performances de la version Web. Tout fichier placé ici (images, vidéos, etc.) est rendu accessible via une URL simple, comme sur un site web traditionnel.
Le navigateur peut ainsi télécharger ces ressources de manière asynchrone, sans qu'elles soient intégrées dans le fichier JavaScript principal de l'application. Cela réduit drastiquement la taille du bundle initial et élimine l'écran blanc au premier chargement.

---

### `app/`
**Rôle :** Cœur du routage et des écrans de l'application.
Ce dossier est géré par **Expo Router** et sa structure de fichiers définit les URL de l'application. Il contient les écrans finaux, qui assemblent les briques du dossier `components/`.

- **Stratégie de chargement des assets :**
  Pour optimiser les performances sur chaque plateforme, l'application utilise une stratégie de chargement conditionnelle.
  - **Natif (iOS/Android) :** Utilise `require()` pour charger les médias depuis `assets/`, les intégrant directement pour un accès rapide.
  - **Web :** Utilise des chemins d'URL simples (ex: `/images/moods/poolside.jpg`) qui pointent vers les fichiers du dossier `public/`.
  Cette logique est isolée dans la définition des données (ex: `app/moods.tsx`) pour garder le code des composants propre et agnostique à la plateforme.

- **Fichiers de layout (les "poupées russes") :**
  - `_layout.tsx` : La **coquille principale** (la plus grande poupée). Il gère le splash screen, enveloppe toute l'application dans le `PlayerProvider` pour rendre le lecteur audio global, et définit la structure de navigation de base (`<Stack>`).
  - `(tabs)/_layout.tsx` : La **coquille des onglets** (la poupée du milieu). Ce layout est un enfant du layout racine et ne s'applique qu'aux applications natives (iOS/Android). Il construit la barre de navigation inférieure et configure les icônes et titres pour chaque onglet (`moods`, `mixcloud`, `settings`). Sur le web, il s'efface pour laisser la navigation du header prendre le relais.

- **Les écrans et les routes :**
  - `index.tsx` : Le "portier" de l'application. Il redirige l'utilisateur de la racine (`/`) vers le premier écran pertinent.
  - `moods.tsx`, `mixcloud.tsx`, `settings.tsx` : Les fichiers de contenu des écrans principaux.
  - `(tabs)/moods.tsx` : Un simple **"pointeur"** qui importe le vrai contenu depuis `app/moods.tsx` pour l'afficher dans l'onglet correspondant.
  - `(tabs)/mixcloud.tsx` : La version de l'écran Mixcloud **spécifique au natif**, qui utilise une `WebView` dans un modal.
  - `FullScreenPlayer.tsx` : L'écran du lecteur en plein écran, utilisé **uniquement sur natif**.

- **Le sous-dossier `app/components/` :**
  - **Rôle :** Contient des composants spécifiques au **layout**, par opposition aux composants génériques du dossier `components/` racine.
  - **Exemple (`Navigation.tsx`) :** C'est l'en-tête de navigation du **site web**, "colocalisé" ici car il est fortement couplé à la structure de routage de `/app`. 