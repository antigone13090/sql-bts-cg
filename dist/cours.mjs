const source = `
Les bases de données|Interroger un jeu de données avec SQL.|Un SGBD stocke et organise les données. SQL permet de les lire (LID), de modifier les lignes (LMD), de définir les structures (LDD) et de gérer les droits (LCD). Ici, on pratique la lecture avec SQLite. SQL signifie Structured Query Language. La première norme SQL date de 1986.|SELECT * FROM VEHICULE;
Consulter le catalogue|Affichez toutes les colonnes de VEHICULE.|SELECT * FROM VEHICULE
Consulter le réseau|Affichez toutes les colonnes de GARAGE.|SELECT * FROM GARAGE
Consulter les immatriculations|Affichez toutes les colonnes de PLAQUE.|SELECT * FROM PLAQUE
Prendre ses repères|Affichez uniquement la colonne Marque de GARAGE, doublons compris.|SELECT Marque FROM GARAGE
Le modèle relationnel|Repérer les clés et lire la structure des tables.|Une table regroupe des lignes et des colonnes. La clé primaire identifie une ligne. PLAQUE.CodeV est une clé étrangère qui référence VEHICULE.Code. Le champ Marque permet aussi de rapprocher garages et modèles. Ouvrez Explorer la base pour examiner les relations.|SELECT Immat, CodeV FROM PLAQUE;
Clé des modèles|Affichez les identifiants des lignes de VEHICULE.|SELECT Code FROM VEHICULE
Clé des garages|Affichez le code et le nom de chaque garage.|SELECT Code, Nom FROM GARAGE
Identifiant d’une immatriculation|Affichez uniquement les immatriculations.|SELECT Immat FROM PLAQUE
Clé étrangère|Affichez le nom du propriétaire, puis le code du modèle référencé par chaque immatriculation.|SELECT Nom, CodeV FROM PLAQUE
SELECT et FROM|Choisir les colonnes à afficher.|SELECT définit les colonnes projetées. FROM indique la table à interroger. L’astérisque demande toutes les colonnes. Séparez les colonnes par des virgules.|SELECT Type, Marque FROM VEHICULE;
Coordonnées|Affichez le nom et l’adresse de chaque garage.|SELECT Nom, Adresse FROM GARAGE
Fiche technique|Affichez le type puis la puissance de chaque modèle.|SELECT Type, Puissance FROM VEHICULE
Identité|Affichez le prénom puis le nom de chaque propriétaire.|SELECT Prenom, Nom FROM PLAQUE
Localisation|Affichez la ville puis le code postal de chaque garage, doublons compris.|SELECT Ville, Cpostal FROM GARAGE
DISTINCT|Éliminer les doublons du résultat.|DISTINCT s’applique à la combinaison complète des colonnes sélectionnées. Sans DISTINCT, deux lignes identiques dans le résultat restent visibles.|SELECT DISTINCT Ville FROM GARAGE;
Marques du catalogue|Affichez les marques de véhicules sans doublon.|SELECT DISTINCT Marque FROM VEHICULE
Villes des propriétaires|Affichez les villes de PLAQUE sans doublon.|SELECT DISTINCT Ville FROM PLAQUE
Puissances disponibles|Affichez les puissances différentes du catalogue.|SELECT DISTINCT Puissance FROM VEHICULE
Couples de colonnes|Affichez les couples distincts ville et code postal des garages.|SELECT DISTINCT Ville, Cpostal FROM GARAGE
WHERE|Filtrer les lignes par comparaison.|WHERE retient les lignes qui satisfont une condition. Les chaînes SQL s’écrivent entre apostrophes. Les comparateurs usuels sont =, <>, <, >, <= et >=.|SELECT Type FROM VEHICULE WHERE Marque = 'Renault';
Plus de 80 chevaux|Affichez le type et la marque des modèles dont la puissance dépasse strictement 80.|SELECT Type, Marque FROM VEHICULE WHERE Puissance > 80
Garages à Ailleurs|Affichez les noms des garages situés à Ailleurs.|SELECT Nom FROM GARAGE WHERE Ville = 'Ailleurs'
Petites puissances|Affichez les types des modèles de 50 chevaux au maximum.|SELECT Type FROM VEHICULE WHERE Puissance <= 50
Autres marques|Affichez le type des modèles dont la marque diffère de Toyota.|SELECT Type FROM VEHICULE WHERE Marque <> 'Toyota'
BETWEEN, IN, LIKE, NULL|Filtrer par intervalle, liste, motif ou absence de valeur.|BETWEEN inclut les deux bornes, IN compare à une liste, LIKE utilise % pour zéro ou plusieurs caractères et _ pour un caractère. Testez les valeurs manquantes avec IS NULL ou IS NOT NULL. Les dates sont stockées sous la forme AAAA-MM-JJ.|SELECT Type FROM VEHICULE WHERE Puissance IN (60, 80, 100);
Année 2004|Affichez le nom et le prénom des propriétaires des véhicules immatriculés en 2004.|SELECT Nom, Prenom FROM PLAQUE WHERE Date BETWEEN '2004-01-01' AND '2004-12-31'
Trois puissances|Affichez les types de modèles de 45, 80 ou 95 chevaux.|SELECT Type FROM VEHICULE WHERE Puissance IN (45, 80, 95)
Départements|Affichez les immatriculations dont le code postal commence par 5.|SELECT Immat FROM PLAQUE WHERE Cpostal LIKE '5%'
Adresse disponible|Affichez les noms des garages pour lesquels une adresse est renseignée.|SELECT Nom FROM GARAGE WHERE Adresse IS NOT NULL
AND et OR|Combiner les conditions et contrôler leur priorité.|AND exige que les deux conditions soient vraies. OR en exige au moins une. AND est prioritaire sur OR. Utilisez des parenthèses pour rendre l’intention explicite.|SELECT Type FROM VEHICULE WHERE Marque = 'Renault' AND Puissance >= 80;
Renault puissantes|Affichez les types des Renault d’au moins 80 chevaux.|SELECT Type FROM VEHICULE WHERE Marque = 'Renault' AND Puissance >= 80
Deux villes|Affichez les noms des propriétaires résidant à Nancy ou Albi.|SELECT Nom FROM PLAQUE WHERE Ville = 'Nancy' OR Ville = 'Albi'
Deux marques, un seuil|Affichez les types des Renault ou Peugeot strictement au-dessus de 80 chevaux.|SELECT Type FROM VEHICULE WHERE (Marque = 'Renault' OR Marque = 'Peugeot') AND Puissance > 80
Hors plage|Affichez type et puissance des modèles strictement sous 50 ou strictement au-dessus de 100 chevaux.|SELECT Type, Puissance FROM VEHICULE WHERE Puissance < 50 OR Puissance > 100
Notation pointée et jointures|Relier deux tables et lever les ambiguïtés.|Table.Colonne indique d’où vient une colonne. JOIN … ON associe les lignes satisfaisant la condition de jointure. Une même marque peut correspondre à plusieurs garages et modèles.|SELECT VEHICULE.Type, GARAGE.Nom FROM VEHICULE JOIN GARAGE ON VEHICULE.Marque = GARAGE.Marque;
Immatriculation et modèle|Pour chaque immatriculation, affichez la plaque puis le type du modèle.|SELECT PLAQUE.Immat, VEHICULE.Type FROM PLAQUE JOIN VEHICULE ON PLAQUE.CodeV = VEHICULE.Code
Catalogue des garages|Pour chaque couple garage–modèle de même marque, affichez le nom du garage puis le type du modèle.|SELECT GARAGE.Nom, VEHICULE.Type FROM GARAGE JOIN VEHICULE ON GARAGE.Marque = VEHICULE.Marque
Garages pour l’Espace|Affichez les noms des garages de la même marque que les modèles dont le type est Espace.|SELECT GARAGE.Nom FROM GARAGE JOIN VEHICULE ON GARAGE.Marque = VEHICULE.Marque WHERE VEHICULE.Type = 'Espace'
Même ville|Associez chaque propriétaire aux garages situés dans sa ville. Affichez le nom du propriétaire puis celui du garage.|SELECT PLAQUE.Nom, GARAGE.Nom FROM PLAQUE JOIN GARAGE ON PLAQUE.Ville = GARAGE.Ville
Jointures multiples|Relier les trois tables à l’aide d’un chemin de jointure.|Pour passer d’une immatriculation à un garage spécialisé, liez CodeV à Code, puis les deux champs Marque. Une jointure sans condition produit un produit cartésien.|SELECT PLAQUE.Immat, VEHICULE.Type, GARAGE.Nom FROM PLAQUE JOIN VEHICULE ON PLAQUE.CodeV = VEHICULE.Code JOIN GARAGE ON VEHICULE.Marque = GARAGE.Marque;
Chaîne complète|Pour chaque couple immatriculation–garage de même marque, affichez plaque, type du modèle et nom du garage.|SELECT p.Immat, v.Type, g.Nom FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code JOIN GARAGE g ON v.Marque = g.Marque
Garages à Ailleurs|Pour les propriétaires ayant un garage compatible à Ailleurs, affichez le nom du propriétaire et le nom du garage pour chaque couple.|SELECT p.Nom, g.Nom FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code JOIN GARAGE g ON v.Marque = g.Marque WHERE g.Ville = 'Ailleurs'
Garages Renault et véhicules vendus|Pour les Renault immatriculées, affichez la plaque et la ville de chaque garage compatible.|SELECT p.Immat, g.Ville FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code JOIN GARAGE g ON v.Marque = g.Marque WHERE v.Marque = 'Renault'
Modèles puissants à Ailleurs|Affichez nom et prénom des propriétaires de véhicules d’au moins 100 chevaux ayant un garage compatible à Ailleurs. Éliminez les doublons du résultat.|SELECT DISTINCT p.Nom, p.Prenom FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code JOIN GARAGE g ON v.Marque = g.Marque WHERE v.Puissance >= 100 AND g.Ville = 'Ailleurs'
Sous-requêtes|Utiliser le résultat d’un SELECT dans un autre SELECT.|Une sous-requête scalaire sert à obtenir une seule valeur, par exemple MAX(Puissance). Pour tester l’appartenance à un ensemble de résultats, utilisez IN ou EXISTS.|SELECT Type FROM VEHICULE WHERE Puissance = (SELECT MAX(Puissance) FROM VEHICULE);
Possesseurs de Renault|Affichez les noms et prénoms des propriétaires de Renault.|SELECT Nom, Prenom FROM PLAQUE WHERE CodeV IN (SELECT Code FROM VEHICULE WHERE Marque = 'Renault')
Au-dessus de la moyenne|Affichez les types des modèles plus puissants que la moyenne du catalogue.|SELECT Type FROM VEHICULE WHERE Puissance > (SELECT AVG(Puissance) FROM VEHICULE)
Record de puissance|Affichez les types et marques de tous les modèles qui atteignent la puissance maximale.|SELECT Type, Marque FROM VEHICULE WHERE Puissance = (SELECT MAX(Puissance) FROM VEHICULE)
Modèles sans immatriculation|Affichez les codes et types des modèles sans immatriculation.|SELECT Code, Type FROM VEHICULE WHERE Code NOT IN (SELECT CodeV FROM PLAQUE)
Fonctions d’agrégation|Résumer un ensemble de lignes avec un calcul.|COUNT(*) compte les lignes. COUNT(Colonne) ignore les valeurs NULL. SUM, AVG, MIN et MAX calculent respectivement la somme, la moyenne, le minimum et le maximum des valeurs non NULL.|SELECT COUNT(*), AVG(Puissance) FROM VEHICULE;
Combien de modèles ?|Affichez le nombre de modèles du catalogue.|SELECT COUNT(*) FROM VEHICULE
Moyenne Renault|Affichez la puissance moyenne des Renault.|SELECT AVG(Puissance) FROM VEHICULE WHERE Marque = 'Renault'
Les deux extrêmes|Affichez la puissance minimale puis la puissance maximale du catalogue.|SELECT MIN(Puissance), MAX(Puissance) FROM VEHICULE
Somme Peugeot|Affichez la somme des puissances des modèles Peugeot.|SELECT SUM(Puissance) FROM VEHICULE WHERE Marque = 'Peugeot'
GROUP BY et HAVING|Calculer par groupe et filtrer les groupes.|GROUP BY produit une ligne par groupe. WHERE filtre les lignes avant regroupement. HAVING filtre les groupes après agrégation. Sélectionnez les colonnes de regroupement et les agrégats utiles.|SELECT Marque, COUNT(*) FROM VEHICULE GROUP BY Marque;
Catalogue par marque|Affichez chaque marque, puis le nombre de modèles de cette marque.|SELECT Marque, COUNT(*) FROM VEHICULE GROUP BY Marque
Puissance par marque|Affichez chaque marque suivie de sa puissance moyenne.|SELECT Marque, AVG(Puissance) FROM VEHICULE GROUP BY Marque
Marques bien fournies|Affichez chaque marque ayant plus de deux modèles, suivie de son nombre de modèles.|SELECT Marque, COUNT(*) FROM VEHICULE GROUP BY Marque HAVING COUNT(*) > 2
Plusieurs plaques par ville|Affichez les villes de PLAQUE où l’on compte au moins deux immatriculations, suivies de leur nombre.|SELECT Ville, COUNT(*) FROM PLAQUE GROUP BY Ville HAVING COUNT(*) >= 2
ORDER BY|Trier les lignes avec des critères stables.|ORDER BY se place à la fin du SELECT. ASC trie dans le sens croissant, DESC dans le sens décroissant. Ajoutez un critère secondaire pour départager les égalités.|SELECT Code, Type, Puissance FROM VEHICULE ORDER BY Puissance DESC, Code ASC;
Classement des modèles|Affichez code, type et puissance par puissance décroissante, puis code croissant.|SELECT Code, Type, Puissance FROM VEHICULE ORDER BY Puissance DESC, Code ASC
Annuaire|Affichez code, nom et ville des garages, triés par ville, puis nom, puis code, tous croissants.|SELECT Code, Nom, Ville FROM GARAGE ORDER BY Ville, Nom, Code
Chronologie|Affichez plaque et date, par date croissante puis plaque croissante.|SELECT Immat, Date FROM PLAQUE ORDER BY Date, Immat
Tri mixte|Affichez code, marque, type et puissance. Triez par marque croissante, puissance décroissante puis code croissant.|SELECT Code, Marque, Type, Puissance FROM VEHICULE ORDER BY Marque, Puissance DESC, Code
Alias|Renommer des colonnes et raccourcir les références aux tables.|AS permet de donner un nom à une colonne du résultat. Un alias de table remplace le nom de la table dans les références de la requête, ce qui facilite la lecture des jointures.|SELECT g.Nom AS Garage, g.Ville AS Commune FROM GARAGE AS g;
Commune|Affichez les villes des garages, doublons compris, sous le nom Commune.|SELECT Ville AS Commune FROM GARAGE
Puissance moyenne|Affichez la marque puis la puissance moyenne, nommée Moyenne, par marque.|SELECT Marque, AVG(Puissance) AS Moyenne FROM VEHICULE GROUP BY Marque
Garages compatibles|Affichez les types et les noms des garages compatibles avec les colonnes Modele puis Garage. Essayez les alias de tables v et g.|SELECT v.Type AS Modele, g.Nom AS Garage FROM VEHICULE v JOIN GARAGE g ON v.Marque = g.Marque
Deux colonnes Nom|Pour chaque propriétaire et garage dans la même ville, affichez leurs noms sous les alias Proprietaire et Garage.|SELECT p.Nom AS Proprietaire, g.Nom AS Garage FROM PLAQUE p JOIN GARAGE g ON p.Ville = g.Ville
Fonctions et calculs|Transformer du texte, extraire une date et calculer une valeur.|SQLite utilise UPPER et LOWER, strftime pour les dates et l’opérateur de concaténation à deux barres verticales. Pour obtenir une division décimale, utilisez par exemple 10.0 comme diviseur. Les fonctions d’Access diffèrent.|SELECT Type, Puissance / 10.0 AS Divise FROM VEHICULE;
Noms en capitales|Affichez les noms des propriétaires en majuscules et leurs prénoms en minuscules.|SELECT UPPER(Nom), LOWER(Prenom) FROM PLAQUE
Année seule|Affichez plaque et année d’immatriculation sous forme de texte à quatre chiffres.|SELECT Immat, strftime('%Y', Date) FROM PLAQUE
Division décimale|Affichez type et puissance divisée par 10 avec ses décimales, pour tous les modèles.|SELECT Type, Puissance / 10.0 FROM VEHICULE
Nom complet|Affichez dans une seule colonne le prénom suivi d’un espace et du nom du propriétaire.|SELECT Prenom || ' ' || Nom FROM PLAQUE
Défis de synthèse|Combiner jointures, dates, agrégations et tris.|Déterminez d’abord ce que représente une ligne du résultat. Repérez ensuite les tables, le chemin de jointure, les conditions sur les lignes et les critères de regroupement et de tri.|SELECT v.Marque, COUNT(*) AS Immatriculations FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code GROUP BY v.Marque ORDER BY Immatriculations DESC, v.Marque;
Parc par marque|Affichez chaque marque immatriculée et son nombre d’immatriculations. Triez par nombre décroissant, puis marque croissante.|SELECT v.Marque, COUNT(*) FROM PLAQUE p JOIN VEHICULE v ON p.CodeV = v.Code GROUP BY v.Marque ORDER BY COUNT(*) DESC, v.Marque
Bilan 2005|Pour les marques avec des immatriculations en 2005, affichez marque puis nombre d’immatriculations cette année-là.|SELECT v.Marque, COUNT(*) FROM PLAQUE p JOIN VEHICULE v ON v.Code = p.CodeV WHERE p.Date >= '2005-01-01' AND p.Date < '2006-01-01' GROUP BY v.Marque
Garages sans modèle vendu|Affichez les noms des garages dont la marque n’a aucune immatriculation.|SELECT g.Nom FROM GARAGE g WHERE NOT EXISTS (SELECT 1 FROM PLAQUE p JOIN VEHICULE v ON v.Code = p.CodeV WHERE v.Marque = g.Marque)
Deux garages ou plus|Pour les marques présentes au catalogue et ayant au moins deux garages, affichez marque, nombre de garages et nombre de modèles. Une jointure multiplie les couples.|SELECT v.Marque, COUNT(DISTINCT g.Code), COUNT(DISTINCT v.Code) FROM VEHICULE v JOIN GARAGE g ON g.Marque = v.Marque GROUP BY v.Marque HAVING COUNT(DISTINCT g.Code) >= 2
`;

