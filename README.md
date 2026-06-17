# Where Was I

A mobile-first PWA to track your travel days per country and stay **Schengen
90/180** compliant. Swipe to select a date range, log the country and your
arrive/leave times, and see days-used vs days-remaining update instantly.

## Features

- **Swipe-to-log** — pick a start day and end day on a horizontal day strip,
  then add the country and arrive/leave times.
- **Schengen 90/180 gauge** — days used and remaining over the rolling 180-day
  window, with an overstay warning.
- **Per-country day counts** with a toggle between two counting modes:
  - **Any time counts** — present at any moment of a day counts it (official
    Schengen rule: entry and exit days both count). Default.
  - **12am rule** — a day counts only if you were present at midnight.
- **Cloud sync + offline-first** — data lives in Supabase; writes are optimistic
  and queued when offline.
- **Installable PWA** — add to your iPhone Home Screen for an app-like
  experience.

## Tech

Create React App (React 19), Tailwind CSS, `date-fns`, `lucide-react`, and
Supabase (Postgres + Row Level Security). Identity uses a passphrase → SHA-256
hash sent as an `x-user-hash` header; RLS scopes every row to that hash.

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + publishable key
npm start
```

Then set up the database — see [`supabase/SETUP.md`](supabase/SETUP.md) (run
`supabase/migrations/0001_init.sql` in the Supabase SQL editor).

## Scripts

- `npm start` — dev server
- `npm test` — unit tests (the Schengen engine is fully covered in
  `src/lib/schengen.test.js`)
- `npm run build` — production build

## Compliance disclaimer

This is a personal tracking aid, not legal advice. Day counts use your device's
local timezone. Always verify against official sources before relying on it.
