import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { searchCountries, getCountry } from '../lib/countries';

// Settings: home country, counting-mode default, and sign out.
export default function SettingsModal({ settings, onSave, onClose, onSignOut }) {
  const [homeQuery, setHomeQuery] = useState('');
  const home = getCountry(settings.home_country);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Home country */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-slate-600">Home country</label>
          <button
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left"
            onClick={() => setHomeQuery(homeQuery ? '' : ' ')}
          >
            <span className="text-xl">{home.flag}</span>
            <span>{home.name}</span>
            <span className="ml-auto text-xs text-accent">change</span>
          </button>
          {homeQuery !== '' && (
            <div className="mt-1">
              <input
                autoFocus
                value={homeQuery.trim()}
                onChange={(e) => setHomeQuery(e.target.value || ' ')}
                placeholder="Search country…"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              />
              <div className="mt-1 max-h-40 overflow-y-auto">
                {searchCountries(homeQuery).slice(0, 8).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSave({ home_country: c.code });
                      setHomeQuery('');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="text-lg">{c.flag}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Counting mode default */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Day counting (default)
          </label>
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-sm font-medium">
            {['anytime', 'midnight'].map((m) => (
              <button
                key={m}
                onClick={() => onSave({ counting_mode: m })}
                className={`flex-1 rounded-xl px-3 py-2 ${
                  settings.counting_mode === m ? 'bg-white text-ink shadow' : 'text-slate-500'
                }`}
              >
                {m === 'anytime' ? 'Any time counts' : '12am rule'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-medium text-slate-600"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