const keywords = ['FROM','FROM','SELECT','DISTINCT','WHERE','BETWEEN, IN, LIKE ou IS NOT NULL','AND et OR','JOIN … ON','JOIN … ON','SELECT dans SELECT','COUNT, AVG, MIN, MAX ou SUM','GROUP BY et HAVING','ORDER BY','AS','UPPER, LOWER, strftime, / ou ||','JOIN, GROUP BY ou NOT EXISTS'];
export const modules = [];
for (const [index, line] of source.trim().split('\n').entries()) {
  const position = index % 5;
  if (position === 0) {
    const [title, goal, lesson, example] = line.split('|');
    modules.push({title, goal, lesson, example, exercises: []});
  } else {
    const first = line.indexOf('|');
    const second = line.indexOf('|', first + 1);
    const title = line.slice(0, first);
    const prompt = line.slice(first + 1, second);
    const sql = line.slice(second + 1);
    const module = modules.at(-1);
    const ordered = modules.length === 13 || (modules.length === 16 && position === 1);
    const tables = ['VEHICULE','GARAGE','PLAQUE'].filter(table => new RegExp('\\b' + table + '\\b', 'i').test(sql));
    const aliases = modules.length === 14 ? [...sql.matchAll(/\bAS (\w+)/gi)].map(match => match[1]) : [];
    module.exercises.push({
      id: modules.length + '-' + position, title, prompt, sql: sql + ';', ordered, aliases, tables,
      level: modules.length < 6 ? 'Débutant' : modules.length < 13 ? 'Intermédiaire' : 'Avancé',
      goal: module.goal,
      hint: 'Repérez les colonnes demandées dans ' + tables.join(', ') + ' et ce que doit représenter une ligne du résultat.',
      clause: 'Clause ou expression à essayer : ' + keywords[modules.length - 1] + '.',
      explanation: module.lesson + ' Dans cette solution, ' + (ordered
        ? 'le résultat est trié selon tous les critères de l’énoncé.'
        : aliases.length ? 'AS attribue les noms demandés aux colonnes du résultat.'
        : 'les colonnes et l’ordre de projection suivent l’énoncé.')
    });
  }
}
export const exercises = modules.flatMap(module => module.exercises);
