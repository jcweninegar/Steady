# Teleport

**See your money in space and time — not on a spreadsheet.**

Teleport (formal: Teleport Financial) is a phone-first PWA that holds a household's
whole financial life and renders it across time. The core idea is a vertical timeline
of life events: add, move, or toggle an event — pay off a card, sell a rental, buy a
house, a raise starts — and the whole picture recomputes from today to retirement.
That recompute *is* the product; it's the "teleport."

The destination is **retirement at age 67**, funded for the life the household actually
wants to be living. The engine answers, plainly: *Can I get there on my current income?*
— and if not, *what would it take?*

See `docs/TeleportVersionX.md` for the full master spec (product, money model, stack,
design system, and build operating system).

## Stack
- React 18 + Vite
- Supabase — Auth (magic link / Google), Postgres + RLS, edge functions for secrets
- Plaid — bank data (planned)
- Anthropic Claude — classification & the Porter assistant (the math is always code, never the model)
- Hosted on Cloudflare Pages (auto-redeploys on push)

## Run
- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Where things live
- `src/main.jsx` — React entry + AuthProvider
- `src/App.jsx` — auth gate → renders the app
- `src/TeleportApp.jsx` — the full Teleport UX (locked prototype: Home, Plan/reports, Lifestyle visual & onboarding)
- `src/lib/supabase.js` — Supabase client
- `src/lib/AuthContext.jsx` — passwordless auth (magic link + Google), devBypass
- `src/screens/AuthScreen.jsx` — sign-in UI

## Design system (locked)
Palette: `#111111 #444444 #767676 #ABABAB #FFFFFF #FAFAF8 #F1F1ED #E3E3DE #C42B1C #9A9A9A`.
No boxes, no fills behind cards, no shadows, no gradients, no off-palette color. Hairlines
and whitespace do the work. Numbers are tabular and right-aligned. Attention is a small red
dot, never an exclamation point.
