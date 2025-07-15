# Release Process

Ce document décrit le processus complet de développement et de déploiement pour le projet mood-radio.

## Table des matières

1. [Workflow de développement](#workflow-de-développement)
2. [Processus de release](#processus-de-release)
3. [Déploiement en production](#déploiement-en-production)
4. [Commandes de référence](#commandes-de-référence)
5. [Checklist de release](#checklist-de-release)

## Workflow de développement

### 1. Création d'une branche de fonctionnalité

```bash
# Partir de main à jour
git checkout main
git pull origin main

# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalité
```

### 2. Développement

- Effectuer les modifications nécessaires
- Tester localement avec `npm start` ou `expo start --web`
- Commit réguliers avec des messages descriptifs

```bash
git add .
git commit -m "feat: description de la fonctionnalité"
```

### 3. Finalisation de la branche

```bash
# Pousser la branche
git push origin feature/nom-de-la-fonctionnalité

# Optionnel: Créer une pull request pour review
```

## Processus de release

### 1. Préparation de la release

#### a. Fusion vers main

```bash
# Retourner sur main
git checkout main
git pull origin main

# Fusionner la branche de fonctionnalité
git merge feature/nom-de-la-fonctionnalité

# Ou si via pull request, simplement pull après merge
git pull origin main
```

#### b. Mise à jour de la version

1. **Déterminer le type de version** selon [Semantic Versioning](https://semver.org/) :
   - `PATCH` (x.x.X) : Corrections de bugs
   - `MINOR` (x.X.x) : Nouvelles fonctionnalités compatibles
   - `MAJOR` (X.x.x) : Changements incompatibles

2. **Mettre à jour `package.json`** :
   ```json
   {
     "version": "X.Y.Z"
   }
   ```

3. **Mettre à jour `CHANGELOG.md`** :
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - Nouvelles fonctionnalités

   ### Changed
   - Modifications existantes

   ### Fixed
   - Corrections de bugs

   ### Removed
   - Fonctionnalités supprimées
   ```

#### c. Synchronisation des dépendances

```bash
# Synchroniser package-lock.json
npm install
```

### 2. Commit de release

```bash
# Ajouter tous les fichiers modifiés
git add .

# Commit avec message standardisé
git commit -m "release: bump version to X.Y.Z

- Description des principales fonctionnalités
- Corrections importantes
- Changements notables"

# Pousser vers le repository
git push origin main
```

### 3. Tagging (optionnel mais recommandé)

```bash
# Créer un tag pour la version
git tag -a vX.Y.Z -m "Release version X.Y.Z"

# Pousser le tag
git push origin vX.Y.Z
```

## Déploiement en production

### 1. Build de l'application web

```bash
# Construire l'application pour le web
npx expo export --platform web
```

### 2. Déploiement sur Vercel

```bash
# Déployer en production
vercel --prod
```

### 3. Vérification

1. **Tester les URLs principales** :
   - https://moodradio.fr
   - https://moodradio.fr/moods
   - https://moodradio.fr/settings

2. **Vérifier les fonctionnalités critiques** :
   - Lecture audio
   - Métadonnées en temps réel
   - Interface responsive
   - Footer et navigation

3. **Contrôler les logs** :
   - Console du navigateur (pas d'erreurs)
   - Vercel dashboard pour les métriques

## Commandes de référence

### Développement local

```bash
# Démarrer en mode développement
npm start

# Démarrer spécifiquement pour le web
expo start --web

# Lancer les tests
npm test

# Vérifier le linting
npm run lint
```

### Git

```bash
# Statut des fichiers
git status

# Historique des commits
git log --oneline

# Différences non commitées
git diff

# Annuler les modifications non commitées
git checkout -- .

# Créer et changer de branche
git checkout -b nouvelle-branche

# Supprimer une branche locale
git branch -d nom-branche

# Supprimer une branche distante
git push origin --delete nom-branche
```

### Vercel

```bash
# Voir les déploiements
vercel list

# Logs de déploiement
vercel logs

# Déploiement de preview
vercel

# Déploiement de production
vercel --prod

# Lier le projet local
vercel link
```

### Expo

```bash
# Vérifier la configuration
expo doctor

# Nettoyer le cache
expo start --clear

# Build pour différentes plateformes
expo export --platform web
expo export --platform ios
expo export --platform android
```

## Checklist de release

### Avant la release

- [ ] Toutes les fonctionnalités sont testées localement
- [ ] Les tests automatisés passent (si applicable)
- [ ] La documentation est à jour
- [ ] Les breaking changes sont documentés
- [ ] La branche est mergée dans main

### Pendant la release

- [ ] Version mise à jour dans `package.json`
- [ ] `CHANGELOG.md` mis à jour avec la nouvelle version
- [ ] `npm install` exécuté pour synchroniser package-lock.json
- [ ] Commit de release effectué avec message standardisé
- [ ] Push vers le repository principal
- [ ] Tag créé (optionnel)

### Déploiement

- [ ] `npx expo export --platform web` exécuté sans erreur
- [ ] `vercel --prod` déployé avec succès
- [ ] URLs principales testées et fonctionnelles
- [ ] Fonctionnalités critiques vérifiées
- [ ] Aucune erreur dans la console du navigateur

### Après la release

- [ ] Branche de fonctionnalité supprimée (si applicable)
- [ ] Équipe notifiée de la nouvelle version
- [ ] Métriques de déploiement surveillées
- [ ] Feedback utilisateur collecté (si applicable)

## Gestion des urgences

### Hotfix en production

```bash
# Créer une branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/description-du-fix

# Effectuer les corrections nécessaires
# Tester localement

# Commit et push
git add .
git commit -m "hotfix: description de la correction"
git push origin hotfix/description-du-fix

# Merger rapidement dans main
git checkout main
git merge hotfix/description-du-fix

# Bump version PATCH
# Mettre à jour CHANGELOG.md
# Déployer immédiatement
```

### Rollback

Si un problème critique est détecté en production :

```bash
# Identifier le dernier commit stable
git log --oneline

# Revenir au commit précédent
git revert HEAD

# Ou revenir à un commit spécifique
git revert <commit-hash>

# Déployer la correction
npx expo export --platform web
vercel --prod
```

## Notes importantes

- **Toujours tester localement** avant de déployer en production
- **Maintenir le CHANGELOG.md** à jour pour traçabilité
- **Utiliser des messages de commit descriptifs** suivant les conventions
- **Surveiller les métriques** après chaque déploiement
- **Garder les branches de fonctionnalité courtes** pour faciliter les merges
- **Communiquer les changements importants** à l'équipe

## Configuration spécifique au projet

### Domaines

- **Production** : https://moodradio.fr
- **Serveur audio** : https://radio.moodradio.fr
- **Vercel par défaut** : https://mood-radio.vercel.app

### Services externes

- **Vercel** : Hébergement et déploiement web
- **AzuraCast** : Serveur de streaming audio
- **OVH** : Gestion DNS du domaine
- **Let's Encrypt** : Certificats SSL

### Fichiers critiques

- `config.ts` : Configuration des URLs et services
- `app.json` : Configuration Expo
- `vercel.json` : Configuration de déploiement
- `package.json` : Dépendances et scripts 