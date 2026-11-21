const key = 'atelier-sql-bts-cg-v1';
export const empty = () => ({version: 1, last: '1-1', drafts: {}, attempts: {}, passed: {}, saved: []});
export function validate(input, ids) {
  if (input?.version !== 1) throw Error('Format de progression non reconnu.');
  const result = empty();
  if (ids.includes(input.last)) result.last = input.last;
  for (const id of [...ids, 'libre']) {
    const draft = input.drafts?.[id];
    if (typeof draft === 'string') result.drafts[id] = draft.slice(0, 20000);
    if (id === 'libre') continue;
    const attempts = input.attempts?.[id];
    if (Number.isSafeInteger(attempts) && attempts >= 0) result.attempts[id] = attempts;
    if (input.passed?.[id] === true) result.passed[id] = true;
  }
  if (Array.isArray(input.saved)) result.saved = input.saved.filter(x => typeof x === 'string' && x.length <= 20000).slice(0, 20);
  return result;
}
export function restore(storage, ids) {
  try { return validate(JSON.parse(storage.getItem(key)), ids); }
  catch { return empty(); }
}
export function persist(storage, state) {
  try { storage.setItem(key, JSON.stringify(state)); return true; }
  catch { return false; }
}
