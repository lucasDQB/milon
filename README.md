# Milon

A minimal gym progress tracker — log workouts, sets and reps, bodyweight,
and personal records. Next.js (App Router) + Supabase + Tailwind, deployed
on Vercel.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the tables
   (`profiles`, `workouts`, `workout_exercises`, `sets`, `body_metrics`),
   indexes, and row-level security policies so each user can only see
   their own data.
3. Go to **Settings → API** and copy the **Project URL** and **anon public
   key**.
4. In **Authentication → Providers**, email/password is enabled by
   default — that's all this app uses. (Optional: turn off "Confirm
   email" in **Authentication → Settings** while developing, so sign-up
   logs you straight in.)

## 2. Run locally

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the
login screen, since every route except `/login` requires a session.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Milon"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub
   repo.
2. Add the two environment variables from `.env.local` under
   **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Every push to `main` will auto-redeploy from then on.
4. Back in Supabase, add your Vercel domain (and
   `http://localhost:3000` for local dev) to **Authentication → URL
   Configuration → Redirect URLs**, so auth redirects work in
   production.

## Project structure

```
src/
  app/
    login/            sign in / sign up
    workout/new/       creates a workout row, redirects into it
    workout/[id]/       active workout logging screen
    history/            past finished workouts
    profile/             bodyweight chart, log-weight form, PRs
    auth/callback/       Supabase email-confirmation redirect
  components/
    BottomNav.tsx         four-tab bottom navigation
  lib/
    supabase/client.ts    browser Supabase client
    supabase/server.ts    server Supabase client (Server Components)
    types.ts               shared TypeScript types
  middleware.ts            refreshes session, redirects signed-out users
supabase/
  schema.sql                tables + RLS policies + auto-profile trigger
```

## Notes / next steps

- Exercise names are free text for now — an exercise catalog with
  autocomplete would be a natural next addition.
- PRs are computed as "heaviest completed weight per exercise name" —
  simple but works well once you're logging consistently.
- No image/avatar upload yet; `profiles.display_name` is set
  automatically from the email on sign-up.
