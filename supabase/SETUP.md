# Supabase setup for Where Was I

## 1. Create the tables + RLS  ✅ (done)

Supabase Dashboard → **SQL Editor** → run `supabase/migrations/0001_init.sql`.

This creates `trips`, `user_settings`, `push_subscriptions`, and the RLS
policies that scope every row to the `x-user-hash` header the app sends (same
scheme as oneui).

> The `push_subscriptions` table and the `notif_*` columns on `user_settings`
> are unused now that notifications are removed — harmless to leave in place.

## 2. Run the app

```bash
npm start
```

Enter a passphrase, log a trip — data persists to Supabase and syncs to any
device using the same passphrase.

## 3. (Optional) Install as a PWA on iPhone

1. Open the deployed site in **Safari** → Share → **Add to Home Screen**.
2. Open it from the Home Screen icon for a full-screen, app-like experience.
