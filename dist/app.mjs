import {modules, exercises} from './cours.mjs';
import {empty, validate, restore, persist} from './progression.mjs';

const $ = id => document.getElementById(id);
const main = $('main');
const ids = exercises.map(e => e.id);
let storage;
try { storage = window.localStorage; } catch {}
let state = restore(storage, ids);
let activeWorker, timeout, rejectPending;
let routeGeneration = 0;
let explored = 'VEHICULE';

function store() {
  const ok = persist(storage, state);
  if ($('storage-status')) $('storage-status').textContent = ok ? '' : 'La sauvegarde du navigateur est indisponible. Exportez votre progression.';
}
function make(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function add(parent, tag, text, className) {
  const element = make(tag, text, className);
  parent.append(element);
  return element;
}
function button(parent, text, action) {
  const el = add(parent, 'button', text);
  el.type = 'button';
  el.addEventListener('click', action);
  return el;
}
function link(parent, label, href, selected) {
  const el = add(parent, 'a', label);
  el.href = href;
  if (selected) el.setAttribute('aria-current', 'page');
  return el;
}
const exerciseURL = id => '#exercice/' + id;
const chapterOf = id => Number(id.split('-')[0]) - 1;
function navigation(active) {
  $('total').textContent = Object.keys(state.passed).length + ' / ' + exercises.length;
  $('progress').max = exercises.length;
  $('progress').value = Object.keys(state.passed).length;
  const nav = $('modules');
  nav.replaceChildren();
  modules.forEach((module, index) => {
    const anchor = link(nav, '', exerciseURL(module.exercises[0].id), active && chapterOf(active) === index);
    add(anchor, 'span', String(index + 1).padStart(2, '0'), 'chapter-index');
    add(anchor, 'span', module.title);
    add(anchor, 'span', module.exercises.filter(e => state.passed[e.id]).length + '/4', 'module-count');
  });
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme').textContent = theme === 'sombre' ? 'Mode clair' : 'Mode sombre';
  $('theme').setAttribute('aria-pressed', String(theme === 'sombre'));
  try { storage.setItem('atelier-theme', theme); } catch {}
}
try { if (storage.getItem('atelier-theme') === 'sombre') setTheme('sombre'); } catch {}
$('theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'sombre' ? 'clair' : 'sombre');

function cancelPending() {
  clearTimeout(timeout);
  activeWorker?.terminate();
  activeWorker = undefined;
  rejectPending?.(Error('Exécution interrompue.'));
  rejectPending = undefined;
}

function query(sql, exerciseId) {
  if (rejectPending) cancelPending();
  activeWorker ??= new Worker('./worker.js');
  const worker = activeWorker;
  return new Promise((resolve, reject) => {
    rejectPending = reject;
    timeout = setTimeout(() => {
      rejectPending = undefined;
      cancelPending();
      reject(Error('Temps limite dépassé. Réduisez le nombre de lignes ou simplifiez la requête.'));
    }, 3500);
    function finish(result) {
      clearTimeout(timeout);
      rejectPending = undefined;
      if (result.error) reject(Error(result.error));
      else resolve(result);
    }
    worker.onmessage = ({data}) => finish(data);
    worker.onerror = () => {
      finish({error: 'Le moteur SQL a rencontré un problème. Relancez la requête.'});
      cancelPending();
    };
    worker.postMessage({sql, exerciseId});
  });
}
function table(container, result, label = 'Résultat SQL') {
  container.replaceChildren();
  if (!result.rows.length) {
    add(container, 'p', 'Aucune ligne ne correspond à la requête.', 'muted');
  }
  const scroll = add(container, 'div', undefined, 'table-wrap');
  scroll.tabIndex = 0;
  scroll.setAttribute('aria-label', label);
  const grid = add(scroll, 'table');
  const heading = add(add(grid, 'thead'), 'tr');
  result.columns.forEach(name => { add(heading, 'th', name).scope = 'col'; });
  const body = add(grid, 'tbody');
  result.rows.forEach(row => {
    const tr = add(body, 'tr');
    row.forEach(value => {
      const display = value === null ? 'NULL'
        : value instanceof Uint8Array ? '[' + value.length + ' octets]'
        : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('/') : String(value);
      const cell = add(tr, 'td', display);
      cell.title = display;
    });
  });
}
function intro(label, title, detail) {
  const box = add(main, 'header', undefined, 'intro');
  add(box, 'p', label, 'eyebrow');
  add(box, 'h1', title);
  if (detail) add(box, 'p', detail);
}
const tokens = /(--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|\b(?:SELECT|FROM|WHERE|AS|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|DISTINCT|JOIN|LEFT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|ASC|DESC|LIMIT|OFFSET|WITH|RECURSIVE|UNION|ALL|EXISTS|COUNT|SUM|AVG|MIN|MAX|UPPER|LOWER|CAST|strftime)\b)/gi;

function setupEditor(id) {
  const input = $('sql'), overlay = $('highlight'), lines = $('lines');
  input.wrap = 'off';
  function scroll() {
    overlay.scrollTop = input.scrollTop;
    overlay.scrollLeft = input.scrollLeft;
    lines.scrollTop = input.scrollTop;
  }
  function paint() {
    overlay.replaceChildren();
    const sql = input.value;
    let cursor = 0;
    for (const match of sql.matchAll(tokens)) {
      overlay.append(sql.slice(cursor, match.index));
      const token = match[0];
      add(overlay, 'span', token, token.startsWith("'") ? 'str' : /^(--|\/\*)/.test(token) ? 'comment' : 'kw');
      cursor = match.index + token.length;
    }
    overlay.append(sql.slice(cursor) + '\n');
    lines.textContent = sql.split('\n').map((_, i) => i + 1).join('\n') + '\n';
    scroll();
  }
  function set(value) {
    input.value = value;
    state.drafts[id] = value;
    store();
    paint();
  }
  input.value = state.drafts[id] ?? '';
  input.addEventListener('input', () => set(input.value));
  input.addEventListener('scroll', scroll);
  input.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      $('run').click();
    }
  });
  paint();
  return {input, set};
}

