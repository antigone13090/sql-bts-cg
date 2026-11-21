export function execute(db, sql) {
  if (typeof sql !== 'string' || sql.length > 20000) throw Error('Limite de 20 000 caractères.');
  const tokens = /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[[^\]]*\]|\s+|;|[A-Za-z_][A-Za-z_0-9]*|[^\s]/g;
  let first, ended = false;
  for (const [token] of sql.matchAll(tokens)) {
    if (/^(?:\s|--|\/\*)/.test(token)) continue;
    if (token === ';') {
      if (first) ended = true;
      continue;
    }
    if (ended) throw Error('Exécutez une seule requête à la fois.');
    first ??= token.toUpperCase();
  }
  if (!first) throw Error('Saisissez une requête SQL.');
  if (first !== 'SELECT' && first !== 'WITH') {
    throw Error('Seules les requêtes de lecture SELECT sont autorisées.');
  }
  const statement = db.prepare(sql.replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/|;)*/, ''));
  try {
    const columns = statement.getColumnNames();
    if (!columns.length) throw Error('La requête doit produire un tableau SELECT.');
    const rows = [];
    while (statement.step()) {
      if (rows.length >= 1000) throw Error('Plus de 1 000 lignes. Ajoutez un filtre ou LIMIT pour réduire le résultat.');
      rows.push(statement.get().map(cell => {
        if ((typeof cell === 'string' || cell instanceof Uint8Array) && cell.length > 10000) throw Error('Une cellule dépasse 10 000 caractères.');
        return cell;
      }));
    }
    return {columns, rows};
  } finally {
    statement.free();
  }
}

const cellKey = value => JSON.stringify(value instanceof Uint8Array ? ['blob', [...value]] : value);
const rowKey = row => JSON.stringify(row.map(cellKey));

export function compare(actual, expected, exercise) {
  if (actual.columns.length !== expected.columns.length)
    return 'Nombre de colonnes différent. Attendu : ' + expected.columns.length + '.';
  for (const alias of exercise.aliases ?? []) {
    const index = expected.columns.indexOf(alias);
    if (actual.columns[index]?.toLowerCase() !== alias.toLowerCase())
      return 'Vérifiez le nom de la colonne ' + (index + 1) + '. Alias demandé : ' + alias + '.';
  }
  if (actual.rows.length !== expected.rows.length)
    return 'Nombre de lignes différent. Attendu : ' + expected.rows.length + ', obtenu : ' + actual.rows.length + '. Vérifiez les filtres, les jointures ou les doublons.';
  const left = actual.rows.map(rowKey), right = expected.rows.map(rowKey);
  if (exercise.ordered && left.every((row, i) => row === right[i])) return '';
  left.sort();
  right.sort();
  if (!left.every((row, i) => row === right[i])) return 'Certaines valeurs diffèrent. Vérifiez les colonnes choisies, leur ordre et vos conditions.';
  return exercise.ordered ? 'Les lignes sont correctes. Vérifiez le sens et les critères du tri.' : '';
}

export function createDatabase(SQL, base, variant = '') {
  const db = new SQL.Database();
  db.run(base);
  if (variant) db.run(variant);
  db.run('PRAGMA query_only = ON;');
  return db;
}
