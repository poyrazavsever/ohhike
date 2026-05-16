# Dokploy deployment (OhHike monorepo)

Two **separate** Dokploy applications from the same Git repo `poyrazavsever/ohhike`.

| Service | Domain example | Dockerfile | Port |
|---------|----------------|------------|------|
| Coach app | `app.example.com` | `Dockerfile` | 3000 |
| Marketing web | `www.example.com` | `Dockerfile.web` | 3000 |

## Critical settings (both apps)

| Setting | Value |
|---------|--------|
| **Repository** | `github.com/poyrazavsever/ohhike` |
| **Branch** | `master` (or your default) |
| **Build context / root path** | `.` (repo root, **not** `apps/app`) |
| **Build type** | **Dockerfile** (not Nixpacks auto-detect) |
| **Install / build command** | Leave empty (Dockerfile handles it) |

Using root = `apps/app` causes `npm i` + `workspace:*` errors.

## Environment variables

- Use `deploy/dokploy.env.app.example` for the **app** service.
- Use `deploy/dokploy.env.web.example` for the **web** service.
- In Dokploy, enable **pass env to build** (or build-time env) so `NEXT_PUBLIC_*` are available during `docker build`.

`NEXT_PUBLIC_*` values are baked into the Next.js bundle at build time.

## Health checks

| App | Path |
|-----|------|
| Coach | `/api/health` |
| Web | `/` |

## Clerk (app only)

Webhook URL: `https://app.your-domain.com/api/webhooks/clerk`

Allowed origins / redirects: your `NEXT_PUBLIC_APP_URL`.

## Supabase (app only)

Run SQL migrations `002`–`011` — see `docs/supabase/README.md`.
