import React, { useMemo } from 'react';
import { addDays, format, startOfDay, isWithinInterval, isSameDay } from 'date-fns';
import { getCountry } from '../lib/countries';
import { isDateCovered } from '../lib/schengen';

// Horizontal, swipeable strip of upcoming days. Tap a day to start a range, tap
// another to complete it. Days already covered by a logged trip show that
// country's flag.
export default function DayStrip({ days = 14, trips, selStart, selEnd, onPick }) {
  const today = startOfDay(new Date());
  const list = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(today, i)),
    [days, today.getTime()] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const inRange = (d) => {
    if (selStart && selEnd) return isWithinInterval(d, { start: selStart, end: selEnd });
    if (selStart) return isSameDay(d, selStart);
    return false;
  };

  const coveringTrip = (d) =>
    (trips || []).find((t) => isDateCovered([t], d));

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {list.map((d) => {
        const selected = inRange(d);
        const cover = coveringTrip(d);
        const flag = cover ? getCountry(cover.country_code).flag : null;
        return (
          <button
            key={d.toISOString()}
            onClick={() => onPick(d)}
            className={[
              'flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 transition',
              selected
                ? 'border-accent bg-accent text-white shadow'
                : 'border-slate-200 bg-white text-slate-700',
            ].join(' ')}
          >
            <span className="text-[10px] font-medium uppercase opacity-70">
              {format(d, 'EEE')}
            </span>
            <span className="text-lg font-bold leading-tight">{format(d, 'd')}</span>
            <span className="text-[10px] opacity-70">{format(d, 'MMM')}</span>
            <span className="mt-0.5 h-4 text-xs">{flag || ''}</span>
          </button>
        );
      })}
    </div>
  );
}
