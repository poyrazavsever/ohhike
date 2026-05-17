#!/usr/bin/env node
/** Docker build: NEXT_PUBLIC_* must be passed as build args for client bundles. */
const buildPublicKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
];

const missing = buildPublicKeys.filter((key) => !process.env[key]?.trim());
const revenueCatEnabled = process.env.NEXT_PUBLIC_REVENUECAT_ENABLED === "true";

if (revenueCatEnabled && !process.env.NEXT_PUBLIC_REVENUECAT_API_KEY?.trim()) {
  missing.push("NEXT_PUBLIC_REVENUECAT_API_KEY");
}

if (missing.length === 0) {
  console.log("docker-build-env: all NEXT_PUBLIC_* build variables are set.");
  process.exit(0);
}

console.error(
  "docker-build-env: missing at image build (set in Dokploy build-time env / build-args):",
  missing.join(", "),
);
process.exit(1);
