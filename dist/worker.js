importScripts('./vendor/sql-wasm.js');
const started = import('./worker.mjs');
self.onmessage = async event => {
  try {
    await started;
    self.onmessage(event);
  } catch (error) {
    self.postMessage({error: 'Impossible de démarrer SQLite. ' + error.message});
  }
};
