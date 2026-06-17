import React from 'react';

// Per-country day totals with the counting-mode toggle.
export default function CountryList({ rows, mode, onModeChange }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Days per country
        </h2>
        <div className="flex rounded-full bg-slate-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => onModeChange('anytime')}
            className={`rounded-full px-3 py-1 ${
              mode === 'anytime' ? 'bg-white text-ink shadow' : 'text-slate-500'
            }`}
          >
            Any time
          </button>
          <button
            onClick={() => onModeChange('midnight')}
            className={`rounded-full px-3 py-1 ${
              mode === 'midnight' ? 'bg-white text-ink shadow' : 'text-slate-500'
            }`}
          >
            12am rule
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No trips yet. Log one above to get started.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.code} className="flex items-center gap-3 py-2.5">
              <span className="text-2xl">{r.flag}</span>
              <span className="font-medium">{r.name}</span>
              {r.schengen && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  SCHENGEN
                </span>
              )}
              <span className="ml-auto text-sm font-semibold">
                {r.days} <span className="font-normal text-slate-400">days</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
