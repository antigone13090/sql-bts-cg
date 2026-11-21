import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import init from '../dist/vendor/sql-wasm.js';
import {modules, exercises} from '../dist/cours.mjs';
import {createDatabase, execute, compare} from '../dist/moteur.mjs';
import {empty, persist, restore, validate} from '../dist/progression.mjs';

const load = file => readFileSync(new URL('../dist/' + file, import.meta.url), 'utf8');
const SQL = await init();
const base = createDatabase(SQL, load('base.sql'));
const variant = createDatabase(SQL, load('base.sql'), load('variante.sql'));

test('28 enregistrements et intégrité référentielle', () => {
  for (const [table, count] of [['VEHICULE', 15], ['GARAGE', 5], ['PLAQUE', 8]])
    assert.deepEqual(execute(base, 'SELECT COUNT(*) FROM ' + table).rows, [[count]]);
  assert.deepEqual(base.exec('PRAGMA foreign_key_check'), []);
  assert.deepEqual(base.exec('PRAGMA foreign_key_list(PLAQUE)')[0].values[0].slice(2, 5), ['VEHICULE','CodeV','Code']);
  assert.equal(modules.length, 16);
  assert.equal(exercises.length, 64);
});
for (const [i, module] of modules.entries()) test('Exemple ' + (i + 1) + ' · ' + module.title, () => {
  assert.ok(execute(base, module.example).rows.length);
});
for (const exercise of exercises) test(exercise.id + ' · ' + exercise.title, () => {
  for (const db of [base, variant]) {
    const expected = execute(db, exercise.sql);
    assert.ok(expected.columns.length && expected.rows.length);
    assert.equal(compare(execute(db, '-- variante de présentation\n' + exercise.sql.toLowerCase().replace(/'[^']*'/g, (literal, offset) => exercise.sql.slice(offset, offset + literal.length))), expected, exercise), '');
  }
});
test('Résultats indépendants issus des données du cours', () => {
  assert.deepEqual(execute(base, 'SELECT Marque, COUNT(*), AVG(Puissance) FROM VEHICULE GROUP BY Marque ORDER BY Marque').rows, [
    ['Citroen',4,86.25],['Peugeot',5,85],['Renault',4,72.5],['Toyota',2,75]
  ]);
  assert.deepEqual(execute(base, "SELECT Nom FROM PLAQUE WHERE CodeV IN (SELECT Code FROM VEHICULE WHERE Marque='Renault') ORDER BY Nom").rows, [['Dupond'],['Lucien'],['Tournesol'],['Traban']]);
  assert.equal(execute(base, 'SELECT p.Immat, g.Nom FROM PLAQUE p JOIN VEHICULE v ON p.CodeV=v.Code JOIN GARAGE g ON v.Marque=g.Marque').rows.length, 12);
});
test('Équivalence, doublons, ordre, alias et valeurs accidentellement correctes', () => {
  const marks = exercises.find(e => e.id === '4-1');
  assert.equal(compare(execute(base, 'SELECT Marque FROM VEHICULE GROUP BY Marque ORDER BY Marque DESC'), execute(base, marks.sql), marks), '');
  assert.match(compare(execute(base, 'SELECT Marque FROM VEHICULE'), execute(base, marks.sql), marks), /Nombre de lignes/);
  const sort = exercises.find(e => e.id === '13-1');
  assert.match(compare(execute(base, 'SELECT Code, Type, Puissance FROM VEHICULE ORDER BY Puissance ASC, Code'), execute(base, sort.sql), sort), /tri/);
  const alias = exercises.find(e => e.id === '14-1');
  assert.match(compare(execute(base, 'SELECT Ville FROM GARAGE'), execute(base, alias.sql), alias), /Alias/);
  const address = exercises.find(e => e.id === '6-4');
  assert.equal(compare(execute(base, 'SELECT Nom FROM GARAGE'), execute(base, address.sql), address), '');
  assert.match(compare(execute(variant, 'SELECT Nom FROM GARAGE'), execute(variant, address.sql), address), /Nombre de lignes/);
});
test('Syntaxe, lecture seule, limites et commentaires', () => {
  assert.throws(() => execute(base, 'SELECT FROM'), /syntax/i);
  assert.throws(() => execute(base, 'DELETE FROM GARAGE'), /SELECT/);
  assert.throws(() => execute(base, 'SELECT 1; SELECT 2;'), /une seule/);
  assert.throws(() => execute(base, 'PRAGMA query_only=OFF;'), /SELECT/);
  assert.throws(() => execute(base, 'WITH x AS (SELECT 1) DELETE FROM GARAGE RETURNING *'), /readonly/i);
  assert.throws(() => execute(base, 'SELECT * FROM VEHICULE a, VEHICULE b, VEHICULE c'), /1 000/);
  assert.deepEqual(execute(base, "/* Note */ SELECT ';' AS Texte; -- reste").rows, [[';']]);
  assert.deepEqual(execute(base, "WITH x AS (SELECT 2) SELECT * FROM x").rows, [[2]]);
});
test('Sauvegarde et validation d’un transfert de progression', () => {
  const storage = new Map();
  storage.setItem = storage.set.bind(storage);
  storage.getItem = storage.get.bind(storage);
  const ids = exercises.map(e => e.id);
  const state = empty();
  state.last = '16-1';
  state.drafts['16-1'] = 'SELECT 1';
  state.attempts['16-1'] = 2;
  state.passed['16-1'] = true;
  state.saved.push('SELECT 2');
  assert.ok(persist(storage, state));
  assert.deepEqual(restore(storage, ids), state);
  assert.throws(() => validate({version: 2}, ids));
  assert.deepEqual(validate({...state, passed: {unknown: true}}, ids).passed, {});
});
