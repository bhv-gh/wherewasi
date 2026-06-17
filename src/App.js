import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, isBefore } from 'date-fns';
import { Settings as SettingsIcon, MapPin } from 'lucide-react';

import { getUserHash, clearUserHash } from './utils/userHash';
import { resetClient } from './api/supabaseClient';
import { listTrips, saveTrip, getSettings, saveSettings, flushPending } from './api/client';
import { schengenUsage, perCountry } from './lib/schengen';

import AuthGate from './components/AuthGate';
import DayStrip from './components/DayStrip';
import TripModal from './components/TripModal';
import SchengenGauge from './components/SchengenGauge';
import CountryList from './components/CountryList';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [authed, setAuthed] = useState(!!getUserHash());
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [settings, setSettings] = useState(null);

  const [selStart, setSelStart] = useState(null);
  const [selEnd, setSelEnd] = useState(null);
  const [tripModal, setTripModal] = useState(null); // { start, end, initialCountry }
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mode = settings?.counting_mode || 'anytime';

  const reload = useCallback(async () => {
    const [t, s] = await Promise.all([listTrips(), getSettings()]);
    setTrips(t);
    setSettings(s);
    setLoading(false);
  }, []);

  // Init: load data.
  useEffect(() => {
    if (authed) reload();
    else setLoading(false);
  }, [authed, reload]);

  // Flush queued writes when back online.
  useEffect(() => {
    const onOnline = () => flushPending().then(reload);
    window.addEventListener('online', onOnline);
    if (authed) flushPending();
    return () => window.removeEventListener('online', onOnline);
  }, [authed, reload]);

  // ── Derived data ──
  const usage = useMemo(() => schengenUsage(trips, mode), [trips, mode]);
  const countryRows = useMemo(() => perCountry(trips, mode), [trips, mode]);

  // ── Day strip range selection ──
  const handlePick = (d) => {
    const day = startOfDay(d);
    if (!selStart || (selStart && selEnd)) {
      setSelStart(day);
      setSelEnd(null);
    } else if (isBefore(day, selStart)) {
      setSelStart(day);
    } else {
      setSelEnd(day);
    }
  };

  const clearSelection = () => {
    setSelStart(null);
    setSelEnd(null);
  };

  const openLogModal = () => {
    setTripModal({ start: selStart, end: selEnd || selStart, initialCountry: null });
  };

  const handleSaveTrip = async (data) => {
    const trip = { id: uuidv4(), source: 'manual', ...data };
    await saveTrip(trip);
    setTrips((prev) => [trip, ...prev]);
    setTripModal(null);
    clearSelection();
  };

  const handleSignOut = () => {
    clearUserHash();
    resetClient();
    setSettingsOpen(false);
    setAuthed(false);
    setTrips([]);
    setSettings(null);
  };

  const changeMode = (m) => saveSettings({ counting_mode: m }).then(setSettings);

  // ── Render ──
  if (!authed) return <AuthGate onReady={() => setAuthed(true)} />;
  if (loading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <MapPin size={18} />
          </div>
          <h1 className="text-lg font-extrabold">Where Was I</h1>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* Quick log */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Log a trip
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          Tap a start day, then an end day, then add the country.
        </p>
        <DayStrip trips={trips} selStart={selStart} selEnd={selEnd} onPick={handlePick} />
        {selStart && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={openLogModal}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
            >
              Add country for selected days
            </button>
            <button
              onClick={clearSelection}
              className="rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-500"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Dashboard */}
      <div className="space-y-4">
        <SchengenGauge usage={usage} />
        <CountryList rows={countryRows} mode={mode} onModeChange={changeMode} />
      </div>

      {/* Modals */}
      {tripModal && (
        <TripModal
          startDate={tripModal.start}
          endDate={tripModal.end}
          initialCountry={tripModal.initialCountry}
          onSave={handleSaveTrip}
          onClose={() => setTripModal(null)}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(u) => saveSettings(u).then(setSettings)}
          onClose={() => setSettingsOpen(false)}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
