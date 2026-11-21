import {execute, compare, createDatabase} from './moteur.mjs';
import {exercises} from './cours.mjs';

const load = async path => {
  const response = await fetch(path);
  if (!response.ok) throw Error('Impossible de charger la base pédagogique.');
  return response.text();
};
const ready = Promise.all([
  self.initSqlJs({locateFile: file => './vendor/' + file}),
  load('./base.sql'), load('./variante.sql')
]).then(([SQL, base, variant]) => [createDatabase(SQL, base), createDatabase(SQL, base, variant)]);
self.onmessage = async ({data}) => {
  try {
    const [db, variant] = await ready;
    const start = performance.now();
    const result = execute(db, data.sql);
    const ms = performance.now() - start;
    let feedback = '';
    if (data.exerciseId) {
      const exercise = exercises.find(entry => entry.id === data.exerciseId);
      feedback = compare(result, execute(db, exercise.sql), exercise);
      if (!feedback && compare(execute(variant, data.sql), execute(variant, exercise.sql), exercise))
        feedback = 'Le résultat correspond sur la base du cours. Sur un jeu complémentaire, il diffère. Vérifiez notamment les bornes, les doublons et les égalités.';
    }
    self.postMessage({result, ms, feedback});
  } catch (error) {
    const message = error.message;
    const rules = [
      [/no such table/i, 'Table introuvable. Vérifiez son nom dans Explorer la base.'],
      [/no such column/i, 'Colonne introuvable. Vérifiez son nom et les alias utilisés.'],
      [/ambiguous column/i, 'Colonne ambiguë. Précisez la table ou son alias devant son nom.'],
      [/syntax error|incomplete input/i, 'Syntaxe SQL incorrecte. Vérifiez les virgules, les parenthèses et l’ordre des clauses.'],
      [/readonly|read-only/i, 'La base pédagogique est en lecture seule.']
    ];
    const translation = rules.find(([pattern]) => pattern.test(message));
    self.postMessage({error: translation ? translation[1] + ' (' + message + ')' : message});
  }
};
