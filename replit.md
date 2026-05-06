# Steady
ADHD support platform — a calming AI-powered home screen for brain dumps, task planning, and daily focus.

## Run & Operate
- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`

## Stack
- React 18 + Vite 5
- Pure inline styles (no CSS framework)
- No backend — fully client-side

## Where things live
- `src/App.jsx` — entire application (single-file component, ~1560 lines)
- `src/main.jsx` — React entry point
- `index.html` — HTML shell
- `vite.config.js` — Vite config (host 0.0.0.0, port 5000)

## Architecture decisions
- Single-file React component design — all screens, sheets, and state live in `src/App.jsx`
- Light/dark theme via `LIGHT`/`DARK` token objects passed as `T` prop throughout
- Bottom-sheet navigation pattern — each feature slides up as a draggable sheet above a persistent chat bar
- No external UI library — all components are custom inline-styled

## Product
- Home screen with "What's on your mind?" prompt
- Brain dump, Ask me anything, Take me to my plan quick-start options
- Chat interface for capturing thoughts
- Task extraction & confirmation flow
- Plan view with task management
- Focus timer & life map screens
- Dark/light mode toggle
- Navigation drawer

## User preferences
- Imported from GitHub private repo (jcweninegar/Steady), dev branch

## Gotchas
- App is a single large JSX file — keep edits scoped carefully
- `allowedHosts: true` in vite.config.js is required for Replit iframe proxying
