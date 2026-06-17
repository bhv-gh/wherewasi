import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { X, Search } from 'lucide-react';
import { searchCountries, getCountry } from '../lib/countries';

// Modal to log a trip: pick a country, set arrive time (on the first day) and
// leave time (on the last day).
export default function TripModal({ startDate, endDate, initialCountry, onSave, onClose }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState(initialCountry || null);
  const [arriveTime, setArriveTime] = useState('12:00');
  const [leaveTime, setLeaveTime] = useState('12:00');

  const results = useMemo(() => searchCountries(query).slice(0, 8), [query]);

  const start = startDate;
  const end = endDate || startDate;

  const combine = (date, time) => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const canSave = !!country;

  const handleSave = () => {
    if (!country) return;
    onSave({
      country_code: country.code,
      country_name: country.name,
      is_schengen: country.schengen,
      arrive_at: combine(start, arriveTime),
      leave_at: combine(end, leaveTime),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Log a trip</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {format(start, 'EEE, d MMM')}
          {end && end.getTime() !== start.getTime() ? ` → ${format(end, 'EEE, d MMM')}` : ''}
        </p>

        {/* Country picker */}
        {country ? (
          <button
            onClick={() => setCountry(null)}
            className="mb-4 flex w-full items-center gap-2 rounded-xl border border-accent bg-blue-50 px-3 py-2 text-left"
          >
            <span className="text-2xl">{country.flag}</span>
            <span className="font-medium">{country.name}</span>
            {country.schengen && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                SCHENGEN
              </span>
            )}
          </button>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country…"
                className="w-full text-sm outline-none"
              />
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto">
              {results.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountry(c);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-sm">{c.name}</span>
                  {c.schengen && (
                    <span className="ml-auto text-[10px] font-semibold text-accent">SCHENGEN</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Times */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Arrive ({format(start, 'd MMM')})</span>
            <input
              type="time"
              value={arriveTime}
              onChange={(e) => setArriveTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Leave ({format(end, 'd MMM')})</span>
            <input
              type="time"
              value={leaveTime}
              onChange={(e) => setLeaveTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>

        <button
          disabled={!canSave}
          onClick={handleSave}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-40"
        >
          Save trip
        </button>
      </div>
    </div>
  );
}

export { getCountry };
