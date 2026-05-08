# Steady
ADHD support platform — a calming AI-powered home screen for brain dumps, task planning, and daily focus.

## Run & Operate
- **Dev**: `npm run dev` (port 5000)
- **API Server**: `node server.js` (port 3001)
- **Build**: `npm run build`
- **Migrate DB**: `node scripts/migrate.js`

## Stack
- React 18 + Vite 5
- Supabase (auth + PostgreSQL + row-level security)
- Anthropic claude-opus-4-5 via Express proxy (`server.js`)
- Pure inline styles (no CSS framework)

## Where things live
- `src/App.jsx` — main app shell (~1930 lines); all screens inline
- `src/main.jsx` — React entry + AuthProvider wrapper
- `src/lib/supabase.js` — Supabase client
- `src/lib/AuthContext.jsx` — auth state, signIn/signOut, devBypass
- `src/screens/AuthScreen.jsx` — login UI (Google OAuth + magic link)
- `server.js` — Express AI proxy: /api/extract, /api/refine, /api/braindump-chat, /api/chat, /api/journal, /api/top3
- `knowledge/index.js` — imports all knowledge modules, exports combined `knowledgeBase` string
- `knowledge/adhd-core.js` — ADHD literature review knowledge base (distilled from 25 peer-reviewed sources)
- `scripts/migrate.js` — DB migration runner
- `vite.config.js` — Vite config (host 0.0.0.0, port 5000, /api proxy → 3001)

## Supabase Schema
Tables: `profiles`, `life_areas`, `captures`, `tasks`, `journal_entries`, `routine_logs`
All tables have RLS enabled — users can only access their own rows.
Auto-creates a profile row on new user signup via trigger.

## Architecture decisions
- Single-file React component design — all screens/sheets in `src/App.jsx`
- **Card** = a task item (checkbox + label + tap-to-detail). `TaskCard` component used everywhere tasks appear
- **Block** = an expandable container of Cards (Morning Routine, Startup, Work Block, Shutdown, Evening)
- Auth gate: unauthenticated users see `AuthScreen`, authenticated users see the app
- Light/dark theme via `LIGHT`/`DARK` token objects passed as `T` prop throughout
- Bottom-sheet navigation pattern — features slide up above a persistent chat bar
- No external UI library — all components are custom inline-styled
- Migrations run via Supabase Management API using PAT (not hardcoded SQL in app)

## Plan view
- **Today tab**: observation → reflective question → 3 confirmation slots → Top 10 candidates (confirm/unconfirm, AI suggests) → See All (collapsible, filter chips: All/Urgent/area/Parked)
- **Calendar tab**: real time grid 6am–10pm, 80px/hr. All blocks absolute-positioned. Blocks are:
  - Draggable (grab body to move up/down the grid, snaps 15-min)
  - Expandable (tap chevron to see cards inside with checkboxes)
  - Resizable (Work Block only — bottom handle)
  - Block positions stored in `blockOffsets` state (minutes delta from default)

## Onboarding
- Detected via `steady_onboarded` localStorage flag
- New users see `OnboardingScreen` (2 screens: name → 3 pillars)
- On complete: sets flag, clears tasks/captures, lands on home

## Reset routine (Stuck?)
- Home screen chip: "Stuck?" → opens chat with "I'm feeling stuck…" context
- TaskSheet: "Feeling stuck? Get unstuck →" button → closes task, opens chat with task label as context

## Voice visual
- When `isListening=true`, home content replaces heading with `VoiceVisual` component
- Shows last 10 words fading to opacity=0.12, animated dots below

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL (shared)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (shared)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (secret, server-side only)
- `SUPABASE_PAT` — Personal Access Token for running migrations (secret)
- `ANTHROPIC_API_KEY` — Claude API key (secret, server-side only)

## Product
- Home screen: "What's on your mind?" with brain dump, plan, ask me anything
- Auth: Google OAuth + email magic link (no passwords)
- Task extraction & confirmation flow
- Plan view (Agenda + Calendar), Focus timer, Life map, Journal screens
- Dark/light mode toggle, Navigation drawer

## User preferences
- Imported from GitHub private repo (jcweninegar/Steady), dev branch
- Working through PRD section by section, saving checkpoints between sections
- Architecture naming: **Card** = task, **Block** = expandable container of cards

## Data persistence
- **Tasks**: localStorage (instant) + Supabase `tasks` table (debounced 1.5s). On first login, any existing localStorage tasks are pushed up. On subsequent logins from a new device, Supabase is the source of truth. Sync key: `(user_id, client_id)` where `client_id = String(Date.now())`.
- **Captures**: localStorage only (`steady_captures`).
- **Life Map**: localStorage (`steady_lifemap`) on every `areas` state change + Supabase `life_areas` upsert on sheet close. Loads from Supabase on mount when userId is available.
- **Journal entries**: localStorage (`steady_entry_YYYY-MM-DD`) + Supabase `journal_entries` upsert (triggered on narrative generate, rating set, notes save).
- **Chat history**: localStorage only (`steady_chat_YYYY-MM-DD`).

## Gotchas
- `allowedHosts: true` in vite.config.js required for Replit iframe proxying
- VITE_ prefix required for env vars accessible in frontend code
- Service role key + Anthropic key must NEVER be exposed in frontend code
- App.jsx is a single large file — keep edits scoped carefully
- `T.muted` in dark mode is nearly invisible; use `T.sub` for readable secondary text
- devBypass in AuthContext skips auth for testing ("Skip for now" link on auth screen)
