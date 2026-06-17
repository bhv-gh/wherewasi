import React from 'react';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

// Schengen 90/180 summary: a progress bar of days used out of 90, days
// remaining, and when allowance next frees up.
export default function SchengenGauge({ usage }) {
  const { used, remaining, total, nextResetDate, overstay } = usage;
  const pct = Math.min(100, Math.round((used / total) * 100));
  const barColor = overstay ? 'bg-danger' : remaining <= 15 ? 'bg-warn' : 'bg-ok';

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Schengen 90 / 180
        </h2>
        <span className="text-xs text-slate-400">rolling 180 days</span>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-extrabold ${overstay ? 'text-danger' : 'text-ink'}`}>
          {remaining}
        </span>
        <span className="mb-1 text-sm text-slate-500">days left of {total}</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{used} days used</span>
        {nextResetDate && <span>+1 day on {format(nextResetDate, 'd MMM')}</span>}
      </div>

      {overstay && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          <AlertTriangle size={16} />
          Over the 90-day limit — you may be non-compliant.
        </div>
      )}
    </div>
  );
}
