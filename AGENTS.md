# AGENTS.md

## Project

Hoyoverse account manager — Next.js 16 + Prisma + NextAuth.js. Manages game accounts with stats dashboard.

## Critical Commands

```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build (runs prisma migrate deploy first)
pnpm lint             # ESLint check
pnpm prisma migrate dev --name <name>  # Create database migration
pnpm prisma db seed   # Seed database
```

**Note:** `prisma generate` runs automatically on `postinstall`. After schema changes, restart dev server.

**Lint quirk:** `pnpm lint` (ESLint 10 + TypeScript 7.0.2) crashes with `TypeError: Cannot read properties of undefined (reading 'Cjs')` in `@typescript-eslint/typescript-estree` — a pre-existing toolchain incompatibility. Use `npx tsc --noEmit` to verify instead.

**Prisma config:** `prisma.config.ts` loads `.env` via Node's built-in `process.loadEnvFile()` (no `dotenv` dep). It does NOT auto-inject env — keep the `process.loadEnvFile()` call in that file, else `prisma migrate`/`db` fail with "Cannot resolve environment variable: DATABASE_URL".

## Design Constraints

- **Neobrutalism style**: Bold borders (2-4px solid black), bright saturated colors, raw/unpolished aesthetic, thick shadows, monospace or bold fonts
- **Do NOT add dependencies** without asking first
- Remove all blog/post-related functionality
- Transform auth pages to neobrutalism style
- **Dark mode**: manual toggle persisted to `localStorage` under key `hoyo-theme`, falls back to OS preference. Toggle (`app/ThemeToggle.tsx`) adds/removes `dark` class on `<html>`. Every page uses `dark:` variants; `prefers-color-scheme` media query is intentionally NOT used.

## Data Model

Source of truth: `prisma/schema.prisma`.

```prisma
model User {
  id             String     @id @default(cuid())
  name           String?
  email          String     @unique
  password       String
  sessionVersion Int        @default(0)   // bumped on password change
  webhook        String?                  // optional Discord webhook URL
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  accounts       Account[]
}

model Account {
  id          String   @id @default(cuid())
  name        String
  accountId   String   @unique
  cookieToken String   // stored; never sent to the client
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
// Note: Deleting a User cascade-deletes its Accounts (DB-level ON DELETE CASCADE)

model LoginAttempt {
  identifier  String
  windowStart DateTime
  count       Int
  updatedAt   DateTime @updatedAt

  @@id([identifier, windowStart])
}
```

## Required Pages

1. **Landing page** (`/`) — Simple hero section, neobrutalism style
2. **Auth pages** (`/login`, `/register`) — Neobrutalism styled forms
3. **Dashboard** (`/dashboard`) — Stats + account table
   - Stats: Total users, total accounts, current user's accounts
   - Table shows NAME / ACCOUNT ID / ACTIONS. The cookie token is **omitted** from the list query (`omit: { cookieToken: true }`) and fetched on demand via `getCookieToken` (show modal) — never shipped to the client.
   - Edit modal: name/accountId can be edited without re-entering the cookie token (leave blank to keep existing token; uses `updateAccountSchema`).
4. **Profile** (`/profile`) — Edit name/email/password + optional Discord `webhook` URL

## Security Notes

- **Rate-limited login**: `lib/rateLimit.ts` tracks up to `MAX_FAILURES` (5) failures per identifier per 15-min window via the `LoginAttempt` table. `auth.ts` wraps `recordFailure`/`recordSuccess`/`isBlocked` in try/catch (**fail-open**), so login still works if the table is missing pre-migration.
- **Session invalidation**: changing your password increments `User.sessionVersion`, invalidating existing sessions; the `jwt`/`session` callbacks re-fetch the user and empty the session if the version mismatches or the user is gone.
- **Security headers**: `next.config.ts` sets CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. `'unsafe-eval'` is in the CSP script-src **dev only**.

## Architecture

- **App Router** with server components by default
- **Prisma client singleton**: `lib/prisma.ts` — global caching in dev
- **Auth config**: `auth.ts` — NextAuth.js credentials provider
- **Path alias**: `@/*` maps to project root

## Environment Variables

Required in `.env`:
```
DATABASE_URL="prisma+postgres://..."
AUTH_SECRET="..."  # Generate: npx auth secret
```

## Key Files

- `prisma/schema.prisma` — Database schema
- `auth.ts` — NextAuth configuration
- `lib/prisma.ts` — Prisma client singleton
- `lib/env.ts` — Fail-fast required-env check (imported by `auth.ts` and `lib/prisma.ts`)
- `lib/rateLimit.ts` — Login rate limiting via the `LoginAttempt` table
- `lib/validation.ts` — zod schemas (`accountSchema` for create with required cookie; `updateAccountSchema` for edit with optional cookie) + `fieldErrors` helper
- `app/layout.tsx` — Root layout with providers
- `app/Header.tsx` — Navigation header
- `app/theme-provider.tsx` — `ThemeProvider` + `useTheme()` (dark mode)
- `app/ThemeToggle.tsx` — Dark mode toggle button
- `app/theme-init.ts` — Inline pre-hydration script (prevents flash) injected in `layout.tsx`
