import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { hashSecret, setUserHash } from '../utils/userHash';
import { resetClient } from '../api/supabaseClient';

// First-run identity. The user types a secret passphrase; we hash it and use the
// hash as their account key (same scheme as oneui). Enter the same secret on any
// device to sync.
export default function AuthGate({ onReady }) {
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (secret.trim().length < 4) return;
    setBusy(true);
    const hash = await hashSecret(secret);
    setUserHash(hash);
    resetClient();
    setBusy(false);
    onReady();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white">
        <MapPin size={30} />
      </div>
      <h1 className="text-2xl font-extrabold">Where Was I</h1>
      <p className="mb-6 mt-1 text-center text-sm text-slate-500">
        Track your travel days and stay visa-compliant. Enter a secret passphrase — use the same one
        on any device to sync.
      </p>
      <form onSubmit={submit} className="w-full max-w-xs">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret passphrase"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || secret.trim().length < 4}
          className="mt-3 w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
        >
          {busy ? 'Setting up…' : 'Continue'}
        </button>
      </form>
      <p className="mt-4 max-w-xs text-center text-xs text-slate-400">
        There's no password recovery — remember your passphrase. It never leaves your device in
        plain form.
      </p>
    </div>
  );
}