function renderBench(exercise) {
  const key = exercise?.id ?? 'libre';
  const generation = routeGeneration;
  const workspace = add(main, 'div', undefined, 'workspace');
  const left = add(workspace, 'div'), right = add(workspace, 'div');
  const bench = $('workbench').content.cloneNode(true);
  for (const child of [...bench.children]) (child.classList.contains('results') ? right : left).append(child);
  const editor = setupEditor(key);
  const help = $('help');
  const feedback = $('feedback');
  const run = $('run');
  const verify = $('verify');
  const hint = $('hint');
  const reset = $('reset');
  verify.hidden = hint.hidden = !exercise;
  if (!exercise) editor.input.placeholder = 'Exemple : SELECT * FROM VEHICULE;';
  let hintLevel = 0;
  const setFeedback = (message, kind = '') => {
    feedback.className = kind;
    feedback.textContent = message;
  };
  async function execute(check) {
    run.disabled = verify.disabled = true;
    $('stats').textContent = '';
    $('output').replaceChildren();
    setFeedback('Requête en cours…');
    if (check) {
      state.attempts[key] = (state.attempts[key] ?? 0) + 1;
      store();
      updateAttempt();
    }
    try {
      const data = await query(editor.input.value, check ? key : undefined);
      if (generation !== routeGeneration) return;
      table($('output'), data.result);
      $('stats').textContent = data.result.rows.length + ' ligne(s) · ' + new Intl.NumberFormat('fr', {maximumFractionDigits: 1}).format(data.ms) + ' ms';
      if (!check) setFeedback('Requête exécutée.');
      else if (data.feedback) setFeedback(data.feedback, 'error');
      else {
        state.passed[key] = true;
        store();
        setFeedback('Réponse correcte. Exercice validé !', 'success');
        navigation(key);
        const tab = main.querySelector('.exercise-tabs [aria-current]');
        if (tab && !tab.textContent.endsWith(' ✓')) tab.textContent += ' ✓';
      }
    } catch (error) {
      if (generation === routeGeneration) setFeedback(error.message, 'error');
    } finally {
      if (generation === routeGeneration) run.disabled = verify.disabled = false;
    }
  }
  function updateAttempt() {
    if ($('attempts')) $('attempts').textContent = (state.attempts[key] ?? 0) + ' tentative(s)';
  }
  function showSolution() {
    help.hidden = false;
    help.replaceChildren();
    add(help, 'h2', 'Solution commentée');
    add(help, 'p', exercise.explanation);
    add(help, 'pre', exercise.sql, 'sample');
    button(help, 'Charger cette solution', () => { editor.set(exercise.sql); editor.input.focus(); });
  }
  run.onclick = () => execute(false);
  verify.onclick = () => execute(true);
  hint.onclick = () => {
    hintLevel = Math.min(2, hintLevel + 1);
    help.hidden = false;
    help.replaceChildren();
    add(help, 'h2', hintLevel === 1 ? 'Indice conceptuel' : 'Indice SQL');
    add(help, 'p', hintLevel === 1 ? exercise.hint : exercise.clause);
    if (hintLevel === 2) button(help, 'Afficher la solution', showSolution);
  };
  reset.onclick = () => {
    cancelPending();
    editor.set('');
    hintLevel = 0;
    help.hidden = true;
    $('output').replaceChildren();
    $('stats').textContent = '';
    setFeedback('Éditeur et session SQL réinitialisés.');
    editor.input.focus();
  };

  if (exercise) {
    const module = modules[chapterOf(key)];
    const lesson = add(left, 'details', undefined, 'card lesson');
    add(lesson, 'summary', 'Cours et exemple exécutable');
    add(lesson, 'p', module.lesson);
    add(lesson, 'pre', module.example, 'sample');
    button(lesson, 'Charger l’exemple', () => { editor.set(module.example); editor.input.focus(); execute(false); });
    const card = add(right, 'section', undefined, 'card');
    add(card, 'h2', 'Tables de l’exercice');
    const links = add(card, 'div', undefined, 'exercise-tabs');
    exercise.tables.forEach(name => link(links, name, '#base/' + name));
    const details = add(card, 'details', undefined, 'lesson');
    add(details, 'summary', 'Voir les premières lignes');
    const preview = add(details, 'div');
    details.addEventListener('toggle', async () => {
      if (!details.open || preview.childNodes.length || rejectPending) return;
      for (const name of exercise.tables) {
        if (generation !== routeGeneration) return;
        const box = add(preview, 'div');
        add(box, 'h2', name);
        try { table(add(box, 'div'), (await query('SELECT * FROM ' + name + ' LIMIT 5')).result, name); }
        catch (error) { if (generation === routeGeneration) add(box, 'p', error.message); return; }
      }
    });
    const meta = add(card, 'p', undefined, 'muted');
    meta.id = 'attempts';
    updateAttempt();
    button(card, 'Voir la correction', showSolution);
  } else {
    const card = add(right, 'section', undefined, 'card');
    add(card, 'h2', 'Bibliothèque de requêtes');
    const presets = add(card, 'div', undefined, 'presets');
    const examples = [['Débutant', modules[2].example], ['Intermédiaire', modules[8].example], ['Avancé', modules[15].example]];
    examples.forEach(([label, sql]) => button(presets, label, () => { editor.set(sql); editor.input.focus(); }));
    const library = add(card, 'section');
    function saved() {
      library.replaceChildren();
      add(library, 'h2', 'Mes requêtes');
      state.saved.forEach((sql, index) => {
        const row = add(library, 'div', undefined, 'presets');
        const load = button(row, (index + 1) + '. ' + sql.replace(/\s+/g, ' ').slice(0, 44), () => { editor.set(sql); editor.input.focus(); });
        load.title = sql;
        const del = button(row, 'Supprimer', () => { state.saved.splice(index, 1); store(); saved(); });
        del.setAttribute('aria-label', 'Supprimer la requête ' + (index + 1));
      });
    }
    button(card, 'Enregistrer la requête', () => {
      const value = editor.input.value.trim();
      if (!value) return setFeedback('Saisissez d’abord une requête.', 'error');
      state.saved = [value, ...state.saved.filter(sql => sql !== value)].slice(0, 20);
      store();
      saved();
      setFeedback('Requête enregistrée sur ce navigateur.');
    });
    link(card, ' Explorer le schéma', '#base');
    saved();
  }
}

