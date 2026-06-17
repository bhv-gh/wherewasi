// Identity, mirrored from the oneui pattern: the user types a secret once, we
// SHA-256 it, store the hash in localStorage, and send it as the `x-user-hash`
// header on every Supabase request. RLS policies scope rows to that hash.
const HASH_KEY = 'wwi-user-hash';

export async function hashSecret(secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getUserHash() {
  return localStorage.getItem(HASH_KEY) || '';
}

export function setUserHash(hash) {
  localStorage.setItem(HASH_KEY, hash);
}

export function clearUserHash() {
  localStorage.removeItem(HASH_KEY);
}
