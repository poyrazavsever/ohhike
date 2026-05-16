#!/usr/bin/env node
/**
 * Docker build: NEXT_PUBLIC_* should be passed as build-args for optimal client bundles.
 * Server/middleware still read runtime env via lib/clerk-env.ts if build-args are empty.
 */
const buildPublicKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
];

const missing = buildPublicKeys.filter((key) => !process.env[key]?.trim());

if (missing.length === 0) {
  console.log("docker-build-env: all NEXT_PUBLIC_* build variables are set.");
  process.exit(0);
}

console.warn(
  "docker-build-env: missing at image build (set in Dokploy build-time env / build-args):",
  missing.join(", "),
);
console.warn(
  "docker-build-env: add the same keys to Dokploy runtime env and redeploy; Clerk/Supabase use runtime reads on the server.",
);
process.exit(0);
