// Schengen 90/180 compliance engine. Pure functions, no I/O — this is the part
// that must be correct, so it's covered by unit tests in schengen.test.js.
//
// Counting modes:
//   'anytime'  — present at ANY moment of a calendar day => the day counts.
//                This is the official Schengen interpretation: both the entry
//                day and the exit day count as full days. Default (safest).
//   'midnight' — a day counts only if you were present at 00:00 of that day
//                ("nights slept"). More lenient.
import {
  parseISO,
  startOfDay,
  eachDayOfInterval,
  format,
  subDays,
  addDays,
  isAfter,
  isBefore,
} from 'date-fns';
import { getCountry, isSchengen } from './countries';

const fmt = (d) => format(d, 'yyyy-MM-dd');

function isSchengenTrip(trip) {
  if (typeof trip.is_schengen === 'boolean') return trip.is_schengen;
  return isSchengen(trip.country_code);
}

// Effective leave instant for a trip. An open-ended trip (no leave_at) is
// treated as ongoing up to `asOf`.
function effectiveLeave(trip, asOf) {
  return trip.leave_at ? parseISO(trip.leave_at) : asOf;
}

// The set of calendar dates (yyyy-MM-dd) that a single trip contributes under
// the given counting mode.
export function tripDates(trip, mode, asOf = new Date()) {
  if (!trip.arrive_at) return [];
  const arrive = parseISO(trip.arrive_at);
  const leave = effectiveLeave(trip, asOf);
  if (isAfter(arrive, leave)) return [];

  const days = eachDayOfInterval({ start: startOfDay(arrive), end: startOfDay(leave) });
  const out = [];
  for (const day of days) {
    const sod = startOfDay(day);
    if (mode === 'midnight') {
      // Present at 00:00 of this date?  arrive <= sod <= leave
      if (!isAfter(arrive, sod) && !isAfter(sod, leave)) out.push(fmt(sod));
    } else {
      out.push(fmt(sod)); // 'anytime'
    }
  }
  return out;
}

// Union of counted dates across many trips. Dedupes overlapping trips so a day
// is never counted twice.
export function countedDateSet(trips, mode, { schengenOnly = false, asOf = new Date() } = {}) {
  const set = new Set();
  for (const t of trips || []) {
    if (schengenOnly && !isSchengenTrip(t)) continue;
    for (const d of tripDates(t, mode, asOf)) set.add(d);
  }
  return set;
}

// Schengen 90/180 usage as of `asOf`.
export function schengenUsage(trips, mode, asOf = new Date()) {
  const windowDays = 180;
  const total = 90;
  const today = startOfDay(asOf);
  const windowStart = subDays(today, windowDays - 1); // inclusive trailing 180 days

  const set = countedDateSet(trips, mode, { schengenOnly: true, asOf });
  const inWindow = [...set]
    .filter((ds) => {
      const d = parseISO(ds);
      return !isBefore(d, windowStart) && !isAfter(d, today);
    })
    .sort();

  const used = inWindow.length;
  const remaining = Math.max(0, total - used);

  // The earliest counted day leaves the window `windowDays` after it occurred,
  // which is when one day of allowance is regained.
  const nextResetDate = inWindow.length ? addDays(parseISO(inWindow[0]), windowDays) : null;

  return {
    used,
    remaining,
    total,
    windowDays,
    windowStart,
    asOf: today,
    nextResetDate,
    datesInWindow: inWindow,
    overstay: used > total,
  };
}

// Per-country day totals for the dashboard, sorted most days first.
export function perCountry(trips, mode, asOf = new Date()) {
  const map = new Map();
  for (const t of trips || []) {
    const dates = tripDates(t, mode, asOf);
    if (!dates.length) continue;
    if (!map.has(t.country_code)) map.set(t.country_code, new Set());
    const s = map.get(t.country_code);
    dates.forEach((d) => s.add(d));
  }
  const rows = [];
  for (const [code, s] of map.entries()) {
    const c = getCountry(code);
    rows.push({ code, name: c.name, flag: c.flag, schengen: c.schengen, days: s.size });
  }
  rows.sort((a, b) => b.days - a.days);
  return rows;
}

// Is a given calendar date already covered by a logged trip?  Used to suppress
// the daily "where are you?" prompt for days we already have data for.
export function isDateCovered(trips, date, asOf = new Date()) {
  const target = startOfDay(date);
  return (trips || []).some((t) => {
    if (!t.arrive_at) return false;
    const arrive = startOfDay(parseISO(t.arrive_at));
    const leave = startOfDay(effectiveLeave(t, asOf));
    return !isBefore(target, arrive) && !isAfter(target, leave);
  });
}
