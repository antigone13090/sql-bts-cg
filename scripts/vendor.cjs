const {copyFileSync, mkdirSync} = require('node:fs');
const {dirname, join} = require('node:path');
const vendor = join(__dirname, '..', 'dist', 'vendor');
const assets = dirname(require.resolve('sql.js'));
mkdirSync(vendor, {recursive: true});
for (const filename of ['sql-wasm.js', 'sql-wasm.wasm']) {
  copyFileSync(join(assets, filename), join(vendor, filename));
}
