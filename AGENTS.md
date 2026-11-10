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
- **Theme**: light only (dark theme removed). Sky palette via CSS vars in `src/index.css` (`:root` + `@theme inline`), Tailwind v4 (`@tailwindcss/vite`).

## Required Pages

1. **Landing** (`/`) — Simple hero section, neobrutalism style
2. **Auth** (`/login`, `/register`) — Neobrutalism styled forms, calls `POST /api/auth/sign-{in,up}/email`
3. **Dashboard** (`/dashboard`) - Stats + account table (NAME / ACCOUNT ID / ACTIONS). Cookie token fetched on demand via `GET /api/accounts/:id/token` in modal - never in table. Edit modal: leave cookie blank to keep existing. The cookie field takes only the `cookie_token_v2` value (single string like `v2_CAQSDGRlOG9...`), not a full cookie string.
4. **Profile** (`/profile`) - Edit name/email/password + optional Discord `webhook` URL and `telegramChatId` via `GET/PUT /api/users/me`

## Data Flow

- `src/lib/auth-client.ts` — better-auth client with `baseURL` from `VITE_API_URL`
- `src/lib/api.ts` — typed fetch wrappers for `/api/*`, `credentials: "include"`
- `src/components/ui/*` — neobrutalism.dev (shadcn/Base UI) components + `src/lib/utils.ts` (`cn`)

## Environment Variables

Required in `.env`:
```
VITE_API_URL="https://hoyo-api.haiueom.workers.dev"
```

## Key Files

- `vite.config.ts` — Vite + proxy `/api` -> `http://localhost:8787`
- `src/index.css` — Tailwind v4 (`@import "tailwindcss"`, `@theme inline` sky tokens)
- `index.html` — fonts, favicon
- `src/main.tsx` — router
- `src/App.tsx` — routes, Header + footer
- `src/components/Header.tsx` — nav + auth state
- `src/components/ProtectedRoute.tsx` — redirects to `/login` if no session
- `src/components/Modal.tsx` — generic modal
- `src/pages/` — Landing, Login, Register, Dashboard, Profile
