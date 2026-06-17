import { getUserHash } from './userHash';

// Lightweight offline-first cache + pending-ops queue, mirrored from oneui.
// All keys are scoped to the current user hash so switching identity never
// leaks data.

function scopedKey(prefix, key) {
  const hash = getUserHash();
  const scope = hash ? hash.slice(0, 12) : 'anon';
  return `wwi-${prefix}-${scope}-${key}`;
}

export function saveCache(key, data) {
  try {
    localStorage.setItem(scopedKey('cache', key), JSON.stringify(data));
  } catch (err) {
    console.error('saveCache failed:', err);
  }
}

export function loadCache(key) {
  try {
    const raw = localStorage.getItem(scopedKey('cache', key));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('loadCache failed:', err);
    return null;
  }
}

// ── Pending operations queue (flushed when back online) ──

const PENDING = 'pending-ops';

export function getPendingOps() {
  try {
    const raw = localStorage.getItem(scopedKey('q', PENDING));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingOps(ops) {
  try {
    if (!ops.length) localStorage.removeItem(scopedKey('q', PENDING));
    else localStorage.setItem(scopedKey('q', PENDING), JSON.stringify(ops));
  } catch (err) {
    console.error('savePendingOps failed:', err);
  }
}

export function enqueuePendingOp(op) {
  const ops = getPendingOps();
  ops.push(op);
  savePendingOps(ops);
}
