# HoyoAccount

A **Hoyoverse account manager** — manage your HoYo game accounts (account IDs + cookie tokens) in one place with a stats dashboard. Built with a bold **neobrutalism** UI and an optional manual **dark mode**.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [React 19](https://react.dev)
- [NextAuth.js v4](https://next-auth.js.org) — credentials authentication
- [Prisma 7](https://www.prisma.io/orm) + Postgres (`@prisma/adapter-pg`)
- [zod](https://zod.dev) — form validation
- [lucide-react](https://lucide.dev) — icons
- Tailwind CSS 4
- [pnpm](https://pnpm.io) — package manager

## Features

- **Authentication** — register and log in with email + password (credentials provider).
- **Dashboard** — stats for total users, total accounts, and your accounts, plus a table of your accounts.
- **Account management** — add, edit, and delete accounts; view/copy a stored cookie token on demand.
- **Profile** — edit your name, email, and password, and set an optional **Discord webhook URL**.
- **Security** — rate-limited login attempts, session invalidation on password change, session freshness checks, and security headers. Cookie tokens are stored but **never shipped to the client** — fetched on demand.
- **Dark mode** — manual toggle persisted to `localStorage` (`hoyo-theme`), falling back to OS preference.
- **Neobrutalism design** — bold borders, bright saturated colors, thick shadows, monospace accents.

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

`prisma generate` runs automatically on `postinstall`.

### 2. Configure environment variables

Create a `.env` file at the project root:

```bash
DATABASE_URL="prisma+postgres://..."   # your Postgres connection string
AUTH_SECRET="..."                      # generate: npx auth secret
```

### 3. Migrate the database

```bash
pnpm prisma migrate deploy
```

### 4. (Optional) Seed the database

```bash
pnpm prisma db seed
```

The seed refuses to run in production. In development it creates demo users and prints random `dev-*` generated passwords.

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Model

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
  accountId   String   @unique            // game account ID
  cookieToken String                      // stored, never sent to the client
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model LoginAttempt {
  identifier  String                     // email
  windowStart DateTime
  count       Int
  updatedAt   DateTime @updatedAt

  @@id([identifier, windowStart])
}
```

## Pages

| Route        | Description                                       |
| ------------ | ------------------------------------------------- |
| `/`          | Landing page (neobrutalism hero)                  |
| `/login`     | Sign in                                           |
| `/register`  | Create an account                                 |
| `/dashboard` | Stats + your accounts table                       |
| `/profile`   | Edit profile and optional Discord webhook         |

## Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Start the dev server                          |
| `pnpm build`            | Production build (runs `prisma migrate deploy`) |
| `pnpm start`            | Start the production server                   |
| `pnpm lint`             | ESLint check (currently broken, see below)    |
| `pnpm prisma migrate dev --name <name>` | Create a migration            |

> **Note:** `pnpm lint` currently crashes due to an ESLint 10 + TypeScript 7.0.2 toolchain incompatibility. Use `npx tsc --noEmit` to verify types instead.