function renderExercise(exercise) {
  const index = exercises.indexOf(exercise);
  const moduleIndex = chapterOf(exercise.id);
  const module = modules[moduleIndex];
  intro('Chapitre ' + (moduleIndex + 1) + ' sur ' + modules.length, module.title, module.goal);
  const tabs = add(main, 'nav', undefined, 'exercise-tabs');
  tabs.setAttribute('aria-label', 'Exercices du chapitre');
  module.exercises.forEach((entry, i) => link(tabs, 'Exercice ' + (i + 1) + (state.passed[entry.id] ? ' ✓' : ''), exerciseURL(entry.id), entry === exercise));
  const assignment = add(main, 'section', undefined, 'card');
  add(assignment, 'p', exercise.level + (state.passed[exercise.id] ? ' · Réussi' : ''), 'eyebrow');
  add(assignment, 'h2', exercise.title);
  add(assignment, 'p', exercise.prompt);
  renderBench(exercise);
  const pager = add(main, 'nav', undefined, 'pager');
  pager.setAttribute('aria-label', 'Exercices voisins');
  if (index > 0) link(pager, 'Exercice précédent', exerciseURL(exercises[index - 1].id));
  if (index + 1 < exercises.length) link(pager, 'Exercice suivant', exerciseURL(exercises[index + 1].id));
}
const schema = {
  VEHICULE: ['Code · entier · clé primaire', 'Type · texte', 'Marque · texte', 'Puissance · entier'],
  GARAGE: ['Code · entier · clé primaire', 'Nom · texte', 'Adresse · texte', 'Ville · texte', 'Cpostal · texte', 'Marque · texte'],
  PLAQUE: ['Immat · texte · clé primaire', 'CodeV · entier · clé étrangère', 'Nom · texte', 'Prenom · texte', 'Adresse · texte', 'Ville · texte', 'Cpostal · texte', 'Date · texte ISO']
};
async function renderSchema(name) {
  const selected = Object.hasOwn(schema, name) ? name : explored;
  explored = selected;
  const generation = routeGeneration;
  intro('Jeu d’essai du chapitre 10', 'Explorer la base', 'Sélectionnez une table pour consulter son schéma et ses enregistrements.');
  const diagram = add(main, 'div', undefined, 'schema');
  Object.entries(schema).forEach(([tableName, columns]) => {
    const tab = button(diagram, tableName, () => { location.hash = '#base/' + tableName; });
    tab.setAttribute('aria-pressed', String(tableName === selected));
    columns.forEach(column => add(tab, 'small', column));
  });
  const relation = add(main, 'section', undefined, 'card');
  add(relation, 'h2', 'Relations entre les tables');
  const edges = add(relation, 'ul', undefined, 'relations');
  add(edges, 'li', 'VEHICULE.Code (1) ← PLAQUE.CodeV (0 à plusieurs). Un modèle peut être référencé par plusieurs immatriculations.');
  add(edges, 'li', 'VEHICULE.Marque ↔ GARAGE.Marque. Plusieurs modèles et plusieurs garages peuvent partager une marque.');
  const join = add(relation, 'div', undefined, 'form-row');
  button(join, 'Essayer la jointure CodeV / Code', () => {
    state.drafts.libre = modules[7].exercises[0].sql;
    store();
    location.hash = '#libre';
  });
  button(join, 'Essayer la jointure sur Marque', () => {
    state.drafts.libre = modules[7].example;
    store();
    location.hash = '#libre';
  });
  const card = add(main, 'section', undefined, 'card');
  add(card, 'h2', selected);
  const records = add(card, 'div', 'Chargement des enregistrements…');
  try {
    const data = await query('SELECT * FROM ' + selected);
    if (generation === routeGeneration) {
      table(records, data.result, selected);
      add(card, 'p', data.result.rows.length + ' enregistrement(s)', 'muted');
    }
  } catch (error) {
    if (generation === routeGeneration) records.textContent = error.message;
  }
}

