const PREFIX = 'adsignal.workspace.';
const INDEX_KEY = 'adsignal.workspace.index';

function storageOrThrow(storage) {
  if (!storage) throw new Error('Browser storage is unavailable.');
  return storage;
}

export function saveWorkspace(workspace, storage = globalThis.localStorage) {
  const target = storageOrThrow(storage);
  const id = String(workspace.id || crypto?.randomUUID?.() || `ws-${Date.now()}`);
  const saved = { ...workspace, id, updatedAt: new Date().toISOString() };
  target.setItem(`${PREFIX}${id}`, JSON.stringify(saved));

  const index = listWorkspaces(target).filter((item) => item.id !== id);
  index.unshift({ id, name: saved.name || 'Untitled workspace', updatedAt: saved.updatedAt });
  target.setItem(INDEX_KEY, JSON.stringify(index.slice(0, 20)));
  return saved;
}

export function loadWorkspace(id, storage = globalThis.localStorage) {
  const target = storageOrThrow(storage);
  const raw = target.getItem(`${PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function listWorkspaces(storage = globalThis.localStorage) {
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(INDEX_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteWorkspace(id, storage = globalThis.localStorage) {
  const target = storageOrThrow(storage);
  target.removeItem(`${PREFIX}${id}`);
  const index = listWorkspaces(target).filter((item) => item.id !== id);
  target.setItem(INDEX_KEY, JSON.stringify(index));
}
