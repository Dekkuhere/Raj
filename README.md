# Raj Sharma – Portfolio

## Setup
1. `npm install`
2. Create a Supabase project.
3. In the Supabase SQL Editor, run `supabase/schema.sql`.
4. Copy `.env.example` to `.env.local` and add your Supabase Project URL and anon/publishable key.
5. `npm run dev`

Portfolio content is stored in `src/data/defaults.js`. Supabase is only used for shared visitor, vote, and Bug Sweeper win counts; it does not provide an admin editor or require visitor accounts. Visitors are counted by a browser ID, so counts are approximate and can be reset or manipulated. Without Supabase credentials, Bug Sweeper stats fall back to the current visitor's browser.

## Structure
src/pages (Home, Work, Personal, Resume, Contribute/Bug Sweeper) · src/components ·
src/data/defaults.js (portfolio content) · src/lib/api.js (Bug Sweeper stats)

Deploy: Vercel/Netlify (`npm run build`, output `dist`, add the two Supabase environment variables).