function renderProgress() {
  intro('Sauvegarde locale', 'Ma progression', 'Vos réponses et votre progression sont enregistrées dans le navigateur utilisé. Exportez le fichier JSON pour les transférer sur un autre appareil.');
  const card = add(main, 'section', undefined, 'card');
  add(card, 'h2', Object.keys(state.passed).length + ' exercices réussis sur ' + exercises.length);
  const status = add(card, 'p');
  status.role = 'status';
  status.id = 'storage-status';
  const row = add(card, 'div', undefined, 'form-row');
  button(row, 'Exporter en JSON', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'}));
    const anchor = make('a');
    anchor.href = url;
    anchor.download = 'progression-atelier-sql.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const file = add(row, 'input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.hidden = true;
  button(row, 'Importer un JSON', () => file.click());
  file.onchange = async () => {
    try {
      const selected = file.files[0];
      if (!selected || selected.size > 3_000_000) throw Error('Sélectionnez un fichier JSON de moins de 3 Mo.');
      const next = validate(JSON.parse(await selected.text()), ids);
      if (confirm('Remplacer la progression actuelle par celle du fichier ?')) {
        state = next;
        store();
        render();
        $('storage-status').textContent = 'Progression importée.';
      }
    } catch (error) { status.textContent = 'Import impossible. ' + error.message; }
    finally { file.value = ''; }
  };
  button(row, 'Réinitialiser ma progression', () => {
    if (confirm('Effacer les réponses, les tentatives et les requêtes sauvegardées sur ce navigateur ?')) {
      state = empty();
      store();
      render();
    }
  });
}

function render() {
  routeGeneration++;
  if (rejectPending) cancelPending();
  const hash = location.hash;
  const section = hash.split('/')[0];
  main.replaceChildren();
  const exercise = exercises.find(entry => hash === exerciseURL(entry.id)) ?? exercises.find(entry => entry.id === state.last);
  const practice = !['#base', '#libre', '#progression'].includes(section);
  document.querySelectorAll('.top nav a').forEach(a => {
    if (a.hash === (practice ? '#parcours' : section)) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (section === '#base') renderSchema(hash.split('/')[1]);
  else if (section === '#libre') {
    intro('Bac à sable', 'SQL libre', 'Explorez les trois tables et enregistrez vos requêtes. Exécutez un SELECT par lancement.');
    renderBench();
  } else if (section === '#progression') renderProgress();
  else {
    state.last = exercise.id;
    store();
    renderExercise(exercise);
  }
  navigation(practice ? exercise.id : undefined);
}
if (matchMedia('(max-width: 800px)').matches) $('navigation').open = false;
window.addEventListener('hashchange', () => {
  if (matchMedia('(max-width: 800px)').matches) $('navigation').open = false;
  render();
  main.focus({preventScroll: true});
  window.scrollTo(0, 0);
});
render();
