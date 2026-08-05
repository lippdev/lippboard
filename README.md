# Lipp Board

Lipp Board is an **open-source personal PWA** built for daily use on desktop and mobile, with a strong focus on:

- **PWA-first behavior**: installable, app-like, touch-friendly
- **Mobile-first UX**: works well on iPhone and small screens
- **Personal productivity**: tasks, notes, goals, calendar, files, mood, GitHub, and AI bridge
- **Secure access**: password login, backend sessions, and Face ID / passkey support
- **Self-hosting**: designed to run on a VPS or private server

The goal is to feel like a real personal operating surface, not a demo app.

## Why this project exists

This started as my personal board for organizing day-to-day work, but it’s also meant to be a reusable base for anyone who wants a private, mobile-friendly PWA with:

- a real backend
- persistent auth
- offline-friendly app shell
- Face ID / passkey login on iPhone
- a clean, dark interface

## Screens at a glance

The app includes:

- Home dashboard
- GitHub panel
- Tasks
- Thoughts / notes
- Languages tracker
- Calendar
- Goals
- File board
- Mood tracker
- AI command bridge
- Settings with profile, password, Face ID, theme, and maintenance actions

## Tech stack

- **Frontend:** React 19 + Vite
- **Backend:** Node.js HTTP server
- **Database:** SQLite (`node:sqlite`)
- **Auth:** password + server session + WebAuthn / passkeys
- **PWA:** service worker, manifest, install prompt, Apple touch icon
- **Icons/UI:** Lucide React

## Features

### PWA-first

- Installable on iPhone, Android, and desktop
- App shell that behaves like a native app
- Mobile dock and sidebar optimized for touch
- Safe-area support for notch / home indicator devices
- Service worker and manifest included in the production build

### Authentication

- First-run bootstrap account
- Password login
- Server-side session cookie
- Password change flow
- Face ID / Touch ID via passkeys when available
- Auto Face ID login when a passkey is already registered

### Personal project mode

- Settings page for profile and appearance
- GitHub token storage for app integrations
- Reset / maintenance actions
- Mobile-friendly layout for daily use

## Project structure

```text
src/
  components/      # shell UI and shared controls
  modules/         # each app area as a module screen
  services/        # backend, PWA, auth, and storage helpers
  styles/          # theme and shell styling
server/
  index.js         # production backend + SQLite + auth APIs
public/
  sw.js            # service worker source
mcp/
  lippboard-mcp.js # MCP bridge for local automation
```

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Start the backend

```bash
npm start
```

### 3) Run the smoke check

```bash
npm test
```

### 4) Open the app

- Local default: `http://localhost:4174`
- Production / deployed URL: your domain or reverse proxy

## First-time setup tutorial

1. Open the app.
2. Create the first account during the bootstrap screen.
3. Log in with password.
4. Go to **Configurações**.
5. Register Face ID / passkey on your iPhone.
6. Install the PWA from Safari / browser install flow.
7. Use the app like a native mobile surface.

## Face ID / passkey tutorial

On iPhone, Face ID is handled through the browser’s passkey support.

### To make it work well:

- Open the app over HTTPS
- Use a real domain, not a raw IP, if you want a smoother passkey flow
- Register the passkey once from **Configurações**
- After that, the app can auto-attempt Face ID on login when a passkey exists

### Fallback behavior

If Face ID is unavailable, the app falls back to password login.

## PWA install tutorial

### On iPhone

1. Open the app in Safari.
2. Tap the share button.
3. Choose **Add to Home Screen**.
4. Open it from the home screen icon.

### On Android / desktop

1. Open the app in a supported browser.
2. Use the install prompt or browser menu.
3. Launch it as a standalone app.

## Local development

```bash
npm run dev
```

This starts the Vite frontend for development.

## Production run

```bash
npm run build
npm start
npm test
```

- `npm run build` generates the production PWA bundle
- `npm start` runs the SQLite-backed server that serves the built app
- `npm test` runs a small smoke check against the server

## Environment notes

The server listens on:

- `PORT`
- or `LIPPBOARD_PORT`
- optional `LIPPBOARD_DB_PATH` for a custom SQLite file path
- default: `4174`

Useful production notes:

- Put it behind HTTPS for passkeys / Face ID
- Use a reverse proxy like nginx or Caddy
- Keep the app on a stable domain so the PWA and auth stay consistent

## Backend endpoints

A few useful endpoints:

- `GET /api/health`
- `GET /api/auth/status`
- `POST /api/auth/bootstrap`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/password`
- `POST /api/auth/webauthn/register/options`
- `POST /api/auth/webauthn/register/verify`
- `POST /api/auth/webauthn/login/options`
- `POST /api/auth/webauthn/login/verify`
- `GET /api/state`
- `PUT /api/state`
- `POST /api/state/reset`

## Maintenance

### Reset local app data

Use the settings page reset action when you want to clear stored local state.

### Cache / stale UI

Because this is a PWA, stale service-worker cache can make changes look missing.
If something looks wrong after a deploy:

1. hard refresh
2. clear the site data
3. reinstall the PWA if needed
4. verify the server is serving the latest build

## Contributing

This is a personal project, but contributions are welcome.

If you open a PR:

- keep the diff small
- preserve the PWA-first direction
- avoid adding dependencies unless they clearly reduce complexity
- test on mobile layouts when relevant

## Roadmap ideas

These are ideas, not promises:

- more polished onboarding
- better mobile keyboard handling
- richer offline behavior
- more project-specific widgets
- optional theme presets
- extra docs for self-hosting and deployment

## License

MIT — see the [LICENSE](./LICENSE) file.

## Author

Filipe Moreira — personal project, open source, PWA-first.
