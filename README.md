# Atelier SQL · BTS CG

Parcours étudiant de 16 chapitres et 64 exercices fondé sur le chapitre 10 « L’accès aux données, le langage SQL ». La base du cours contient 15 véhicules, 5 garages et 8 immatriculations. La variante de correction enrichit ce jeu sans modifier les données visibles dans l’explorateur.

## Démarrage local

Avec Python 3, lancer `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist` à la racine, puis ouvrir http://127.0.0.1:8080/. Le chargement du moteur WebAssembly et du Worker requiert un serveur HTTP. Tous les fichiers utiles sont inclus dans `dist/`. Exécuter d’abord `npm ci` pour installer les dépendances et copier les fichiers SQLite dans `dist/vendor/`. Le site publié ne dépend d’aucun CDN.

## Contrôles

- `npm test` lance les tests SQLite et de progression avec Node.js 22.
- `npm ci`, puis `npx playwright install chromium` et `npm run test:navigateur` exécutent le parcours de bout en bout sur Chromium en bureau et en émulation mobile.

## Fichiers et mises à jour

- `dist/base.sql` contient le schéma d’origine et les données de la page 4. Les codes postaux sont du texte. Les dates sont stockées au format ISO et présentées en français.
- `dist/variante.sql` ajoute des doublons de projection, des ex æquo, des dates frontières et des valeurs NULL pour la correction.
- `dist/cours.mjs` contient les leçons, énoncés, exemples et références. Chaque module occupe cinq lignes dans la chaîne source. La ligne du module contient titre, objectif, cours, exemple. Elle est suivie de quatre lignes titre, énoncé, SQL. Le séparateur est la barre verticale. En cas de changement d’identifiant, prévoir une migration de progression.
- `dist/moteur.mjs` compare les valeurs et les doublons. Il tient compte de l’ordre des lignes pour les exercices de tri et des intitulés explicitement demandés. L’évaluation sur deux jeux ne démontre pas une équivalence SQL générale.
- `dist/vendor/` contient la licence de sql.js. Les fichiers SQLite 1.14.1 y sont copiés par `npm ci`.

Les lectures s’exécutent dans un Worker et dans des bases SQLite en mémoire par onglet. La progression et les brouillons se trouvent dans le stockage local du navigateur. La limite de restitution est fixée à 1 000 lignes. Le Worker est interrompu après 3,5 secondes si la requête ne répond pas.

## Publication

Pour GitHub Pages, placer le contenu de l’archive à la racine d’un dépôt dédié avec `main` comme branche principale. Dans Settings → Pages, sélectionner GitHub Actions. Le workflow fourni vérifie le projet puis publie `dist/`. Pour une mise à jour, corriger les fichiers concernés, exécuter les tests et pousser sur `main`.

Tout hébergement statique HTTPS peut servir `dist/` directement. Conserver les types MIME JavaScript pour les fichiers .mjs et application/wasm pour le moteur.
