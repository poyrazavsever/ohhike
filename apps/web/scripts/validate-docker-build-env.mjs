#!/usr/bin/env node

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

if (!appUrl) {
  console.error("NEXT_PUBLIC_APP_URL is required at web image build time.");
  process.exit(1);
}

let parsed;

try {
  parsed = new URL(appUrl);
} catch {
  console.error("NEXT_PUBLIC_APP_URL must be an absolute URL.");
  process.exit(1);
}

if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
  console.error("NEXT_PUBLIC_APP_URL must use http or https.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && parsed.hostname === "localhost") {
  console.error("NEXT_PUBLIC_APP_URL cannot point to localhost in production.");
  process.exit(1);
}

console.log(`web-build-env: NEXT_PUBLIC_APP_URL=${parsed.origin}`);
