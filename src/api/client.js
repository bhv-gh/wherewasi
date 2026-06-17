import { getSupabase } from './supabaseClient';
import { getUserHash } from '../utils/userHash';
import {
  saveCache,
  loadCache,
  enqueuePendingOp,
  getPendingOps,
  savePendingOps,
} from '../utils/offlineStorage';
import { isSchengen } from '../lib/countries';

// Offline-first data access. Reads hit Supabase and fall back to the local
// cache; writes are optimistic — they update the cache immediately and queue a
// pending op if the network call fails, to be flushed on reconnect.

const TRIPS_CACHE = 'trips';
const SETTINGS_CACHE = 'settings';

const DEFAULT_SETTINGS = {
  home_country: 'IN',
  counting_mode: 'anytime',
};

// ── Trips ──────────────────────────────────────────────────

export async function listTrips() {
  const supabase = getSupabase();
  if (!supabase) return loadCache(TRIPS_CACHE) || [];
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_hash', getUserHash())
      .order('arrive_at', { ascending: false });
    if (error) throw error;
    saveCache(TRIPS_CACHE, data);
    return data;
  } catch (err) {
    console.warn('listTrips offline, using cache:', err.message);
    return loadCache(TRIPS_CACHE) || [];
  }
}

function upsertCachedTrip(trip) {
  const trips = loadCache(TRIPS_CACHE) || [];
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) trips[idx] = { ...trips[idx], ...trip };
  else trips.unshift(trip);
  trips.sort((a, b) => (a.arrive_at < b.arrive_at ? 1 : -1));
  saveCache(TRIPS_CACHE, trips);
  return trips;
}

export async function saveTrip(trip) {
  const row = {
    id: trip.id,
    user_hash: getUserHash(),
    country_code: trip.country_code,
    country_name: trip.country_name,
    is_schengen: typeof trip.is_schengen === 'boolean' ? trip.is_schengen : isSchengen(trip.country_code),
    arrive_at: trip.arrive_at,
    leave_at: trip.leave_at || null,
    source: trip.source || 'manual',
    updated_at: new Date().toISOString(),
  };
  upsertCachedTrip(row); // optimistic
  const supabase = getSupabase();
  if (!supabase) {
    enqueuePendingOp({ type: 'saveTrip', payload: row });
    return row;
  }
  try {
    const { error } = await supabase.from('trips').upsert(row, { onConflict: 'id' });
    if (error) throw error;
  } catch (err) {
    console.warn('saveTrip queued (offline):', err.message);
    enqueuePendingOp({ type: 'saveTrip', payload: row });
  }
  return row;
}

export async function deleteTrip(id) {
  const trips = (loadCache(TRIPS_CACHE) || []).filter((t) => t.id !== id);
  saveCache(TRIPS_CACHE, trips);
  const supabase = getSupabase();
  if (!supabase) {
    enqueuePendingOp({ type: 'deleteTrip', payload: { id } });
    return;
  }
  try {
    const { error } = await supabase.from('trips').delete().eq('id', id).eq('user_hash', getUserHash());
    if (error) throw error;
  } catch (err) {
    console.warn('deleteTrip queued (offline):', err.message);
    enqueuePendingOp({ type: 'deleteTrip', payload: { id } });
  }
}

// ── Settings ───────────────────────────────────────────────

export async function getSettings() {
  const supabase = getSupabase();
  if (!supabase) return { ...DEFAULT_SETTINGS, ...(loadCache(SETTINGS_CACHE) || {}) };
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_hash', getUserHash())
      .maybeSingle();
    if (error) throw error;
    const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
    saveCache(SETTINGS_CACHE, merged);
    return merged;
  } catch (err) {
    console.warn('getSettings offline, using cache:', err.message);
    return { ...DEFAULT_SETTINGS, ...(loadCache(SETTINGS_CACHE) || {}) };
  }
}

export async function saveSettings(updates) {
  const current = { ...DEFAULT_SETTINGS, ...(loadCache(SETTINGS_CACHE) || {}) };
  const merged = { ...current, ...updates };
  saveCache(SETTINGS_CACHE, merged);
  const row = {
    user_hash: getUserHash(),
    home_country: merged.home_country,
    counting_mode: merged.counting_mode,
    updated_at: new Date().toISOString(),
  };
  const supabase = getSupabase();
  if (!supabase) {
    enqueuePendingOp({ type: 'saveSettings', payload: row });
    return merged;
  }
  try {
    const { error } = await supabase.from('user_settings').upsert(row, { onConflict: 'user_hash' });
    if (error) throw error;
  } catch (err) {
    console.warn('saveSettings queued (offline):', err.message);
    enqueuePendingOp({ type: 'saveSettings', payload: row });
  }
  return merged;
}

// ── Sync ───────────────────────────────────────────────────

export async function flushPending() {
  const supabase = getSupabase();
  if (!supabase) return;
  const ops = getPendingOps();
  if (!ops.length) return;
  const remaining = [];
  for (const op of ops) {
    try {
      if (op.type === 'saveTrip') {
        const { error } = await supabase.from('trips').upsert(op.payload, { onConflict: 'id' });
        if (error) throw error;
      } else if (op.type === 'deleteTrip') {
        const { error } = await supabase
          .from('trips')
          .delete()
          .eq('id', op.payload.id)
          .eq('user_hash', getUserHash());
        if (error) throw error;
      } else if (op.type === 'saveSettings') {
        const { error } = await supabase
          .from('user_settings')
          .upsert(op.payload, { onConflict: 'user_hash' });
        if (error) throw error;
      }
    } catch (err) {
      console.warn('flushPending op failed, keeping queued:', err.message);
      remaining.push(op);
    }
  }
  savePendingOps(remaining);
}
