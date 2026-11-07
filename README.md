# hoyo

Hoyo frontend — Vite + React + TypeScript (neobrutalist UI).

API lives in separate repo: https://github.com/hoyotod/hoyo-api

## Quickstart

```bash
cp .env.example .env  # set VITE_API_URL (default http://localhost:8787 via proxy)
pnpm install
pnpm dev    # :5173, proxies /api -> 8787
pnpm build
pnpm deploy # → Cloudflare Pages hoyo.pages.dev
```

## Pages

- `/` — Landing hero
- `/login` — Login
- `/register` — Register
- `/dashboard` — Stats + accounts table
- `/profile` — Edit name/email/password/webhook
