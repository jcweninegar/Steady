# Steady
ADHD support platform — a calming AI-powered home screen for brain dumps, task planning, and daily focus.

## Run & Operate
- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`
- **Migrate DB**: `node scripts/migrate.js`

## Stack
- React 18 + Vite 5
- Supabase (auth + PostgreSQL + row-level security)
- Anthropic API (planned — AI layer)
- Pure inline styles (no CSS framework)

## Where things live
- `src/App.jsx` — main app shell (~1565 lines)
- `src/main.jsx` — React entry + AuthProvider wrapper
- `src/lib/supabase.js` — Supabase client
- `src/lib/AuthContext.jsx` — auth state, signIn/signOut helpers
- `src/screens/AuthScreen.jsx` — login UI (Google OAuth + magic link)
- `scripts/migrate.js` — DB migration runner
- `vite.config.js` — Vite config (host 0.0.0.0, port 5000)

## Supabase Schema
Tables: `profiles`, `life_areas`, `captures`, `tasks`, `journal_entries`, `routine_logs`
All tables have RLS enabled — users can only access their own rows.
Auto-creates a profile row on new user signup via trigger.

## Architecture decisions
- Single-file React component design — all screens/sheets in `src/App.jsx`
- Auth gate: unauthenticated users see `AuthScreen`, authenticated users see the app
- Light/dark theme via `LIGHT`/`DARK` token objects passed as `T` prop throughout
- Bottom-sheet navigation pattern — features slide up above a persistent chat bar
- No external UI library — all components are custom inline-styled
- Migrations run via Supabase Management API using PAT (not hardcoded SQL in app)

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL (shared)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (shared)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (secret, server-side only)
- `SUPABASE_PAT` — Personal Access Token for running migrations (secret)

## Product
- Home screen: "What's on your mind?" with brain dump, plan, ask me anything
- Auth: Google OAuth + email magic link (no passwords)
- Task extraction & confirmation flow
- Plan view, Focus timer, Life map, Journal screens
- Dark/light mode toggle, Navigation drawer

## User preferences
- Imported from GitHub private repo (jcweninegar/Steady), dev branch
- Working through PRD section by section, saving checkpoints between sections

## Gotchas
- `allowedHosts: true` in vite.config.js required for Replit iframe proxying
- VITE_ prefix required for env vars accessible in frontend code
- Service role key must NEVER be exposed in frontend code
- App.jsx is a single large file — keep edits scoped carefully
