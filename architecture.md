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
Ce fichier centralise les variables de configuration utilisées par l'application elle-même, comme les URL d'API ou les noms d'utilisateur de services externes. Cela permet de modifier facilement ces valeurs sans avoir à chercher dans tout le code.

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

### `types/` (player.ts, env.d.ts)
**Rôle :** Dossier des "plans" de données.
Il contient les définitions de types (`interface`) qui décrivent la structure des objets manipulés dans l'application (ex: `StreamData` dans `player.ts`). Cela garantit que toutes les parties de l'application s'attendent à la même forme de données, ce qui prévient de nombreux bugs. `types/env.d.ts` sert spécifiquement à définir les types des variables d'environnement.

---

### `expo-env.d.ts`
**Rôle :** Dictionnaire pour TypeScript.
Ce fichier aide TypeScript à comprendre comment gérer les imports de fichiers qui ne sont pas du code, comme les images (`.png`, `.jpg`). Il dit à TypeScript de faire confiance aux définitions de types fournies par Expo pour ces fichiers, permettant une intégration fluide des assets.

---

### `scripts/`
**Rôle :** Boîte à outils de développement.
Ce dossier contient des scripts utilitaires (en JavaScript ou autre) qui ne font pas partie de l'application elle-même, mais qui aident à l'automatiser ou à la gérer. Ces scripts sont souvent lancés via les raccourcis définis dans la section `"scripts"` du `package.json`.

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