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
- **Clerk 500 / Missing publishableKey:** Runtime env must include `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (or `CLERK_PUBLISHABLE_KEY` with the same `pk_` value) and `CLERK_SECRET_KEY`. No quotes around values. After changing env, **restart** the container.
- **Webhook signing secret:** Prefer Clerk's official env name `CLERK_WEBHOOK_SIGNING_SECRET=whsec_...`. The app still accepts legacy `CLERK_WEBHOOK_SECRET`, but new deployments should use the canonical name.
- **Clerk encryption_key_missing / 502 on start:** When `CLERK_SECRET_KEY` is set in Docker, also set `CLERK_ENCRYPTION_KEY` (generate once: `openssl rand -base64 32`). Use the **same** value in local `.env.local` and Dokploy. Without it, the container entrypoint exits → **502 Bad Gateway**.
- **Web app:** set `NEXT_PUBLIC_APP_URL` to your **coach app** URL (e.g. `https://app.example.com`), not the marketing domain. If this is missing at build time, the site may build but “Get Started” links fall back to `http://localhost:3001`.

`NEXT_PUBLIC_*` values are baked into the Next.js bundle at build time.

## Health checks

| App | Path |
|-----|------|
| Coach | `/api/health` |
| Web | `/` |

## Site does not load (domain valid, 502 / timeout)

1. **Container port** in Dokploy must be **3000** (matches `EXPOSE` in Dockerfile).
2. **HOSTNAME / bind address:** Docker sets `HOSTNAME` to the container id at runtime. Next.js uses `HOSTNAME` as the listen address unless overridden — Traefik then cannot reach the app (502). `Dockerfile.web` forces `HOSTNAME=0.0.0.0` in `CMD`; the coach app entrypoint exports the same value before starting Next.js. If you are running an older coach image, redeploy after pulling the current entrypoint fix; adding only an env var does not repair the old broken startup command.
3. **Logs:** Dokploy → Application → Logs. Look for `Ready on http://...:3000` or crash loops (missing `CLERK_SECRET_KEY`, etc.).
4. **Health URL:** `https://your-app-domain/api/health` — should return JSON even before login.

## Clerk (app only)

Webhook URL: `https://app.your-domain.com/api/webhooks/clerk`

Allowed origins / redirects: your `NEXT_PUBLIC_APP_URL`.

## Supabase (app only)

Run SQL migrations `002`–`011` — see `docs/supabase/README.md`.
