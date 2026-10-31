# Raj Sharma – Portfolio (React + Vite + Supabase)

## Setup
1. `npm install`
2. Create a project at supabase.com → **SQL Editor** → paste & run `supabase/schema.sql`
   (first change `notraj2006@gmail.com` in `is_admin()` if you'll log in with another email).
3. Supabase → **Authentication → Users → Add user** (your email + a password).
   Then Authentication → Providers → Email → turn **off** "Allow new users to sign up".
4. `cp .env.example .env` and fill in **Project URL** + **anon key** (Settings → API).
5. `npm run dev`

## Editing your site
Open `/#admin` and log in:
- **Connect links** – change URLs, labels, icons, add/remove, reorder
- **Projects** – add a project (shows on Home + Work), edit, reorder, delete
- **Resume & profile** – upload a new PDF (or paste a link), preview image, name, tagline

Without a `.env` the site still works using the defaults in `src/data/defaults.js`.

## Structure
src/pages (Home, Work, Personal, Resume, Contribute/Bug Sweeper) · src/components (+ admin/) ·
src/lib/api.js (all Supabase calls) · supabase/schema.sql (tables, RLS, stats functions, storage)

Deploy: Vercel/Netlify (`npm run build`, output `dist`, add the two env vars).
