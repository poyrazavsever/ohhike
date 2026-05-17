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

const coachNetwork = process.env.NEXT_PUBLIC_COACH_NETWORK_ENABLED?.trim() ?? "(unset)";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim();
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

console.log(`web-build-env: NEXT_PUBLIC_APP_URL=${parsed.origin}`);
console.log(`web-build-env: NEXT_PUBLIC_COACH_NETWORK_ENABLED=${coachNetwork}`);

if (webUrl) {
  console.log(`web-build-env: NEXT_PUBLIC_WEB_URL=${new URL(webUrl).origin}`);
} else {
  console.warn(
    "web-build-env: NEXT_PUBLIC_WEB_URL is unset — login redirects may use 0.0.0.0 without proxy fix.",
  );
}

if (
  process.env.NODE_ENV === "production" &&
  coachNetwork !== "true" &&
  coachNetwork !== "1"
) {
  console.warn(
    "web-build-env: Coach Network is OFF in this image (navbar/routes will look outdated).",
  );
}

if (coachNetwork === "true" || coachNetwork === "1") {
  const missingCoachNetworkVars = [
    ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", clerkPublishableKey],
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingCoachNetworkVars.length > 0) {
    console.error(
      `web-build-env: missing required Coach Network build vars: ${missingCoachNetworkVars.join(", ")}`,
    );
    process.exit(1);
  }

  if (!clerkPublishableKey?.startsWith("pk_")) {
    console.error(
      "web-build-env: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be a Clerk publishable key starting with pk_.",
    );
    process.exit(1);
  }
}
