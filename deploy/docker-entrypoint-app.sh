#!/bin/sh
set -e

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] && [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
  export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$CLERK_PUBLISHABLE_KEY"
fi

missing=""
for key in \
  CLERK_SECRET_KEY \
  NEXT_PUBLIC_SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_ANON_KEY \
  SUPABASE_SERVICE_ROLE_KEY; do
  eval "val=\$$key"
  if [ -z "$val" ]; then
    missing="$missing $key"
  fi
done

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  missing="$missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
fi

if [ -n "$CLERK_SECRET_KEY" ] && [ -z "$CLERK_ENCRYPTION_KEY" ]; then
  echo "ohhike-app: CLERK_ENCRYPTION_KEY is required when CLERK_SECRET_KEY is set (Docker/runtime)."
  echo "Generate one: openssl rand -base64 32"
  exit 1
fi

if [ -n "$missing" ]; then
  echo "ohhike-app: missing required env:$missing"
  echo "Set them in Dokploy → Environment, then redeploy or restart the container."
  exit 1
fi

export HOSTNAME=0.0.0.0
exec node apps/app/server.js
