# AGENTS.md

## Project

Hoyo frontend — Vite + React + TypeScript. Companion API in separate repo: `hoyo-api` (Cloudflare Workers + Hono + D1).

## Critical Commands

```bash
pnpm dev    # vite dev on :5173 (proxies /api -> 8787)
pnpm build  # tsc -b && vite build
pnpm deploy # build + wrangler pages deploy
```

Always use `pnpm` (never `npm`/`npx`).

## Design Constraints

- **Neobrutalism style**: Bold borders (3px solid black), bright saturated colors, raw/unpolished aesthetic, thick shadows (`shadow-neo`), monospace or Archivo Black fonts
- **Do NOT add dependencies** without asking first
- Remove all blog/post-related functionality (n/a frontend)
- **Dark mode**: manual toggle persisted to `localStorage` under key `hoyo-theme`, falls back to OS preference. Toggle (`src/components/ThemeToggle.tsx`) adds/removes `dark` class on `<html>`. Every page uses `dark:` variants; `prefers-color-scheme` media query is intentionally NOT used except for initial read in `theme.tsx` and inline script in `index.html`.

## Required Pages

1. **Landing** (`/`) — Simple hero section, neobrutalism style
2. **Auth** (`/login`, `/register`) — Neobrutalism styled forms, calls `POST /api/auth/sign-{in,up}/email`
3. **Dashboard** (`/dashboard`) — Stats + account table (NAME / ACCOUNT ID / ACTIONS). Cookie token fetched on demand via `GET /api/accounts/:id/token` in modal — never in table. Edit modal: leave cookie blank to keep existing.
4. **Profile** (`/profile`) — Edit name/email/password + optional Discord `webhook` URL via `GET/PUT /api/users/me`

## Data Flow

- `src/lib/auth-client.ts` — better-auth client with `baseURL` from `VITE_API_URL`
- `src/lib/api.ts` — typed fetch wrappers for `/api/*`, `credentials: "include"`
- `src/lib/theme.tsx` — `ThemeProvider` + `useTheme()` (dark mode)

## Environment Variables

Required in `.env`:
```
VITE_API_URL="https://hoyo-api.haiueom.workers.dev"
```

## Key Files

- `vite.config.ts` — Vite + proxy `/api` -> `http://localhost:8787`
- `tailwind.config.js` — neobrutalist tokens, `darkMode: "class"`
- `src/index.css` — Tailwind + `.neo-*` component classes
- `index.html` — inline theme-init script (prevents flash), fonts, favicon
- `src/main.tsx` — router + ThemeProvider
- `src/App.tsx` — routes, Header + footer
- `src/components/Header.tsx` — nav + ThemeToggle + auth state
- `src/components/ThemeToggle.tsx` — dark mode toggle button
- `src/components/ProtectedRoute.tsx` — redirects to `/login` if no session
- `src/components/Modal.tsx` — generic modal
- `src/pages/` — Landing, Login, Register, Dashboard, Profile
